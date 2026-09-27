export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: number;
};

export type ChatInfo = {
  chatId: string;
  phone: string;
  name?: string;
};

export type Notification = {
  receiptId: number;

  body: {
    typeWebhook: string;
    idMessage?: string;

    senderData?: {
      chatId?: string;
      chatType?: string;
      sender?: string;
      senderName?: string;
      chatName?: string;
      senderType?: string;
      senderContactName?: string;
      senderPhoneNumber?: number;
    };

    messageData?: {
      typeMessage: string;

      textMessageData?: {
        textMessage: string;
        forwardingScore?: number;
        isForwarded?: boolean;
      };
    };
  };
};