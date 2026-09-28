import type { Notification } from '../types/chat';

export function parseIncomingMessage(body: Notification['body']) {
	const text =
		body.messageData?.textMessageData?.textMessage ??
		body.messageData?.extendedTextMessageData?.text;
	const displayName = [
		body.senderData?.senderContactName,
		body.senderData?.senderName,
		body.senderData?.chatName,
	]
		.map((name) => name?.trim())
		.find((name) => name && !name.startsWith('@'));

	return { text, displayName };
}