const API_URL = 'https://4100.api.green-api.com';
import type { Notification } from '../types/chat';

type GreenApiConfig = {
  idInstance: string;
  apiTokenInstance: string;
};

export function createGreenApi(config: GreenApiConfig) {
  const { idInstance, apiTokenInstance } = config;

  const baseUrl = `${API_URL}/waInstance${idInstance}`;

  async function request<T>(
    method: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(
      `${baseUrl}/${method}/${apiTokenInstance}`,
      {
        method: body ? 'POST' : 'GET',
        headers: body
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        error || `GREEN-API error: ${response.status}`
      );
    }

    return response.json();
  }

  return {
    getState() {
      return request('getStateInstance');
    },

    sendMessage(chatId: string, message: string) {
      return request<{ idMessage: string }>(
        'sendMessage',
        {
          chatId,
          message,
        }
      );
    },

    receiveNotification() {
  return fetch(
    `${baseUrl}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`
  ).then(async (response) => {
    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        error || `GREEN-API error: ${response.status}`
      );
    }

    const text = await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text) as Notification;
  });
},

    deleteNotification(receiptId: number) {
      return fetch(
        `${baseUrl}/deleteNotification/${apiTokenInstance}/${receiptId}`,
        {
          method: 'DELETE',
        }
      );
    },

	checkAccount(phoneNumber: number) {
  return request<{
    exist: boolean;
    chatId: string;
    username?: string;
    phoneNumber?: number;
    fromCache?: boolean;
  }>('checkAccount', {
    phoneNumber,
  });
},
  };
}