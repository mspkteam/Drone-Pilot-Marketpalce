/** Resources / Knowledge Center copy — Figma frame 323:6534 */

export const RESOURCE_CATEGORIES = [
  { id: "client-hiring-guides", label: "Client Hiring Guides" },
  { id: "drone-laws", label: "Drone Laws" },
  { id: "pilot-tips", label: "Pilot Tips" },
  { id: "safety", label: "Safety" },
  { id: "aerial-photography", label: "Aerial Photography" },
  { id: "business-growth", label: "Business Growth" },
  { id: "marketplace-updates", label: "Marketplace Updates" },
] as const;

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"];

export const FEATURED_RESOURCE = {
  label: "FEATURED ARTICLE",
  title: "How to Hire the Right Drone Pilot for Your Project",
  description:
    "Learn what to look for in pilot credentials, project scope, licensing, deliverables, and communication before you hire.",
  slug: "how-to-hire-the-right-drone-pilot",
  categoryId: "client-hiring-guides" as ResourceCategoryId,
};

export const RESOURCE_ARTICLES = [
  {
    slug: "how-to-plan-a-drone-shoot",
    categoryId: "client-hiring-guides" as ResourceCategoryId,
    categoryLabel: "CLIENT HIRING GUIDES",
    title: "How to Plan a Drone Shoot",
    description:
      "Define locations, timing, deliverables, and approvals so your aerial project runs smoothly from day one.",
  },
  {
    slug: "what-clients-should-ask-before-hiring",
    categoryId: "client-hiring-guides" as ResourceCategoryId,
    categoryLabel: "CLIENT HIRING GUIDES",
    title: "What Clients Should Ask Before Hiring",
    description:
      "Key questions about insurance, certifications, flight experience, and post-production before you book a pilot.",
  },
  {
    slug: "drone-safety-basics-commercial",
    categoryId: "safety" as ResourceCategoryId,
    categoryLabel: "SAFETY",
    title: "Drone Safety Basics for Commercial Projects",
    description:
      "Essential planning steps for airspace, weather, crew coordination, and on-site risk management.",
  },
  {
    slug: "build-a-strong-pilot-profile",
    categoryId: "pilot-tips" as ResourceCategoryId,
    categoryLabel: "PILOT TIPS",
    title: "How Pilots Can Build a Strong Profile",
    description:
      "Showcase flight hours, portfolio work, certifications, and service categories clients trust.",
  },
  {
    slug: "understanding-pilot-verification",
    categoryId: "safety" as ResourceCategoryId,
    categoryLabel: "SAFETY",
    title: "Understanding Drone Pilot Verification",
    description:
      "How Remote Air Service reviews pilots and what verification means for client confidence.",
  },
  {
    slug: "best-drone-services-real-estate",
    categoryId: "aerial-photography" as ResourceCategoryId,
    categoryLabel: "AERIAL PHOTOGRAPHY",
    title: "Best Drone Services for Real Estate",
    description:
      "Listing photos, cinematic tours, and neighborhood context shots that help properties stand out.",
  },
] as const;
