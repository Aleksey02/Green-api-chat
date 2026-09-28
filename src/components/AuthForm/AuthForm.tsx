import { useState } from 'react';
import './AuthForm.scss';
import { API_TOKEN_INSTANCE_KEY, ID_INSTANCE_KEY } from '../../utils/appSession';

interface AuthFormProps {
	onSubmit: (idInstance: string, apiTokenInstance: string) => void;
};

export function AuthForm({ onSubmit }: AuthFormProps) {
	const [idInstance, setIdInstance] = useState(() => localStorage.getItem(ID_INSTANCE_KEY) ?? '');
	const [apiTokenInstance, setApiTokenInstance] = useState(() => localStorage.getItem(API_TOKEN_INSTANCE_KEY) ?? '');

	const handleIdInstanceChange = (value: string) => {
		setIdInstance(value);
	}
	
	const handleApiTokenChange = (value: string) => {
		setApiTokenInstance(value);
	}
	
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		
		localStorage.setItem(ID_INSTANCE_KEY, idInstance);
		localStorage.setItem(API_TOKEN_INSTANCE_KEY, apiTokenInstance);
		onSubmit(idInstance, apiTokenInstance);
	}

	return (
		<main className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<div className="auth-card__mark" aria-hidden="true">G-A</div>
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
						onChange={(event) => handleIdInstanceChange(event.target.value)}
						placeholder="Например, 1101000001"
						required
					/>
				</label>

				<label className="field">
					<span className="field__label">Токен инстанса</span>
					<input
						autoComplete="current-password"
						value={apiTokenInstance}
						onChange={(event) => handleApiTokenChange(event.target.value)}
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