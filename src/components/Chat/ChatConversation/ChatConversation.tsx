import { useEffect, useRef, type FormEvent, type RefObject } from 'react';
import './ChatConversation.scss';
import type { ChatInfo, Message } from '../../../types/chat';
import { ChatAvatar } from '../ChatAvatar/ChatAvatar';

type ChatConversationProps = {
	hasChats: boolean;
	activeChat: ChatInfo | null;
	messages: Message[];
	message: string;
	sendError: string;
	isSending: boolean;
	messageInputRef: RefObject<HTMLInputElement | null>;
	onMessageChange: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onBackToChats: () => void;
	onOpenSettings: () => void;
};

export function ChatConversation({
	hasChats,
	activeChat,
	messages,
	message,
	sendError,
	isSending,
	messageInputRef,
	onMessageChange,
	onSubmit,
	onBackToChats,
	onOpenSettings,
}: ChatConversationProps) {
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [activeChat?.chatId, messages.length]);

	return (
		<section className="chat__conversation" aria-label="Переписка">
			{hasChats && (
				<header className="chat__header">
					<button
						className="chat__mobile-action chat__mobile-back"
						type="button"
						title="Все чаты"
						aria-label="Вернуться к списку чатов"
						onClick={onBackToChats}
					>
						←
					</button>
					<div className="chat__header-contact">
						{activeChat ? (
							<ChatAvatar key={activeChat.avatar} chat={activeChat} />
						) : (
							<span className="chat__avatar" aria-hidden="true">Ч</span>
						)}
						<div className="chat__header-copy">
							<strong>{activeChat?.name || activeChat?.phone || 'Выберите чат'}</strong>
							<span>{activeChat?.phone || 'Личные сообщения'}</span>
						</div>
					</div>
					<button
						className="chat__mobile-action chat__mobile-conversation-settings"
						type="button"
						title="Настройки"
						aria-label="Настройки"
						aria-haspopup="dialog"
						onClick={onOpenSettings}
					>
						⚙
					</button>
				</header>
			)}

			<main className="chat__messages" aria-live="polite">
				{activeChat ? (
					messages.length > 0 ? (
						messages.map((item) => (
							<div key={item.id} className={`message-row message-row--${item.sender}`}>
								<div className={`message message--${item.sender}`}>
									<p>{item.text}</p>
									<div className="message__footer">
										<time>
											{new Date(item.timestamp).toLocaleTimeString('ru-RU', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</time>
										{item.sender === 'me' && (
											<span
												className={`message__status${item.status === 'read' ? ' message__status--read' : ''}`}
												aria-label={item.status === 'read' ? 'Сообщение прочитано' : 'Сообщение отправлено'}
												title={item.status === 'read' ? 'Прочитано' : 'Отправлено'}
											>
												{item.status === 'read' ? '✓✓' : '✓'}
											</span>
										)}
									</div>
								</div>
							</div>
						))
					) : (
						<div className="chat__empty-state">
							<h2>Переписка начинается здесь</h2>
							<p>Напишите первое сообщение, чтобы начать разговор.</p>
						</div>
					)
				) : (
					<div className="chat__empty-state">
						<h2>Выберите чат</h2>
						<p>Создайте диалог по номеру телефона, чтобы начать переписку.</p>
					</div>
				)}
				<div ref={messagesEndRef} />
			</main>

			<div className="chat__composer-wrap">
				{sendError && <div className="chat__error chat__error--send" role="alert">{sendError}</div>}
				<form onSubmit={onSubmit} className="chat__input">
					<input
						ref={messageInputRef}
						value={message}
						onChange={(event) => onMessageChange(event.target.value)}
						placeholder={activeChat ? 'Сообщение' : 'Сначала создайте чат'}
						disabled={!activeChat || isSending}
						aria-label="Текст сообщения"
					/>
					<button
						className="button button--primary chat__send"
						type="submit"
						disabled={!activeChat || !message.trim() || isSending}
						aria-label={isSending ? 'Отправка сообщения' : 'Отправить сообщение'}
					>
						<span>{isSending ? 'Отправка...' : 'Отправить'}</span>
						{!isSending && <span aria-hidden="true">↑</span>}
					</button>
				</form>
			</div>
		</section>
	);
}
