import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  getPilotProfileByUserId,
  serializeServicesOffered,
  toPilotProfileDto,
} from "@/lib/pilot/profile";
import { serializeProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { validatePilotProfileInput } from "@/lib/pilot/validation";
import { prisma } from "@/lib/db";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: toPilotProfileDto(profile) });
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const existing = await getPilotProfileByUserId(authResult.userId);
  if (existing) {
    return NextResponse.json(
      { error: "Profile already exists. Use PATCH to update." },
      { status: 409 },
    );
  }

  try {
    const body = await request.json();
    const validated = validatePilotProfileInput(body, {
      requireAllForOnboarding: !!body.completeOnboarding,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const now = new Date();
    const completing = !!data.completeOnboarding;

    const profile = await prisma.pilotProfile.create({
      data: {
        userId: authResult.userId,
        displayName: data.displayName!,
        bio: data.bio?.trim() || null,
        locationCity: data.locationCity?.trim() || null,
        locationRegion: data.locationRegion?.trim() || null,
        locationCountry: data.locationCountry?.trim() || null,
        serviceRadiusKm: data.serviceRadiusKm ?? null,
        servicesOffered: serializeServicesOffered(data.servicesOffered ?? []),
        hourlyRateMin: data.hourlyRateMin ?? null,
        hourlyRateMax: data.hourlyRateMax ?? null,
        licenseNumber: data.licenseNumber!,
        licenseCountry: data.licenseCountry?.trim() || null,
        ...(data.extras
          ? { profileExtrasJson: serializeProfileExtrasJson(data.extras) }
          : {}),
        complianceAcceptedAt: completing ? now : null,
        onboardingCompletedAt: completing ? now : null,
        status: completing ? "pending_review" : "draft",
      },
    });

    return NextResponse.json(
      { profile: toPilotProfileDto(profile) },
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
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const existing = await getPilotProfileByUserId(authResult.userId);
  if (!existing) {
    return NextResponse.json(
      { error: "No profile found. Complete onboarding first." },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const validated = validatePilotProfileInput(body, {
      requireAllForOnboarding: !!body.completeOnboarding,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const now = new Date();
    const completing = !!data.completeOnboarding && !existing.onboardingCompletedAt;

    const profile = await prisma.pilotProfile.update({
      where: { userId: authResult.userId },
      data: {
        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),
        ...(data.bio !== undefined && { bio: data.bio?.trim() || null }),
        ...(data.locationCity !== undefined && {
          locationCity: data.locationCity?.trim() || null,
        }),
        ...(data.locationRegion !== undefined && {
          locationRegion: data.locationRegion?.trim() || null,
        }),
        ...(data.locationCountry !== undefined && {
          locationCountry: data.locationCountry?.trim() || null,
        }),
        ...(data.serviceRadiusKm !== undefined && {
          serviceRadiusKm: data.serviceRadiusKm,
        }),
        ...(data.servicesOffered !== undefined && {
          servicesOffered: serializeServicesOffered(data.servicesOffered),
        }),
        ...(data.hourlyRateMin !== undefined && {
          hourlyRateMin: data.hourlyRateMin,
        }),
        ...(data.hourlyRateMax !== undefined && {
          hourlyRateMax: data.hourlyRateMax,
        }),
        ...(data.licenseNumber !== undefined && {
          licenseNumber: data.licenseNumber,
        }),
        ...(data.licenseCountry !== undefined && {
          licenseCountry: data.licenseCountry?.trim() || null,
        }),
        ...(data.extras !== undefined && {
          profileExtrasJson: serializeProfileExtrasJson(data.extras),
        }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(completing && {
          complianceAcceptedAt: now,
          onboardingCompletedAt: now,
          status: "pending_review",
        }),
      },
    });

    return NextResponse.json({ profile: toPilotProfileDto(profile) });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
