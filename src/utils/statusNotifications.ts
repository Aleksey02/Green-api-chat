import type { createGreenApi } from '../services/greenApi';

const STATUS_SETTINGS_KEY = 'green-api-chat.status-settings-configured';

type GreenApi = ReturnType<typeof createGreenApi>;

export async function ensureStatusNotifications(api: GreenApi, idInstance: string) {
	const configuredKey = `${STATUS_SETTINGS_KEY}.${idInstance}`;
	if (localStorage.getItem(configuredKey) === 'true') {
		return false;
	}

	const { saveSettings } = await api.configureMessageStatusNotifications();
	if (!saveSettings) {
		throw new Error('GREEN-API не подтвердила сохранение настроек');
	}

	localStorage.setItem(configuredKey, 'true');
	return true;
}