export type AdminConversationRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobApplicationId: string | null;
  bookingId: string | null;
  clientName: string;
  pilotName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  createdAt: string;
};

export type AdminConversationMessage = {
  id: string;
  senderEmail: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

export type AdminConversationDetail = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobApplicationId: string | null;
  bookingId: string | null;
  clientName: string;
  pilotName: string;
  createdAt: string;
  messages: AdminConversationMessage[];
};

export type AdminMessagesScopeFilter = "all" | "client" | "pilot" | "job";

export type AdminMessagesDateFilter = "all" | "7d" | "30d" | "90d";
