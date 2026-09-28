import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { createGreenApi } from '../services/greenApi';
import { ensureStatusNotifications } from '../utils/statusNotifications';

type GreenApi = ReturnType<typeof createGreenApi>;

export function useStatusSetupNotice(
	api: GreenApi | null,
	idInstance: string,
	setNotice: Dispatch<SetStateAction<string>>
) {
	const setupRequest = useRef<{ idInstance: string; promise: Promise<boolean> } | null>(null);

	useEffect(() => {
		if (!api || !idInstance) {
			return;
		}

		let isMounted = true;
		if (!setupRequest.current || setupRequest.current.idInstance !== idInstance) {
			const promise = ensureStatusNotifications(api, idInstance).catch((error: unknown) => {
				if (setupRequest.current?.idInstance === idInstance) {
					setupRequest.current = null;
				}
				throw error;
			});
			setupRequest.current = { idInstance, promise };
		}

		setupRequest.current.promise
			.then((configuredNow) => {
				if (isMounted) {
					setNotice(configuredNow
						? 'Уведомления о статусах включены. GREEN-API применяет настройки до 5 минут.'
						: '');
				}
			})
			.catch((error: unknown) => {
				console.error('Не удалось включить уведомления о статусах:', error);
				if (isMounted) {
					setNotice('Не удалось включить уведомления о прочтении. Проверьте доступ к настройкам GREEN-API.');
				}
			});

		return () => {
			isMounted = false;
		};
	}, [api, idInstance, setNotice]);
}