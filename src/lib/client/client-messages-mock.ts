/** UI fallback when no API conversations exist — replace with live inbox in M21 wiring. */

export type ClientMockMessage = {
  id: string;
  body: string;
  timeLabel: string;
  isMine: boolean;
};

export type ClientMockConversation = {
  id: string;
  pilotName: string;
  initials: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
  statusLabel: string;
  messages: ClientMockMessage[];
};

export const CLIENT_MESSAGES_MOCK_CONVERSATIONS: ClientMockConversation[] = [
  {
    id: "mock-conv-1",
    pilotName: "John Smith",
    initials: "JS",
    preview: "Confirming night ops for tomorrow...",
    timeLabel: "12m",
    unreadCount: 2,
    statusLabel: "Pilot · Online",
    messages: [
      {
        id: "mock-m1",
        body: "Hi John, can you confirm if night operations are required?",
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
        isMine: false,
      },
    ],
  },
  {
    id: "mock-conv-2",
    pilotName: "Sarah Chen",
    initials: "SC",
    preview: "Sent the rough cut — let me know.",
    timeLabel: "1h",
    unreadCount: 0,
    statusLabel: "Pilot · Online",
    messages: [
      {
        id: "mock-m4",
        body: "Sent the rough cut — let me know.",
        timeLabel: "09:15",
        isMine: false,
      },
    ],
  },
  {
    id: "mock-conv-3",
    pilotName: "Daniel Okafor",
    initials: "DO",
    preview: "Quote attached for thermal scan.",
    timeLabel: "Yesterday",
    unreadCount: 0,
    statusLabel: "Pilot · Online",
    messages: [
      {
        id: "mock-m5",
        body: "Quote attached for thermal scan.",
        timeLabel: "16:20",
        isMine: false,
      },
    ],
  },
];
