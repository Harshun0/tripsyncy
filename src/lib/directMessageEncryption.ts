import { decryptMessage, encryptMessage } from '@/lib/encryption';

function buildParticipantSecret(userA: string, userB: string) {
  return [userA, userB].sort().join('::trip-sync-dm::');
}

export async function encryptDirectMessageContent(content: string, senderId: string, recipientId: string) {
  return encryptMessage(content, buildParticipantSecret(senderId, recipientId));
}

export async function decryptDirectMessageContent(content: string, viewerId: string, otherUserId: string) {
  return decryptMessage(content, buildParticipantSecret(viewerId, otherUserId));
}