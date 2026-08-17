import type { HelpArticle, HelpArticleAudience } from "@/types/help-article";

/**
 * Seed help articles — replace with CMS/API (`listHelpArticles`) when admin content module ships.
 */
const HELP_ARTICLES_SEED: HelpArticle[] = [
  {
    id: "help-pilot-ranks",
    title: "How do Remote Air Service grades A-1 to A-6 work?",
    slug: "how-pilot-ranks-a1-to-a6-work",
    category: "Membership",
    summary:
      "Understand marketplace tiers, visibility delays, proposal limits, and rank progression.",
    body: `Pilot ranks A-1 through A-6 reflect your membership tier on Remote Air Service. Lower tiers may have job visibility delays and proposal caps; higher tiers unlock faster access, featured placement, and instructor eligibility.

Upgrade your membership from the pilot dashboard when you are ready to expand operations. Rank badges and wings on your public profile are earned through verified flight history, completed missions, and platform performance.`,
    audience: "pilot",
    status: "published",
    sortOrder: 10,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "help-part-107",
    title: "Uploading FAA Part 107 correctly",
    slug: "uploading-faa-part-107-correctly",
    category: "Verification",
    summary:
      "File format, naming, and approval tips for your remote pilot certificate upload.",
    body: `Upload a clear PDF or high-resolution image of your FAA Part 107 certificate from the pilot Verification page. Ensure your name and certificate number are readable and match your profile.

Avoid cropped edges or glare. If a document is rejected, read the moderator note on the card, replace the file, and resubmit. Approved verification unlocks verified badges on your public pilot profile.`,
    audience: "pilot",
    status: "published",
    sortOrder: 20,
    createdAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z",
  },
  {
    id: "help-locked-jobs",
    title: "Why is my job locked?",
    slug: "why-is-my-job-locked",
    category: "Marketplace",
    summary:
      "Membership visibility delays and tier rules that temporarily lock new job postings.",
    body: `Some marketplace jobs appear as locked when your current membership tier has not yet earned immediate visibility. Higher tiers reduce or remove the delay after a job is approved.

Check the countdown on the Locked Jobs page and consider upgrading your membership if you need faster access. Locked status is not a penalty — it reflects tier-based marketplace pacing.`,
    audience: "pilot",
    status: "published",
    sortOrder: 30,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-05-12T00:00:00.000Z",
  },
  {
    id: "help-payouts",
    title: "Payout schedule and platform commission",
    slug: "payout-schedule-and-platform-commission",
    category: "Payments",
    summary:
      "How completed booking payouts work and when the 15% marketplace fee is deducted.",
    body: `When a client booking is marked completed and payment is released, your pilot earnings appear on the Payments page. Remote Air Service deducts a 15% platform commission from the gross job amount; the remainder is your payout.

Payout timing may depend on client payment release and internal processing. Uniform shop orders use a separate payment flow from mission escrow.`,
    audience: "pilot",
    status: "published",
    sortOrder: 40,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "help-disputes",
    title: "Dispute resolution process",
    slug: "dispute-resolution-process",
    category: "Operations",
    summary:
      "How to open a booking dispute and what moderators review during resolution.",
    body: `If deliverables or payment release are contested, either party can open a dispute from the booking detail page while the contract is active or recently completed.

Ground Control moderators review messages, deliverables, and contract terms. Keep communication professional and attach evidence when requested. Dispute outcomes may adjust payout release per platform policy.`,
    audience: "all",
    status: "published",
    sortOrder: 50,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "help-insurance",
    title: "Updating your insurance certificate",
    slug: "updating-your-insurance-certificate",
    category: "Verification",
    summary:
      "Replace expired insurance documents and keep your verified status current.",
    body: `Upload an updated insurance certificate from the pilot Verification page before your current document expires. Use PDF when possible and ensure policy dates and insured name are visible.

Expired insurance may limit bidding on certain jobs. After approval, your verified insurance badge refreshes on your public profile automatically.`,
    audience: "pilot",
    status: "published",
    sortOrder: 60,
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
];

function audienceMatches(
  articleAudience: HelpArticleAudience,
  viewer: HelpArticleAudience,
): boolean {
  return articleAudience === "all" || articleAudience === viewer;
}

/** Read-only seed for CMS import — help center still uses this module directly. */
export function getHelpArticlesSeed(): readonly HelpArticle[] {
  return HELP_ARTICLES_SEED;
}

export function listHelpArticles(options?: {
  audience?: HelpArticleAudience;
  status?: HelpArticle["status"];
}): HelpArticle[] {
  const audience = options?.audience ?? "pilot";
  const status = options?.status ?? "published";

  return HELP_ARTICLES_SEED.filter(
    (article) =>
      article.status === status && audienceMatches(article.audience, audience),
  ).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getHelpArticleBySlug(slug: string): HelpArticle | null {
  return HELP_ARTICLES_SEED.find((article) => article.slug === slug) ?? null;
}

export function searchHelpArticles(
  query: string,
  options?: { audience?: HelpArticleAudience },
): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return listHelpArticles(options);
  }

  return listHelpArticles(options).filter((article) => {
    const haystack = `${article.title} ${article.category} ${article.summary}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function listPopularHelpArticles(
  audience: HelpArticleAudience = "pilot",
  limit = 6,
): HelpArticle[] {
  return listHelpArticles({ audience }).slice(0, limit);
}
