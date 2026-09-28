import './ChatRail.scss';

type ChatRailProps = {
	totalUnreadCount: number;
	isSettingsOpen: boolean;
	onOpenSettings: () => void;
};

export function ChatRail({ totalUnreadCount, isSettingsOpen, onOpenSettings }: ChatRailProps) {
	return (
		<aside className="chat__rail" aria-label="Навигация">
			<div className="chat__rail-logo" aria-hidden="true">G-A</div>
			<div
				className="chat__rail-item chat__rail-item--active"
				aria-current="page"
				aria-label={totalUnreadCount > 0 ? `Чаты, непрочитанных сообщений: ${totalUnreadCount}` : 'Чаты'}
			>
				<span className="chat__rail-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" focusable="false">
						<path d="M12 3.5c-5.1 0-9.2 3.6-9.2 8.1 0 1.7.6 3.3 1.7 4.6L3.5 21l4.6-2.1c1.2.5 2.5.8 3.9.8 5.1 0 9.2-3.6 9.2-8.1S17.1 3.5 12 3.5Z" />
						<circle cx="8.2" cy="11.6" r="1.1" />
						<circle cx="12" cy="11.6" r="1.1" />
						<circle cx="15.8" cy="11.6" r="1.1" />
					</svg>
					{totalUnreadCount > 0 && (
						<span className="chat__rail-unread" aria-label={`${totalUnreadCount} непрочитанных сообщений`}>
							{totalUnreadCount > 99 ? '99+' : totalUnreadCount}
						</span>
					)}
				</span>
				<small>Все</small>
			</div>
			<div className="chat__rail-spacer" />
			<button
				className="chat__rail-settings"
				type="button"
				title="Настройки"
				aria-label="Настройки"
				aria-haspopup="dialog"
				aria-expanded={isSettingsOpen}
				onClick={onOpenSettings}
			>
				⚙
			</button>
			<small className="chat__rail-label">GREEN-API</small>
		</aside>
	);
}
