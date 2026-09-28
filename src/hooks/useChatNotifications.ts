import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import type { ChatInfo, Message } from '../types/chat';
import { markMessageAsRead } from '../utils/chatState';
import { parseIncomingMessage } from '../utils/notificationState';
import type { GreenApiClient } from '../services/greenApi';

type UseChatNotificationsParams = {
	api: GreenApiClient;
	chats: ChatInfo[];
	chatsRef: MutableRefObject<ChatInfo[]>;
	activeChatIdRef: MutableRefObject<string | null>;
	readMessageIds: MutableRefObject<Set<string>>;
	processedMessages: MutableRefObject<Set<string>>;
	setChats: Dispatch<SetStateAction<ChatInfo[]>>;
	setActiveChat: Dispatch<SetStateAction<ChatInfo | null>>;
	setMessagesByChat: Dispatch<SetStateAction<Record<string, Message[]>>>;
	setUnreadCounts: Dispatch<SetStateAction<Record<string, number>>>;
};

export function useChatNotifications({
	api,
	chats,
	chatsRef,
	activeChatIdRef,
	readMessageIds,
	processedMessages,
	setChats,
	setActiveChat,
	setMessagesByChat,
	setUnreadCounts,
}: UseChatNotificationsParams) {
	useEffect(() => {
		if (chats.length === 0) {
			return;
		}

		let isRunning = true;

		async function receiveMessages() {
			while (isRunning) {
				try {
					const notification = await api.receiveNotification();

					if (!notification) {
						continue;
					}

					const body = notification.body;
					const messageStatus = body.statusMessage ?? body.status;

					if (
						(body.typeWebhook === 'outgoingMessageStatus' || body.type === 'outgoing') &&
						messageStatus === 'read' &&
						body.idMessage
					) {
						const messageId = body.idMessage;
						readMessageIds.current.add(messageId);
						setMessagesByChat((previous) => markMessageAsRead(previous, messageId));
					}

					const notificationChatId = body.senderData?.chatId;
					const notificationChat = chatsRef.current.find(
						(chat) => chat.chatId === notificationChatId
					);

					if (
						notificationChat &&
						body.typeWebhook === 'incomingMessageReceived' &&
						body.messageData?.typeMessage
					) {
						const { text, displayName } = parseIncomingMessage(body);

						if (text) {
							if (displayName) {
								const updatedChats = chatsRef.current.map((chat) =>
									chat.chatId === notificationChat.chatId
										? { ...chat, name: displayName }
										: chat
								);
								chatsRef.current = updatedChats;
								setChats(updatedChats);
								setActiveChat((chat) =>
									chat?.chatId === notificationChat.chatId
										? { ...chat, name: displayName }
										: chat
								);
							}

							const messageId = body.idMessage ?? crypto.randomUUID();
							if (processedMessages.current.has(messageId)) {
								await api.deleteNotification(notification.receiptId);
								continue;
							}

							processedMessages.current.add(messageId);
							const newMessage: Message = {
								id: messageId,
								text,
								sender: 'other',
								timestamp: Date.now(),
							};

							setMessagesByChat((previous) => ({
								...previous,
								[notificationChat.chatId]: [
									...(previous[notificationChat.chatId] ?? []),
									newMessage,
								],
							}));
							if (activeChatIdRef.current !== notificationChat.chatId) {
								setUnreadCounts((previous) => ({
									...previous,
									[notificationChat.chatId]:
										(previous[notificationChat.chatId] ?? 0) + 1,
								}));
							}
						}
					}

					await api.deleteNotification(notification.receiptId);
				} catch (error) {
					console.error('Ошибка получения сообщения:', error);
					await new Promise((resolve) => setTimeout(resolve, 3000));
				}
			}
		}

		receiveMessages();
		return () => {
			isRunning = false;
		};
	}, [api, chats.length, activeChatIdRef, chatsRef, processedMessages, readMessageIds, setActiveChat, setChats, setMessagesByChat, setUnreadCounts]);
}
