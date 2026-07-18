export type PersonnelStatusTone = "success" | "pending" | "danger";

export type PersonnelRow = {
  id: string;
  displayId: string;
  name: string;
  role: string;
  roleLabel: string;
  roleFilter: string;
  region: string;
  /** Earned wings count for pilots; "—" for non-pilot roles. */
  wingsLabel: string;
  statusLabel: string;
  statusTone: PersonnelStatusTone;
  joinedAt: string;
  joinedLabel: string;
  viewHref: string;
  editHref: string | null;
  /** Admin / Moderator — Super Admin may delete these. */
  isManagementUser: boolean;
};

export type PersonnelStatCard = {
  label: string;
  value: string;
  subtext: string;
  subtextTone?: "success" | "muted";
};

export type PersonnelDirectoryData = {
  rows: PersonnelRow[];
  stats: PersonnelStatCard[];
  usingMockRows: boolean;
};
