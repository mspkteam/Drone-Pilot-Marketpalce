import { PRICING_PLANS } from "@/lib/marketing/pricing-content";
import {
  RECOMMENDED_PRICING_PLAN_CODE,
  TIER_CODE_TO_PRICING_PLAN_CODE,
} from "@/lib/membership/pricing-tier-codes";

export type PlanDisplayFeature = {
  label: string;
  included: boolean;
  sortOrder: number;
};

export type PlanFeaturesMeta = {
  description: string;
  displayFeatures: PlanDisplayFeature[];
  isRecommended: boolean;
};

type PlanFeaturesPayloadV2 = {
  v: 2;
  description?: string;
  displayFeatures?: PlanDisplayFeature[];
  isRecommended?: boolean;
};

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "A-1":
    "Entry tier for approved pilots beginning their Remote Air Service journey.",
  "A-2": "Basic verified tier for pilots ready to bid on more missions.",
  "A-3":
    "Senior pilot plan for active professionals with stronger marketplace visibility.",
  "A-4":
    "Recommended tier with instant job access and unlimited proposals.",
  "A-5": "Elite tier for top-performing pilots with priority visibility.",
  "A-6":
    "Highest command tier with featured access, insignia, and maximum marketplace presence.",
};

export function getPricingCodeForTierCode(tierCode: string): string | null {
  return TIER_CODE_TO_PRICING_PLAN_CODE[tierCode] ?? null;
}

function defaultDisplayFeatures(pricingCode: string): PlanDisplayFeature[] {
  const marketing = PRICING_PLANS.find((plan) => plan.code === pricingCode);
  if (!marketing) return [];
  return marketing.features.map((feature, index) => ({
    label: feature.label,
    included: feature.included,
    sortOrder: index + 1,
  }));
}

function defaultDescription(pricingCode: string): string {
  return DEFAULT_DESCRIPTIONS[pricingCode] ?? "";
}

function defaultIsRecommended(pricingCode: string): boolean {
  return pricingCode === RECOMMENDED_PRICING_PLAN_CODE;
}

export function parsePlanFeaturesMeta(
  featuresRaw: string,
  pricingCode: string | null,
): PlanFeaturesMeta {
  const code = pricingCode ?? "";
  const fallback: PlanFeaturesMeta = {
    description: defaultDescription(code),
    displayFeatures: defaultDisplayFeatures(code),
    isRecommended: defaultIsRecommended(code),
  };

  try {
    const parsed = JSON.parse(featuresRaw) as unknown;
    if (Array.isArray(parsed)) {
      return fallback;
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as PlanFeaturesPayloadV2).v === 2
    ) {
      const payload = parsed as PlanFeaturesPayloadV2;
      return {
        description: payload.description ?? fallback.description,
        displayFeatures:
          payload.displayFeatures?.length
            ? payload.displayFeatures
                .slice()
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            : fallback.displayFeatures,
        isRecommended: payload.isRecommended ?? fallback.isRecommended,
      };
    }
  } catch {
    /* legacy string[] or invalid JSON */
  }

  return fallback;
}

export function serializePlanFeaturesMeta(meta: PlanFeaturesMeta): string {
  const payload: PlanFeaturesPayloadV2 = {
    v: 2,
    description: meta.description,
    displayFeatures: meta.displayFeatures,
    isRecommended: meta.isRecommended,
  };
  return JSON.stringify(payload);
}

/** Backward-compatible bullet list for membership DTO consumers. */
export function planMetaToBulletFeatures(meta: PlanFeaturesMeta): string[] {
  const bullets = meta.displayFeatures
    .filter((feature) => feature.included)
    .map((feature) => feature.label);
  if (meta.description) {
    return [meta.description, ...bullets];
  }
  return bullets;
}
