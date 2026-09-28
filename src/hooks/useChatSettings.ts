import { useEffect } from 'react';
import {
	CHAT_PATTERN_STORAGE_KEY,
	CUSTOM_THEME_COLOR_KEY,
	THEME_STORAGE_KEY,
	type ChatPatternId,
	type ThemeSelection,
} from '../utils/chatTheme';

export function useChatSettings(
	themeId: ThemeSelection,
	customThemeColor: string,
	chatPatternId: ChatPatternId
) {
	useEffect(() => {
		localStorage.setItem(THEME_STORAGE_KEY, themeId);
		localStorage.setItem(CUSTOM_THEME_COLOR_KEY, customThemeColor);
		localStorage.setItem(CHAT_PATTERN_STORAGE_KEY, chatPatternId);
	}, [themeId, customThemeColor, chatPatternId]);
}
