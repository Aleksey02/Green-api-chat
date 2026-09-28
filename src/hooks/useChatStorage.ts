import { useEffect } from 'react';
import { CHAT_STORAGE_KEY } from '../utils/appSession';
import type { ChatInfo, Message } from '../types/chat';

type UseChatStorageParams = {
	chats: ChatInfo[];
	messagesByChat: Record<string, Message[]>;
	unreadCounts: Record<string, number>;
	activeChatId: string | null;
};

export function useChatStorage({ chats, messagesByChat, unreadCounts, activeChatId }: UseChatStorageParams) {
	useEffect(() => {
		localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
			chats,
			messagesByChat,
			unreadCounts,
			activeChatId,
		}));
	}, [activeChatId, chats, messagesByChat, unreadCounts]);
}
