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

  const existing = await getClientProfileByUserId(authResult.userId);
  if (existing) {
    return NextResponse.json(
      { error: "Profile already exists. Use PATCH to update." },
      { status: 409 },
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

    const profile = await prisma.clientProfile.create({
      data: {
        userId: authResult.userId,
        companyName: data.companyName,
        contactName: data.contactName!,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to create profile." },
      { status: 500 },
    );
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
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
