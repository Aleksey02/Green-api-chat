import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { ChatInfo } from '../types/chat';
import { firstValue, getAvatarSource } from '../utils/chatState';
import type { GreenApiClient } from '../services/greenApi';

type UseChatProfilesParams = {
	api: GreenApiClient;
	chats: ChatInfo[];
	chatsRef: MutableRefObject<ChatInfo[]>;
	setChats: Dispatch<SetStateAction<ChatInfo[]>>;
	setActiveChat: Dispatch<SetStateAction<ChatInfo | null>>;
};

export function useChatProfiles({ api, chats, chatsRef, setChats, setActiveChat }: UseChatProfilesParams) {
	useEffect(() => {
		if (chats.length === 0) {
			return;
		}

		let isMounted = true;
		async function refreshChatProfiles() {
			const refreshedChats = await Promise.all(
				chatsRef.current.map(async (chat) => {
					try {
						const contactInfo = await api.getContactInfo(chat.chatId);
						const resolvedName = firstValue(
							contactInfo.name,
							contactInfo.contactName,
							contactInfo.displayName,
							contactInfo.username,
							chat.name,
							chat.phone
						);
						
						const resolvedAvatar =
							getAvatarSource(contactInfo.avatar, contactInfo.base64Avatar) ??
							chat.avatar;

						return {
							...chat,
							name: resolvedName,
							avatar: resolvedAvatar,
						};
					} catch {
						return chat;
					}
				})
			);

			if (!isMounted) {
				return;
			}

			chatsRef.current = refreshedChats;
			setChats(refreshedChats);
			setActiveChat((currentChat) =>
				currentChat
					? refreshedChats.find((chat) => chat.chatId === currentChat.chatId) ?? currentChat
					: currentChat
			);
		}

		refreshChatProfiles();

		return () => {
			isMounted = false;
		};
	}, [api, chats.length, chatsRef, setActiveChat, setChats]);
}
