import type { FormEvent } from 'react';
import './ChatSidebar.scss';
import type { ChatInfo, Message } from '../../../types/chat';
import { ChatAvatar } from '../ChatAvatar/ChatAvatar';

type ChatSidebarProps = {
	chats: ChatInfo[];
	messagesByChat: Record<string, Message[]>;
	unreadCounts: Record<string, number>;
	activeChatId: string | null;
	phone: string;
	isCreatingChat: boolean;
	error: string;
	statusSetupNotice?: string;
	onCreateChat: (event: FormEvent<HTMLFormElement>) => void;
	onPhoneChange: (value: string) => void;
	onSelectChat: (chat: ChatInfo) => void;
	onOpenSettings: () => void;
};

export function ChatSidebar({
	chats,
	messagesByChat,
	unreadCounts,
	activeChatId,
	phone,
	isCreatingChat,
	error,
	statusSetupNotice,
	onCreateChat,
	onPhoneChange,
	onSelectChat,
	onOpenSettings,
}: ChatSidebarProps) {
	return (
		<aside className="chat__sidebar">
			<div className="chat__list-heading">
				<h1>Чаты</h1>
				<button
					className="chat__mobile-settings"
					type="button"
					title="Настройки"
					aria-label="Настройки"
					aria-haspopup="dialog"
					onClick={onOpenSettings}
				>
					⚙
				</button>
			</div>

			<form onSubmit={onCreateChat} className="chat__search-form">
				<input
					inputMode="tel"
					type="tel"
					value={phone}
					onChange={(event) => onPhoneChange(event.target.value)}
					placeholder="Номер телефона"
					aria-label="Номер телефона для нового чата"
				/>
				<button type="submit" disabled={isCreatingChat} title="Создать чат" aria-label="Создать чат">
					{isCreatingChat ? <span className="chat__loading-mark">…</span> : <span className="chat__add-mark" aria-hidden="true">+</span>}
				</button>
			</form>
			{statusSetupNotice && (
				<div className="chat__status-setup-notice" role="status">
					{statusSetupNotice}
				</div>
			)}
			{error && <div className="chat__error" role="alert">{error}</div>}

			<p className="chat__list-label">ЛИЧНЫЕ СООБЩЕНИЯ</p>
			{chats.length > 0 ? (
				[...chats]
					.sort((first, second) =>
						(messagesByChat[second.chatId]?.at(-1)?.timestamp ?? 0) -
						(messagesByChat[first.chatId]?.at(-1)?.timestamp ?? 0)
					)
					.map((chat) => {
						const chatMessages = messagesByChat[chat.chatId] ?? [];
						const lastMessage = chatMessages.at(-1);
						const unreadCount = unreadCounts[chat.chatId] ?? 0;

						return (
							<button
								key={chat.chatId}
								type="button"
								className={`chat__contact-row${activeChatId === chat.chatId ? ' chat__contact-row--active' : ''}`}
								onClick={() => onSelectChat(chat)}
								aria-current={activeChatId === chat.chatId ? 'true' : undefined}
							>
								<ChatAvatar key={chat.avatar} chat={chat} />
								<span className="chat__contact-copy">
									<strong>{chat.name || chat.phone}</strong>
									<span>{lastMessage?.text || chat.phone}</span>
								</span>
								<span className="chat__contact-meta">
									{lastMessage && (
										<time className="chat__contact-time">
											{new Date(lastMessage.timestamp).toLocaleTimeString('ru-RU', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</time>
									)}
									{unreadCount > 0 && (
										<span className="chat__unread-badge" aria-label={`${unreadCount} непрочитанных сообщений`}>
											{unreadCount > 99 ? '99+' : unreadCount}
										</span>
									)}
								</span>
							</button>
						);
					})
			) : (
				<p className="chat__list-empty">Здесь появятся созданные чаты</p>
			)}
		</aside>
	);
}
