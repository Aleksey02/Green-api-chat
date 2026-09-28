import { useState, useRef, type CSSProperties } from 'react';
import './Chat.scss';
import { ChatConversation } from './ChatConversation/ChatConversation';
import { ChatRail } from './ChatRail/ChatRail';
import { ChatSidebar } from './ChatSidebar/ChatSidebar';
import { ChatSettingsDialog } from './ChatSettingsDialog/ChatSettingsDialog';
import { LogoutConfirmDialog } from './LogoutConfirmDialog/LogoutConfirmDialog';
import {
	readStoredChatState,
	upsertChat,
} from '../../utils/chatState';
import type { GreenApiClient } from '../../services/greenApi';
import {
	APP_THEMES,
	CHAT_PATTERNS,
	CHAT_PATTERN_STORAGE_KEY,
	CUSTOM_THEME_COLOR_KEY,
	THEME_STORAGE_KEY,
	getThemeContrast,
	getThemePalette,
	isHexColor,
	type AppThemeId,
	type ChatPatternId,
	type ThemeSelection,
} from '../../utils/chatTheme';
import type {
	ChatInfo,
	Message,
} from '../../types/chat';
import { getChatInfo } from '../../utils/getChatInfo';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useChatProfiles } from '../../hooks/useChatProfiles';
import { useChatSettings } from '../../hooks/useChatSettings';
import { useChatStorage } from '../../hooks/useChatStorage';

type ChatProps = {
	api: GreenApiClient;
	onLogout: () => void;
	statusSetupNotice?: string;
};

