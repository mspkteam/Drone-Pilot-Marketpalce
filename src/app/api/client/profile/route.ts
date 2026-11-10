import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import {
  getClientProfileByUserId,
  mergeClientProfilePreferences,
  serializeBillingAddress,
  serializeClientProfilePreferences,
  toClientProfileDto,
} from "@/lib/client/profile";
import { validateClientProfileInput } from "@/lib/client/validation";
import { prisma } from "@/lib/db";

export async function GET() {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: toClientProfileDto(profile) });
}

export async function POST(request: Request) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    const body = await request.json();
    const validated = validateClientProfileInput(body, {
      requireAllForOnboarding: !!body.completeOnboarding,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const now = new Date();
    const completing = !!data.completeOnboarding;
    const contactName =
      data.contactName?.trim() ||
      data.companyName?.trim() ||
      "Client";

    // Admin member views may auto-create a draft ClientProfile. Treat POST as
    // create-or-update so the client's first Save never dies on a unique clash.
    const existing = await getClientProfileByUserId(authResult.userId);
    if (existing) {
      const mergedPreferences =
        data.preferences !== undefined
          ? mergeClientProfilePreferences(
              existing.preferencesJson,
              data.preferences,
            )
          : undefined;
      const completingExisting =
        completing && !existing.onboardingCompletedAt;

      const profile = await prisma.clientProfile.update({
        where: { userId: authResult.userId },
        data: {
          companyName: data.companyName,
          contactName,
          phone: data.phone,
          billingAddress: serializeBillingAddress(data.billingAddress),
          ...(mergedPreferences !== undefined && {
            preferencesJson:
              serializeClientProfilePreferences(mergedPreferences),
          }),
          ...(completingExisting && {
            onboardingCompletedAt: now,
            status: "active",
          }),
        },
      });

      return NextResponse.json({ profile: toClientProfileDto(profile) });
    }

    const profile = await prisma.clientProfile.create({
      data: {
        userId: authResult.userId,
        companyName: data.companyName,
        contactName,
        phone: data.phone,
        billingAddress: serializeBillingAddress(data.billingAddress),
        preferencesJson:
          data.preferences !== undefined
            ? serializeClientProfilePreferences(data.preferences)
            : null,
        onboardingCompletedAt: completing ? now : null,
        status: completing ? "active" : "draft",
      },
    });

    return NextResponse.json(
      { profile: toClientProfileDto(profile) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/client/profile POST]", error);
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    const message =
      code === "P2002"
        ? "A client profile already exists for this account. Refresh and try again."
        : "Failed to create profile. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const existing = await getClientProfileByUserId(authResult.userId);
  if (!existing) {
    return NextResponse.json(
      { error: "No profile found. Complete onboarding first." },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const validated = validateClientProfileInput(body, {
      requireAllForOnboarding: !!body.completeOnboarding,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const now = new Date();
    const completing =
      !!data.completeOnboarding && !existing.onboardingCompletedAt;

    const mergedPreferences =
      data.preferences !== undefined
        ? mergeClientProfilePreferences(
            existing.preferencesJson,
            data.preferences,
          )
        : undefined;

    const profile = await prisma.clientProfile.update({
      where: { userId: authResult.userId },
      data: {
        ...(data.companyName !== undefined && {
          companyName: data.companyName,
        }),
        ...(data.contactName !== undefined && {
          contactName: data.contactName,
        }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.billingAddress !== undefined && {
          billingAddress: serializeBillingAddress(data.billingAddress),
        }),
        ...(mergedPreferences !== undefined && {
          preferencesJson: serializeClientProfilePreferences(mergedPreferences),
        }),
        ...(completing && {
          onboardingCompletedAt: now,
          status: "active",
        }),
      },
    });

    return NextResponse.json({ profile: toClientProfileDto(profile) });
  } catch (error) {
    console.error("[api/client/profile PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 },
    );
  }
}
