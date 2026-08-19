export type ConversationListItemDto = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobApplicationId: string;
  bookingId: string | null;
  pilotProfileId: string;
  clientProfileId: string;
  counterpartName: string;
  counterpartAvatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderLabel: string;
  isMine: boolean;
  body: string;
  createdAt: string;
};

export type ConversationDetailDto = ConversationListItemDto & {
  messages: MessageDto[];
};

export type EligibleApplicationDto = {
  id: string;
  jobId: string;
  jobTitle: string;
  pilotName: string;
  proposedAmount: number;
  currency: string;
  submittedAt: string;
};