export function Chat({ api, onLogout, statusSetupNotice }: ChatProps) {
	const [storedChatState] = useState(readStoredChatState);
	const [customThemeColor, setCustomThemeColor] = useState(() => {
		const storedColor = localStorage.getItem(CUSTOM_THEME_COLOR_KEY);
		return isHexColor(storedColor) ? storedColor : '#267354';
	});
	const [themeId, setThemeId] = useState<ThemeSelection>(() => {
		const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
		if (storedTheme === 'custom' && isHexColor(localStorage.getItem(CUSTOM_THEME_COLOR_KEY))) {
			return 'custom';
		}

		return APP_THEMES.some((theme) => theme.id === storedTheme)
			? (storedTheme as AppThemeId)
			: 'green';
	});
	const [chatPatternId, setChatPatternId] = useState<ChatPatternId>(() => {
		const storedPattern = localStorage.getItem(CHAT_PATTERN_STORAGE_KEY);
		return CHAT_PATTERNS.some((pattern) => pattern.id === storedPattern)
			? (storedPattern as ChatPatternId)
			: 'circles';
	});
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [phone, setPhone] = useState('');
	const [chats, setChats] = useState<ChatInfo[]>(storedChatState.chats);
	const chatsRef = useRef<ChatInfo[]>(storedChatState.chats);
	const [activeChat, setActiveChat] = useState<ChatInfo | null>(() =>
		storedChatState.chats.find(
			(chat) => chat.chatId === storedChatState.activeChatId
		) ?? null
	);
	const activeChatIdRef = useRef(
		storedChatState.chats.find(
			(chat) => chat.chatId === storedChatState.activeChatId
		)?.chatId ?? null
	);
	const [message, setMessage] = useState('');
	const messageInputRef = useRef<HTMLInputElement | null>(null);
	const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(
		storedChatState.messagesByChat
	);
	const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(
		storedChatState.unreadCounts ?? {}
	);
	const totalUnreadCount = Object.values(unreadCounts).reduce(
		(total, count) => total + count,
		0
	);
	const messages = activeChat ? messagesByChat[activeChat.chatId] ?? [] : [];
	const processedMessages = useRef(new Set<string>());
	const readMessageIds = useRef(new Set<string>());
	const [isCreatingChat, setIsCreatingChat] = useState(false);
	const [error, setError] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [sendError, setSendError] = useState('');
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const activeTheme = getThemePalette(themeId, customThemeColor);
	const themeStyles = {
		'--green': activeTheme.primary,
		'--green-dark': activeTheme.dark,
		'--green-soft': activeTheme.soft,
		'--green-light': activeTheme.light,
		'--green-rgb': activeTheme.rgb,
		'--green-contrast': getThemeContrast(activeTheme.primary),
		'--chat-background': activeTheme.background,
	} as CSSProperties;

	useChatSettings(themeId, customThemeColor, chatPatternId);

async function createChat(e: React.FormEvent<HTMLFormElement>) {
	e.preventDefault();

	const value = phone.trim();
	if (!value) return setError('Введите номер телефона');

	setIsCreatingChat(true);
	setError('');

	try {
		const result = await api.checkAccount(Number(value));

		if (!result.exist || !result.chatId) {
			return setError('Telegram аккаунт с таким номером не найден');
		}

		const chat = await getChatInfo(api, result.chatId, value, {
			name: result.name,
			displayName: result.displayName,
			username: result.username,
		});
		console.log(chat);
		
		const { chat: selected, chats: updated } =
			upsertChat(chatsRef.current, chat);

		chatsRef.current = updated;
		setChats(updated);
		setActiveChat(selected);
		setUnreadCounts(prev => ({ ...prev, [selected.chatId]: 0 }));

		setPhone('');
		setMessage('');
		setSendError('');
	} catch {
		setError('Не удалось создать чат. Попробуйте ещё раз.');
	} finally {
		setIsCreatingChat(false);
	}
}


async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();

	const text = message.trim();

	if (!activeChat || !text) {
		return;
	}

	setIsSending(true);
	setSendError('');
	let messageSent = false;

	try {
		const result = await api.sendMessage(
			activeChat.chatId,
			text
		);

		const newMessage: Message = {
			id: result.idMessage,
			text,
			sender: 'me',
			timestamp: Date.now(),
			status: readMessageIds.current.has(result.idMessage) ? 'read' : 'sent',
		};

		setMessagesByChat((previous) => ({
			...previous,
			[activeChat.chatId]: [
				...(previous[activeChat.chatId] ?? []),
				newMessage,
			],
		}));

		setMessage('');
		messageSent = true;
	} catch (error) {
		console.error(
			'Ошибка отправки сообщения:',
			error
		);

		setSendError('Не удалось отправить сообщение. Попробуйте ещё раз.');
	} finally {
		setIsSending(false);
		if (messageSent) {
			window.requestAnimationFrame(() => messageInputRef.current?.focus());
		}
	}
}

	useChatNotifications({
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
	});

	useChatProfiles({ api, chats, chatsRef, setChats, setActiveChat });

	useChatStorage({
		chats,
		messagesByChat,
		unreadCounts,
		activeChatId: activeChat?.chatId ?? null,
	});

  return (
	<div className="chat" data-chat-pattern={chatPatternId} style={themeStyles}>
			<ChatRail
				totalUnreadCount={totalUnreadCount}
				isSettingsOpen={isSettingsOpen}
				onOpenSettings={() => setIsSettingsOpen(true)}
			/>

			<div className={`chat__workspace${activeChat ? ' chat__workspace--conversation' : ''}`}>
				<ChatSidebar
					chats={chats}
					messagesByChat={messagesByChat}
					unreadCounts={unreadCounts}
					activeChatId={activeChat?.chatId ?? null}
					phone={phone}
					isCreatingChat={isCreatingChat}
					error={error}
					statusSetupNotice={statusSetupNotice}
					onCreateChat={createChat}
					onPhoneChange={setPhone}
					onSelectChat={(chat) => {
						activeChatIdRef.current = chat.chatId;
						setActiveChat(chat);
						setUnreadCounts((previous) => ({ ...previous, [chat.chatId]: 0 }));
						setMessage('');
						setSendError('');
					}}
					onOpenSettings={() => setIsSettingsOpen(true)}
				/>
				<ChatConversation
					hasChats={chats.length > 0}
					activeChat={activeChat}
					messages={messages}
					message={message}
					sendError={sendError}
					isSending={isSending}
					messageInputRef={messageInputRef}
					onMessageChange={setMessage}
					onSubmit={sendMessage}
					onBackToChats={() => {
						activeChatIdRef.current = null;
						setActiveChat(null);
						setMessage('');
						setSendError('');
					}}
					onOpenSettings={() => setIsSettingsOpen(true)}
				/>
			</div>
			{isSettingsOpen && (
				<ChatSettingsDialog
					themeId={themeId}
					customThemeColor={customThemeColor}
					chatPatternId={chatPatternId}
					onThemeChange={setThemeId}
					onCustomColorChange={(color) => {
						setCustomThemeColor(color);
						setThemeId('custom');
					}}
					onPatternChange={setChatPatternId}
					onClose={() => setIsSettingsOpen(false)}
					onLogout={() => {
						setIsSettingsOpen(false);
						setIsLogoutDialogOpen(true);
					}}
				/>
			)}
			{isLogoutDialogOpen && (
				<LogoutConfirmDialog
					onCancel={() => setIsLogoutDialogOpen(false)}
					onConfirm={onLogout}
				/>
			)}
    </div>
  );
}