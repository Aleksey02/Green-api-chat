import { useState } from 'react';
import './ChatAvatar.scss';
import type { ChatInfo } from '../../../types/chat';

type ChatAvatarProps = {
	chat: ChatInfo;
};

export function ChatAvatar({ chat }: ChatAvatarProps) {
	const [imageFailed, setImageFailed] = useState(false);
	const shouldShowImage = Boolean(chat.avatar) && !imageFailed;

	return (
		<span className="chat__avatar" aria-hidden="true">
			{!shouldShowImage && (chat.name || chat.phone).slice(0, 1).toUpperCase()}
			{shouldShowImage && (
				<img
					className="chat__avatar-image"
					src={chat.avatar}
					alt=""
					onError={() => setImageFailed(true)}
				/>
			)}
		</span>
	);
}
