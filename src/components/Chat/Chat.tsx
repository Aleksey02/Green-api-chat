import { useEffect, useState, useRef } from 'react';
import type {
	ChatInfo,
	Message,
	Notification,
} from '../../types/chat';

type ChatProps = {
	api: {
		checkAccount: (phoneNumber: number) => Promise<{
			exist: boolean;
			chatId: string;
			username?: string;
			phoneNumber?: number;
			fromCache?: boolean;
		}>;

		sendMessage: (
			chatId: string,
			message: string
		) => Promise<{ idMessage: string }>;

		receiveNotification: () => Promise<Notification | null>;

		deleteNotification: (
			receiptId: number
		) => Promise<Response>;
	};

	onLogout: () => void;
};

export function Chat({ api, onLogout }: ChatProps) {
	const [phone, setPhone] = useState('');
	const [activeChat, setActiveChat] = useState<ChatInfo | null>(null);
	const activeChatRef = useRef<ChatInfo | null>(null);
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const processedMessages = useRef(new Set<string>());
	const [isCreatingChat, setIsCreatingChat] = useState(false);
	const [error, setError] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [sendError, setSendError] = useState('');

async function createChat(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault();

	const value = phone.trim();

	if (!value) {
		setError('Введите номер телефона');
		return;
	}

	setIsCreatingChat(true);
	setError('');

	try {
		const result = await api.checkAccount(Number(value));

		if (!result.exist || !result.chatId) {
			setError('Telegram аккаунт с таким номером не найден');
			return;
		}

		const chat: ChatInfo = {
			chatId: result.chatId,
			phone: value,
			name: result.username,
		};

		setActiveChat(chat);
		activeChatRef.current = chat;

		setMessages([]);
	} catch (error) {
		console.error('Ошибка создания чата:', error);

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
		};

		setMessages((prev) => [
			...prev,
			newMessage,
		]);

		setMessage('');
	} catch (error) {
		console.error(
			'Ошибка отправки сообщения:',
			error
		);

		setSendError('Не удалось отправить сообщение. Попробуйте ещё раз.');
	} finally {
		setIsSending(false);
	}
}

	useEffect(() => {
		let isRunning = true;

		async function receiveMessages() {
			while (isRunning) {
				try {
					const notification = await api.receiveNotification();

					if (!notification) {
						continue;
					}

					console.log(
						'NOTIFICATION:',
						JSON.stringify(
							notification,
							null,
							2
						)
					);

					const body = notification.body;

					if (
						activeChatRef.current &&
						body.typeWebhook === 'incomingMessageReceived' &&
						body.senderData?.chatType === 'user' &&
						body.senderData?.chatId ===
						activeChatRef.current.chatId &&
						body.messageData?.typeMessage === 'textMessage'
					) {
						const text = body.messageData.textMessageData?.textMessage;

						if (text) {
						const messageId =
						body.idMessage ?? crypto.randomUUID();

						if (processedMessages.current.has(messageId)) {
						await api.deleteNotification(
							notification.receiptId
						);

					continue;
					}

					processedMessages.current.add(messageId);

		const newMessage: Message = {
		id: messageId,
		text,
		sender: 'other',
		timestamp: Date.now(),
		};

		setMessages((prev) => [
		...prev,
		newMessage,
		]);
		}
		}

				await api.deleteNotification(
				notification.receiptId
				);
			} catch (error) {
				console.error(
				'Ошибка получения сообщения:',
				error
				);

				await new Promise((resolve) =>
				setTimeout(resolve, 3000)
				);
			}
			}
		}

		receiveMessages();

		return () => {
			isRunning = false;
		};
	}, [api]);

	useEffect(() => {
	messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [messages]);

  return (
    <div className="chat">
      <header className="chat__header">
        <div className="chat__brand">
          <span className="chat__brand-mark" aria-hidden="true">M</span>
          <span>Линия</span>
        </div>
        <div className="chat__header-contact">
          <span className="chat__avatar" aria-hidden="true">
            {(activeChat?.name || activeChat?.phone || 'Ч').slice(0, 1).toUpperCase()}
          </span>
          <div className="chat__header-copy">
            <strong>{activeChat?.name || activeChat?.phone || 'Ваши сообщения'}</strong>
            <span>{activeChat?.phone || 'GREEN-API · личные чаты'}</span>
          </div>
        </div>

        <button className="button button--quiet chat__logout" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <div className="chat__layout">
        <aside className="chat__sidebar">
          <div className="chat__section-heading">
            <div>
              <p className="chat__eyebrow">ПРОСТРАНСТВО</p>
              <h2>Новый диалог</h2>
            </div>
            <span className="chat__section-icon" aria-hidden="true">＋</span>
          </div>
          <p className="chat__sidebar-copy">Введите номер телефона, чтобы начать переписку.</p>

          <form onSubmit={createChat} className="chat__create">
            <label className="field">
              <span className="field__label">Номер телефона</span>
              <input
                inputMode="tel"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="79991234567"
              />
            </label>
            <button className="button button--primary" type="submit" disabled={isCreatingChat}>
              {isCreatingChat ? 'Создание...' : 'Создать чат'}
            </button>
          </form>

          {error && <div className="chat__error" role="alert">{error}</div>}

          <div className="chat__sidebar-divider" />
          <p className="chat__eyebrow">АКТИВНЫЙ ДИАЛОГ</p>
          {activeChat ? (
            <div className="chat__current">
              <span className="chat__avatar chat__avatar--small" aria-hidden="true">
                {(activeChat.name || activeChat.phone).slice(0, 1).toUpperCase()}
              </span>
              <span className="chat__current-copy">
                <strong>{activeChat.name || activeChat.phone}</strong>
                <span>{activeChat.phone}</span>
              </span>
              <span className="chat__online-dot" aria-label="Активный чат" />
            </div>
          ) : (
            <p className="chat__sidebar-empty">Пока нет активного диалога</p>
          )}
          <div className="chat__sidebar-bottom">Сообщения передаются через GREEN-API</div>
        </aside>

        <section className="chat__conversation" aria-label="Переписка">
          <main className="chat__messages" aria-live="polite">
            {activeChat ? (
              messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className={`message-row message-row--${message.sender}`}>
                    <div className={`message message--${message.sender}`}>
                      <p>{message.text}</p>
                      <time>
                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  </div>
                ))
              ) : (
                <div className="chat__empty-state">
                  <span className="chat__empty-icon" aria-hidden="true">✳</span>
                  <h2>Переписка начинается здесь</h2>
                  <p>Напишите первое сообщение, чтобы начать разговор.</p>
                </div>
              )
            ) : (
              <div className="chat__empty-state">
                <span className="chat__empty-icon" aria-hidden="true">↗</span>
                <h2>Создайте чат, чтобы начать переписку</h2>
                <p>Новый диалог появится здесь.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <div className="chat__composer-wrap">
            {sendError && <div className="chat__error chat__error--send" role="alert">{sendError}</div>}
            <form onSubmit={sendMessage} className="chat__input">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={activeChat ? 'Написать сообщение...' : 'Сначала создайте чат'}
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
      </div>
    </div>
  );
}