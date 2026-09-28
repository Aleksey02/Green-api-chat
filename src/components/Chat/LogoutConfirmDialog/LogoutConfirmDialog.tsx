import './LogoutConfirmDialog.scss';

type LogoutConfirmDialogProps = {
	onCancel: () => void;
	onConfirm: () => void;
};

export function LogoutConfirmDialog({ onCancel, onConfirm }: LogoutConfirmDialogProps) {
	return (
		<div
			className="logout-dialog-backdrop"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onCancel();
				}
			}}
		>
			<div className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
				<h2 id="logout-dialog-title">Вы точно хотите выйти?</h2>
				<div className="logout-dialog__actions">
					<button className="button button--quiet" autoFocus onClick={onCancel}>
						Нет
					</button>
					<button className="button button--primary" onClick={onConfirm}>
						Да
					</button>
				</div>
			</div>
		</div>
	);
}
