/** Mock data for Client Dashboard overview — replace with API/DB in M38. */

export type ClientDashboardStat = {
  label: string;
  value: string;
  helper: string;
};

export type ClientProjectStatus = "quotes_received" | "pilot_selected" | "awaiting_quotes";

export type ClientRecentProject = {
  id: string;
  title: string;
  metadata: string;
  status: ClientProjectStatus;
  statusLabel: string;
};

export type ClientActivityItem = {
  id: string;
  actor: string;
  action: string;
  project: string;
  timestamp: string;
};

export type ClientRecommendedPilot = {
  id: string;
  initials: string;
  name: string;
  location: string;
  rating: string;
  projects: string;
  hours: string;
  tags: string[];
  priceAmount: string;
  profileHref: string;
  verified?: boolean;
};

export const CLIENT_DASHBOARD_STATS: readonly ClientDashboardStat[] = [
  { label: "Active Projects", value: "12", helper: "+2 this week" },
  { label: "Quotes Received", value: "4", helper: "Awaiting review" },
  { label: "Projects Completed", value: "89", helper: "Lifetime" },
  { label: "Pending Actions", value: "2", helper: "Need response" },
] as const;

export const CLIENT_RECENT_PROJECTS: readonly ClientRecentProject[] = [
  {
    id: "proj-1",
    title: "Commercial Property Survey",
    metadata: "3 Quotes Received · Posted 2 days ago · $3,500 – $5,000",
    status: "quotes_received",
    statusLabel: "Quotes Received",
  },
  {
    id: "proj-2",
    title: "Wedding Event Coverage",
    metadata: "Sarah Chen assigned · Posted 5 days ago · $1,800",
    status: "pilot_selected",
    statusLabel: "Pilot Selected",
  },
  {
    id: "proj-3",
    title: "Construction Inspection",
    metadata: "0 of 5 quotes · Posted 6 hours ago · $2,000 – $4,000",
    status: "awaiting_quotes",
    statusLabel: "Awaiting Quotes",
  },
] as const;

export const CLIENT_RECENT_ACTIVITY: readonly ClientActivityItem[] = [
  {
    id: "act-1",
    actor: "Sarah Chen",
    action: "submitted a proposal",
    project: "Wedding Event Coverage",
    timestamp: "12 min ago",
  },
  {
    id: "act-2",
    actor: "System",
    action: "Project completed",
    project: "Roof Inspection — Plano",
    timestamp: "3 hr ago",
  },
  {
    id: "act-3",
    actor: "John Smith",
    action: "uploaded 14 files",
    project: "Commercial Property Survey",
    timestamp: "1 day ago",
  },
  {
    id: "act-4",
    actor: "Daniel Okafor",
    action: "sent you a message",
    project: "Thermal Pipeline Scan",
    timestamp: "2 days ago",
  },
] as const;

export const CLIENT_RECOMMENDED_PILOTS: readonly ClientRecommendedPilot[] = [
  {
    id: "pilot-js",
    initials: "JS",
    name: "John Smith",
    location: "Dallas, TX",
    rating: "4.9",
    projects: "120 projects",
    hours: "2500+ hrs",
    tags: ["Aerial Photography", "Survey Mapping", "Inspection"],
    priceAmount: "$850/day",
    profileHref: "/pilots/john-smith",
    verified: true,
  },
  {
    id: "pilot-sc",
    initials: "SC",
    name: "Sarah Chen",
    location: "Austin, TX",
    rating: "5",
    projects: "87 projects",
    hours: "1800+ hrs",
    tags: ["Cinematic Video", "Events", "Real Estate"],
    priceAmount: "$950/day",
    profileHref: "/pilots/sarah-chen",
    verified: true,
  },
  {
    id: "pilot-do",
    initials: "DO",
    name: "Daniel Okafor",
    location: "Houston, TX",
    rating: "4.8",
    projects: "64 projects",
    hours: "1400+ hrs",
    tags: ["Thermal", "Agriculture", "Inspection"],
    priceAmount: "$700/day",
    profileHref: "/pilots/daniel-okafor",
    verified: true,
  },
] as const;

export const CLIENT_DASHBOARD_ROUTES = {
  postProject: "/dashboard/client/jobs/new",
  browsePilots: "/dashboard/client/find-pilots",
  viewAllProjects: "/dashboard/client/jobs",
  seeAllPilots: "/dashboard/client/find-pilots",
} as const;
