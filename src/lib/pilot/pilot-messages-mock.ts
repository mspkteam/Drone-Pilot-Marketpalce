/** UI fallback when no API conversations exist — pilot inbox preview. */

export type PilotMockMessage = {
  id: string;
  body: string;
  timeLabel: string;
  isMine: boolean;
};

export type PilotMockConversation = {
  id: string;
  clientName: string;
  initials: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
  statusLabel: string;
  messages: PilotMockMessage[];
};

export const PILOT_MESSAGES_MOCK_CONVERSATIONS: PilotMockConversation[] = [
  {
    id: "mock-conv-1",
    clientName: "Northwind Energy",
    initials: "NE",
    preview: "Confirming night ops for tomorrow...",
    timeLabel: "12m",
    unreadCount: 2,
    statusLabel: "Client · Online",
    messages: [
      {
        id: "mock-m1",
        body: "Hi, can you confirm if night operations are required for tomorrow?",
        timeLabel: "10:42",
        isMine: false,
      },
      {
        id: "mock-m2",
        body: "Yes, sunset to 9pm. Site has FAA waiver.",
        timeLabel: "10:45",
        isMine: true,
      },
      {
        id: "mock-m3",
        body: "Perfect — I'll bring the lighting payload.",
        timeLabel: "10:47",
        isMine: true,
      },
    ],
  },
  {
    id: "mock-conv-2",
    clientName: "Pinnacle Realty",
    initials: "PR",
    preview: "Sent the rough cut — let me know.",
    timeLabel: "1h",
    unreadCount: 0,
    statusLabel: "Client · Online",
    messages: [
      {
        id: "mock-m4",
        body: "Sent the rough cut — let me know.",
        timeLabel: "09:15",
        isMine: true,
      },
    ],
  },
  {
    id: "mock-conv-3",
    clientName: "DTE Energy",
    initials: "DE",
    preview: "Quote attached for thermal scan.",
    timeLabel: "Yesterday",
    unreadCount: 0,
    statusLabel: "Client · Online",
    messages: [
      {
        id: "mock-m5",
        body: "Quote attached for thermal scan.",
        timeLabel: "16:20",
        isMine: true,
      },
    ],
  },
];
