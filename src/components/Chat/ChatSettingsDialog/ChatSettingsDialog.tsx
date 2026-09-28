import './ChatSettingsDialog.scss';
import {
	APP_THEMES,
	CHAT_PATTERNS,
	type ChatPatternId,
	type ThemeSelection,
} from '../../../utils/chatTheme';

type ChatSettingsDialogProps = {
	themeId: ThemeSelection;
	customThemeColor: string;
	chatPatternId: ChatPatternId;
	onThemeChange: (theme: ThemeSelection) => void;
	onCustomColorChange: (color: string) => void;
	onPatternChange: (pattern: ChatPatternId) => void;
	onClose: () => void;
	onLogout: () => void;
};

export function ChatSettingsDialog({
	themeId,
	customThemeColor,
	chatPatternId,
	onThemeChange,
	onCustomColorChange,
	onPatternChange,
	onClose,
	onLogout,
}: ChatSettingsDialogProps) {
	return (
		<div
			className="settings-dialog-backdrop"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<section
				className="settings-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby="settings-dialog-title"
			>
				<header className="settings-dialog__header">
					<h2 id="settings-dialog-title">Настройки</h2>
					<button className="settings-dialog__close" type="button" aria-label="Закрыть настройки" onClick={onClose}>
						×
					</button>
				</header>
				<fieldset className="settings-dialog__themes">
					<legend>Цвет приложения</legend>
					<div className="settings-theme-options" role="group" aria-label="Цвет приложения">
						{APP_THEMES.map((theme) => (
							<button
								key={theme.id}
								type="button"
								className={`settings-theme-option${themeId === theme.id ? ' settings-theme-option--selected' : ''}`}
								aria-label={theme.name}
								aria-pressed={themeId === theme.id}
								title={theme.name}
								onClick={() => onThemeChange(theme.id)}
							>
								<span className="settings-theme-option__swatch" style={{ backgroundColor: theme.primary }}>
									{themeId === theme.id && <span aria-hidden="true">✓</span>}
								</span>
								<span className="settings-theme-option__label">{theme.name}</span>
							</button>
						))}
						<label className={`settings-theme-option settings-theme-option--custom${themeId === 'custom' ? ' settings-theme-option--selected' : ''}`}>
							<input
								className="settings-theme-option__color"
								type="color"
								value={customThemeColor}
								aria-label="Выбрать свой цвет приложения"
								onChange={(event) => onCustomColorChange(event.target.value)}
							/>
							<span className="settings-theme-option__label">Свой цвет</span>
						</label>
					</div>
				</fieldset>
				<fieldset className="settings-dialog__themes settings-dialog__patterns">
					<legend>Узор фона переписки</legend>
					<div className="settings-pattern-options" role="group" aria-label="Узор фона переписки">
						{CHAT_PATTERNS.map((pattern) => (
							<button
								key={pattern.id}
								type="button"
								className={`settings-pattern-option${chatPatternId === pattern.id ? ' settings-pattern-option--selected' : ''}`}
								aria-label={pattern.name}
								aria-pressed={chatPatternId === pattern.id}
								onClick={() => onPatternChange(pattern.id)}
							>
								<span className={`settings-pattern-preview settings-pattern-preview--${pattern.id}`} aria-hidden="true" />
								<span className="settings-theme-option__label">{pattern.name}</span>
							</button>
						))}
					</div>
				</fieldset>
				<div className="settings-dialog__footer">
					<button className="button button--quiet settings-dialog__logout" type="button" onClick={onLogout}>
						Выйти из инстанса
					</button>
				</div>
			</section>
		</div>
	);
}
