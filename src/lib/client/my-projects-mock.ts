/** Mock data for Client My Projects — replace with listing API in M51. */

export type ClientMyProjectStatus =
  | "Awaiting Bids"
  | "Active"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Pending";

export type ClientMyProjectTabId =
  | "all"
  | "active"
  | "awaiting-bids"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "pending";

export type ClientMyProject = {
  id: string;
  slug: string;
  title: string;
  location: string;
  postedLabel: string;
  bidsCount: number;
  budget: string;
  status: ClientMyProjectStatus;
};

export const CLIENT_MY_PROJECT_TABS: readonly {
  id: ClientMyProjectTabId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "awaiting-bids", label: "Awaiting Bids" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "pending", label: "Pending" },
] as const;

export const CLIENT_MY_PROJECTS: readonly ClientMyProject[] = [
  {
    id: "proj-1",
    slug: "commercial-property-survey",
    title: "Commercial Property Survey",
    location: "Dallas, TX",
    postedLabel: "Posted 2 days ago",
    bidsCount: 4,
    budget: "$3,500 - $5,000",
    status: "Awaiting Bids",
  },
  {
    id: "proj-2",
    slug: "wedding-event-coverage",
    title: "Wedding Event Coverage",
    location: "Austin, TX",
    postedLabel: "Posted 5 days ago",
    bidsCount: 6,
    budget: "$1,800",
    status: "Active",
  },
  {
    id: "proj-3",
    slug: "construction-inspection",
    title: "Construction Inspection",
    location: "Houston, TX",
    postedLabel: "Posted 6 hours ago",
    bidsCount: 0,
    budget: "$2,000 - $4,000",
    status: "Awaiting Bids",
  },
  {
    id: "proj-4",
    slug: "lakeside-real-estate-tour",
    title: "Lakeside Real Estate Tour",
    location: "Frisco, TX",
    postedLabel: "Posted 3 weeks ago",
    bidsCount: 2,
    budget: "$900",
    status: "Cancelled",
  },
  {
    id: "proj-5",
    slug: "solar-farm-thermal-scan",
    title: "Solar Farm Thermal Scan",
    location: "El Paso, TX",
    postedLabel: "Posted 8 days ago",
    bidsCount: 3,
    budget: "$4,200",
    status: "In Progress",
  },
  {
    id: "proj-6",
    slug: "roof-inspection-plano",
    title: "Roof Inspection — Plano",
    location: "Plano, TX",
    postedLabel: "Posted 2 weeks ago",
    bidsCount: 5,
    budget: "$650",
    status: "Completed",
  },
] as const;

export const CLIENT_MY_PROJECTS_ROUTES = {
  newProject: "/dashboard/client/jobs/new",
  bidsHub: "/dashboard/client/quotes",
  projectDetail: (slug: string) =>
    `/dashboard/client/jobs/${slug}` as const,
  projectBids: (slug: string) =>
    `/dashboard/client/quotes?project=${slug}` as const,
} as const;

const TAB_STATUS_MAP: Record<
  Exclude<ClientMyProjectTabId, "all">,
  ClientMyProjectStatus
> = {
  active: "Active",
  "awaiting-bids": "Awaiting Bids",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
};

export function filterClientMyProjects(
  projects: readonly ClientMyProject[],
  tab: ClientMyProjectTabId,
): ClientMyProject[] {
  if (tab === "all") return [...projects];
  const status = TAB_STATUS_MAP[tab];
  return projects.filter((p) => p.status === status);
}

export type ClientMyProjectBadgeTone = "gold" | "red" | "green" | "muted";

export function badgeToneForStatus(
  status: ClientMyProjectStatus,
): ClientMyProjectBadgeTone {
  switch (status) {
    case "Cancelled":
      return "red";
    case "Completed":
      return "green";
    case "Pending":
      return "muted";
    default:
      return "gold";
  }
}
