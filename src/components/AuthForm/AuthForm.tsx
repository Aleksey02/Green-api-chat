import { useState } from 'react';

type AuthFormProps = {
	onSubmit: (idInstance: string, apiTokenInstance: string) => void;
};

export function AuthForm({ onSubmit }: AuthFormProps) {
	const [idInstance, setIdInstance] = useState('');
	const [apiTokenInstance, setApiTokenInstance] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		onSubmit(idInstance, apiTokenInstance);
	}

	return (
		<main className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<div className="auth-card__mark" aria-hidden="true">M</div>
				<p className="auth-card__eyebrow">Личный мессенджер</p>
				<h1>Подключение к GREEN-API</h1>
				<p className="auth-card__description">
					Введите данные вашего инстанса, чтобы открыть переписки.
				</p>

				<label className="field">
					<span className="field__label">ID инстанса</span>
					<input
						autoComplete="username"
						value={idInstance}
						onChange={(event) => setIdInstance(event.target.value)}
						placeholder="Например, 1101000001"
						required
					/>
				</label>

				<label className="field">
					<span className="field__label">Токен инстанса</span>
					<input
						autoComplete="current-password"
						value={apiTokenInstance}
						onChange={(event) => setApiTokenInstance(event.target.value)}
						placeholder="Введите apiTokenInstance"
						type="password"
						required
					/>
				</label>

				<button className="button button--primary auth-card__submit" type="submit">
					Подключиться
					<span aria-hidden="true">→</span>
				</button>
				<p className="auth-card__footnote">Данные используются только для подключения к API.</p>
			</form>
		</main>
	);
}