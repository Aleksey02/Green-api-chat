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

    configureMessageStatusNotifications() {
      return request<{ saveSettings: boolean }>('setSettings', {
        incomingWebhook: 'yes',
        outgoingAPIMessageWebhook: 'yes',
        outgoingWebhook: 'yes',
      });
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

    getChatHistory(chatId: string, count = 100) {
      return request<Array<{
        type: string;
        idMessage: string;
        statusMessage?: string;
      }>>('getChatHistory', { chatId, count });
    },

    getContactInfo(chatId: string) {
      return request<{
        name?: string;
        contactName?: string;
        displayName?: string;
        username?: string;
        avatar?: string;
        base64Avatar?: string;
      }>('getContactInfo', { chatId });
    },

    getAvatar(chatId: string) {
      return request<{
        urlAvatar?: string;
        available?: boolean;
        base64Avatar?: string;
      }>('getAvatar', { chatId });
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
    name?: string;
    displayName?: string;
    username?: string;
    phoneNumber?: number;
    fromCache?: boolean;
  }>('checkAccount', {
    phoneNumber,
  });
},
  };
}

export type GreenApiClient = ReturnType<typeof createGreenApi>;