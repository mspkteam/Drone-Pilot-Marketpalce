export const SUPPORT_CHAT_STATUSES = [
  "open",
  "pending",
  "resolved",
  "closed",
] as const;

export type SupportChatStatus = (typeof SUPPORT_CHAT_STATUSES)[number];

export const SUPPORT_REQUESTER_ROLES = [
  "guest",
  "client",
  "pilot",
  "admin",
] as const;

export type SupportRequesterRole = (typeof SUPPORT_REQUESTER_ROLES)[number];

export const SUPPORT_SENDER_ROLES = [
  "guest",
  "client",
  "pilot",
  "admin",
  "system",
] as const;

export type SupportSenderRole = (typeof SUPPORT_SENDER_ROLES)[number];

export type SupportChatMessageDto = {
  id: string;
  supportChatId: string;
  senderUserId: string | null;
  senderRole: SupportSenderRole;
  senderName: string;
  message: string;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  isSystem: boolean;
  createdAt: string;
};

export type SupportChatDto = {
  id: string;
  requesterUserId: string | null;
  requesterRole: SupportRequesterRole;
  requesterName: string;
  requesterEmail: string;
  subject: string | null;
  initialMessage: string;
  status: SupportChatStatus;
  assignedAdminId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  guestToken?: string;
};

export type SupportChatThreadDto = SupportChatDto & {
  messages: SupportChatMessageDto[];
  canReply: boolean;
  canManageStatus: boolean;
  /** True when the other party is actively typing (not yourself). */
  otherPartyTyping: boolean;
};

export type AdminSupportChatListItemDto = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: SupportRequesterRole;
  status: SupportChatStatus;
  initialMessage: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  createdAt: string;
  unreadForAdmin: boolean;
};
