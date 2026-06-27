export const CLIENT_PROFILE_STATUSES = ["draft", "active", "suspended"] as const;

export type ClientProfileStatus = (typeof CLIENT_PROFILE_STATUSES)[number];

export type ClientBillingAddress = {
  line1?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
};

export type ClientProfilePreferencesDto = {
  roleTitle: string;
  preferredContact: "Email" | "Phone" | "Messages";
  typicalProjectArea: string;
  defaultBudgetRange: string;
  approvalContact: string;
  billingEmail: string;
  projectTypes: string[];
  logoPath: string | null;
  notifications: {
    emailUpdates: boolean;
    newBids: boolean;
    messages: boolean;
    projectUpdates: boolean;
  };
};

export type ClientProfileDto = {
  id: string;
  userId: string;
  companyName: string | null;
  contactName: string;
  phone: string | null;
  billingAddress: ClientBillingAddress | null;
  preferences: ClientProfilePreferencesDto;
  status: ClientProfileStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
