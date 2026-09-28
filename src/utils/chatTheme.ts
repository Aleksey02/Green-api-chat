export const THEME_STORAGE_KEY = 'green-api-chat.theme';
export const CUSTOM_THEME_COLOR_KEY = 'green-api-chat.custom-theme-color';
export const CHAT_PATTERN_STORAGE_KEY = 'green-api-chat.background-pattern';

export const APP_THEMES = [
	{
		id: 'green',
		name: 'Зелёный',
		primary: '#267354',
		dark: '#1d5e43',
		soft: '#eaf4ed',
		light: '#3d8b63',
		background: '#edf4ee',
		rgb: '38 115 84',
	},
	{
		id: 'blue',
		name: 'Синий',
		primary: '#2d6f9f',
		dark: '#225478',
		soft: '#e8f1f7',
		light: '#5790b8',
		background: '#f0f5f8',
		rgb: '45 111 159',
	},
	{
		id: 'amber',
		name: 'Янтарный',
		primary: '#a45e20',
		dark: '#7d4518',
		soft: '#f8eee3',
		light: '#bf814a',
		background: '#f8f4ed',
		rgb: '164 94 32',
	},
	{
		id: 'rose',
		name: 'Розовый',
		primary: '#a44555',
		dark: '#7b3340',
		soft: '#f7ecee',
		light: '#bb707c',
		background: '#f8f2f2',
		rgb: '164 69 85',
	},
] as const;

export type AppThemeId = (typeof APP_THEMES)[number]['id'];
export type ThemeSelection = AppThemeId | 'custom';
export type ThemePalette = {
	primary: string;
	dark: string;
	soft: string;
	light: string;
	background: string;
	rgb: string;
};

export const CHAT_PATTERNS = [
	{ id: 'circles', name: 'Кружки' },
	{ id: 'dots', name: 'Точки' },
	{ id: 'grid', name: 'Сетка' },
	{ id: 'none', name: 'Без узора' },
] as const;

export type ChatPatternId = (typeof CHAT_PATTERNS)[number]['id'];

export function isHexColor(value: string | null): value is string {
	return Boolean(value && /^#[\da-f]{6}$/i.test(value));
}

function getColorChannels(hexColor: string) {
	return [1, 3, 5].map((offset) => Number.parseInt(hexColor.slice(offset, offset + 2), 16));
}

function mixHexColors(color: string, target: string, targetWeight: number) {
	const colorChannels = getColorChannels(color);
	const targetChannels = getColorChannels(target);

	return `#${colorChannels
		.map((channel, index) =>
			Math.round(channel + (targetChannels[index] - channel) * targetWeight)
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;
}

export function getThemeContrast(hexColor: string) {
	const linearChannels = getColorChannels(hexColor).map((channel) => {
		const normalized = channel / 255;
		return normalized <= 0.04045
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	});
	const luminance = linearChannels[0] * 0.2126 + linearChannels[1] * 0.7152 + linearChannels[2] * 0.0722;
	const whiteContrast = 1.05 / (luminance + 0.05);
	const darkContrast = (luminance + 0.05) / 0.05;

	return whiteContrast >= darkContrast ? '#ffffff' : '#17231b';
}

export function getThemePalette(themeId: ThemeSelection, customColor: string): ThemePalette {
	if (themeId === 'custom') {
		return {
			primary: customColor,
			dark: mixHexColors(customColor, '#000000', 0.24),
			soft: mixHexColors(customColor, '#ffffff', 0.91),
			light: mixHexColors(customColor, '#ffffff', 0.2),
			background: mixHexColors(customColor, '#ffffff', 0.95),
			rgb: getColorChannels(customColor).join(' '),
		};
	}

	return APP_THEMES.find((theme) => theme.id === themeId) ?? APP_THEMES[0];
}
