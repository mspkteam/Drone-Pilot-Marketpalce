type TypingParty = "requester" | "support";

const typingByChat = new Map<string, Partial<Record<TypingParty, number>>>();

export const SUPPORT_TYPING_TTL_MS = 3500;

export function pulseSupportTyping(chatId: string, party: TypingParty) {
  const entry = typingByChat.get(chatId) ?? {};
  entry[party] = Date.now();
  typingByChat.set(chatId, entry);
}

export function clearSupportTyping(chatId: string, party: TypingParty) {
  const entry = typingByChat.get(chatId);
  if (!entry) return;
  delete entry[party];
  if (Object.keys(entry).length === 0) {
    typingByChat.delete(chatId);
  }
}

export function isSupportPartyTyping(
  chatId: string,
  party: TypingParty,
): boolean {
  const at = typingByChat.get(chatId)?.[party];
  if (!at) return false;
  return Date.now() - at < SUPPORT_TYPING_TTL_MS;
}
