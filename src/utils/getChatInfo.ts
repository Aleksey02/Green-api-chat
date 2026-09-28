import { getAvatarSource, firstValue } from './chatState';
import type { GreenApiClient } from '../services/greenApi';
import type { ChatInfo } from '../types/chat';

type ContactInfo = {
	name?: string;
	contactName?: string;
	displayName?: string;
	username?: string;
	avatar?: string;
	base64Avatar?: string;
};

type AccountInfo = {
	name?: string;
	displayName?: string;
	username?: string;
};

export async function getChatInfo(
	api: GreenApiClient,
	chatId: string,
	phone: string,
	account?: AccountInfo
): Promise<ChatInfo> {
	const contact: ContactInfo = await api.getContactInfo(chatId).catch(() => ({}));
	const resolvedName = firstValue(
		contact.name,
		contact.contactName,
		contact.displayName,
		contact.username,
		account?.name,
		account?.displayName,
		account?.username,
		phone
	);
	
	const avatarFromContact = getAvatarSource(contact.avatar, contact.base64Avatar);
	let avatar = avatarFromContact;

	if (!avatar) {
		try {
			const profileAvatar = await api.getAvatar(chatId);
			avatar = getAvatarSource(profileAvatar.urlAvatar, profileAvatar.base64Avatar);
		} catch {
			avatar = undefined;
		}
	}

	return {
		chatId,
		phone,
		name: resolvedName,
		avatar,
	};
}
