import { createGreenApi } from '../services/greenApi';

export const ID_INSTANCE_KEY = 'green-api-chat.idInstance';
export const API_TOKEN_INSTANCE_KEY = 'green-api-chat.apiTokenInstance';
export const CHAT_STORAGE_KEY = 'green-api-chat.chats';

export function getSavedInstanceId() {
	return localStorage.getItem(ID_INSTANCE_KEY)?.trim() ?? '';
}

export function createApiSession(idInstance: string, apiTokenInstance: string) {
	return createGreenApi({ idInstance, apiTokenInstance });
}

export function restoreApiSession() {
	const idInstance = getSavedInstanceId();
	const apiTokenInstance = localStorage.getItem(API_TOKEN_INSTANCE_KEY)?.trim();

	if (!idInstance || !apiTokenInstance) {
		return null;
	}

	return createApiSession(idInstance, apiTokenInstance);
}

export function clearApiSession() {
	localStorage.removeItem(ID_INSTANCE_KEY);
	localStorage.removeItem(API_TOKEN_INSTANCE_KEY);
	localStorage.removeItem(CHAT_STORAGE_KEY);
}