/** Mock UI data for pilot dashboard overview — used when live data is empty (pending APIs). */

import type { PilotDashboardActivityItem } from "@/lib/pilot/dashboard-page-data";

export const PILOT_DASHBOARD_ROUTES = {
  browseJobs: "/dashboard/pilot/jobs",
  profile: "/dashboard/pilot/profile",
  portfolio: "/dashboard/pilot/portfolio",
  verifications: "/dashboard/pilot/verifications",
  earnings: "/dashboard/pilot/payments",
  applications: "/dashboard/pilot/proposals",
  proposals: "/dashboard/pilot/proposals",
  bookings: "/dashboard/pilot/contracts",
  contracts: "/dashboard/pilot/contracts",
  reviews: "/dashboard/pilot/reviews",
  subscription: "/dashboard/pilot/subscription",
} as const;

export type PilotMockRecommendedJob = {
  id: string;
  category: string;
  price: string;
  title: string;
  location: string;
  time: string;
  href: string;
};

export type PilotMockLockedJob = {
  id: string;
  title: string;
  requirement: string;
  /** ISO unlock time for countdown */
  unlockAt: string;
};

export type PilotMockReview = {
  id: string;
  title: string;
  date: string;
  rating: number;
  text: string;
};

export const PILOT_MOCK_RECOMMENDED_JOBS: readonly PilotMockRecommendedJob[] = [
  {
    id: "mock-job-1",
    category: "INSPECTION",
    price: "$4,250",
    title: "Coastal Offshore Turbine Assessment",
    location: "North Sea · Sector 14",
    time: "24 MAY · 18:00Z",
    href: PILOT_DASHBOARD_ROUTES.browseJobs,
  },
  {
    id: "mock-job-2",
    category: "LOGISTICS",
    price: "$1,800",
    title: "Emergency Medical Payload Delivery",
    location: "Appalachian Range · Zone B",
    time: "ASAP · HIGH PRIORITY",
    href: PILOT_DASHBOARD_ROUTES.browseJobs,
  },
  {
    id: "mock-job-3",
    category: "AGRICULTURE",
    price: "$950",
    title: "Precision Crop Survey",
    location: "California · Region IV",
    time: "25 MAY · 06:00Z",
    href: PILOT_DASHBOARD_ROUTES.browseJobs,
  },
  {
    id: "mock-job-4",
    category: "ENERGY",
    price: "$2,100",
    title: "Sub-Station Thermal Scan",
    location: "Detroit Metro · Lot 9",
    time: "DAILY · 09:00Z",
    href: PILOT_DASHBOARD_ROUTES.browseJobs,
  },
] as const;

export const PILOT_MOCK_LOCKED_JOBS: readonly PilotMockLockedJob[] = [
  {
    id: "mock-locked-1",
    title: "Deep Forest Conservation Mapping",
    requirement: "REQUIRES A-4 GRADE",
    unlockAt: new Date(Date.now() + 3 * 3600 * 1000 + 11 * 60 * 1000 + 20 * 1000).toISOString(),
  },
  {
    id: "mock-locked-2",
    title: "Federal Pipeline Survey",
    requirement: "REQUIRES A-5 ELITE",
    unlockAt: new Date(Date.now() + 12 * 3600 * 1000 + 48 * 60 * 1000).toISOString(),
  },
] as const;

export const PILOT_MOCK_REVIEWS: readonly PilotMockReview[] = [
  {
    id: "mock-review-1",
    title: "Mission control agency",
    date: "MAY 12 2026",
    rating: 5,
    text: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. QUISQUE RHONCUS MASSA ACCUMSAN, BLANDIT ENIM SCELERISQUE,",
  },
  {
    id: "mock-review-2",
    title: "Mission control agency",
    date: "MAY 12 2026",
    rating: 5,
    text: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. QUISQUE RHONCUS MASSA ACCUMSAN, BLANDIT ENIM SCELERISQUE,",
  },
] as const;

export const PILOT_MOCK_ACTIVITY: readonly PilotDashboardActivityItem[] = [
  {
    id: "mock-act-1",
    text: "Proposal #2104 was shortlisted by Enterprise Client.",
    timeLabel: "12 MIN AGO",
    tone: "success",
  },
  {
    id: "mock-act-2",
    text: "New mission priority assigned in Sector 04.",
    timeLabel: "47 MIN AGO",
    tone: "gold",
  },
  {
    id: "mock-act-3",
    text: "Payout of $1,240 cleared to your account.",
    timeLabel: "2 HR AGO",
    tone: "gold",
  },
  {
    id: "mock-act-4",
    text: "Insurance document expiring in 14 days.",
    timeLabel: "YESTERDAY",
    tone: "warning",
  },
  {
    id: "mock-act-5",
    text: "Weather advisory cleared for North Sea ops.",
    timeLabel: "YESTERDAY",
    tone: "muted",
  },
] as const;
