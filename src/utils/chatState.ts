import { CHAT_STORAGE_KEY } from './appSession';
import type { ChatInfo, Message } from '../types/chat';

export type StoredChatState = {
	chats: ChatInfo[];
	messagesByChat: Record<string, Message[]>;
	unreadCounts?: Record<string, number>;
	activeChatId: string | null;
};

export function readStoredChatState(): StoredChatState {
	try {
		const stored = localStorage.getItem(CHAT_STORAGE_KEY);
		if (!stored) {
			return { chats: [], messagesByChat: {}, activeChatId: null };
		}

		const parsed = JSON.parse(stored) as Partial<StoredChatState>;
		return {
			chats: Array.isArray(parsed.chats) ? parsed.chats : [],
			messagesByChat: parsed.messagesByChat ?? {},
			unreadCounts: parsed.unreadCounts ?? {},
			activeChatId: parsed.activeChatId ?? null,
		};
	} catch {
		return { chats: [], messagesByChat: {}, unreadCounts: {}, activeChatId: null };
	}
}

export function firstValue(...values: Array<string | undefined>) {
	return values
		.map((value) => value?.trim())
		.find((value): value is string => Boolean(value));
}

export function getAvatarSource(avatar?: string, base64Avatar?: string) {
	const value = firstValue(avatar, base64Avatar);
	if (!value) {
		return undefined;
	}

	if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	return `data:image/jpeg;base64,${value}`;
}

export function upsertChat(chats: ChatInfo[], chat: ChatInfo) {
	const existingChat = chats.find((item) => item.chatId === chat.chatId);
	const selectedChat = existingChat
		? {
				...existingChat,
				name: chat.name || existingChat.name,
				avatar: chat.avatar || existingChat.avatar,
			}
		: chat;

	return {
		chat: selectedChat,
		chats: existingChat
			? chats.map((item) => item.chatId === selectedChat.chatId ? selectedChat : item)
			: [...chats, selectedChat],
	};
}

export function markMessageAsRead(
	messagesByChat: Record<string, Message[]>,
	messageId: string
) {
	for (const [chatId, chatMessages] of Object.entries(messagesByChat)) {
		if (chatMessages.some((item) => item.id === messageId)) {
			return {
				...messagesByChat,
				[chatId]: chatMessages.map((item) =>
					item.id === messageId ? { ...item, status: 'read' as const } : item
				),
			};
		}
	}

	return messagesByChat;
}
