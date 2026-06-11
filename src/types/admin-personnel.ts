export type PersonnelStatusTone = "success" | "pending" | "danger";

export type PersonnelRow = {
  id: string;
  displayId: string;
  name: string;
  roleLabel: string;
  roleFilter: string;
  region: string;
  statusLabel: string;
  statusTone: PersonnelStatusTone;
  joinedAt: string;
  joinedLabel: string;
  viewHref: string;
  editHref: string | null;
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
