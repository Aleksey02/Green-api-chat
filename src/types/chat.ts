export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
};

export type ChatInfo = {
  chatId: string;
  phone: string;
  name?: string;
  avatar?: string;
};

export type Notification = {
  receiptId: number;

  body: {
    typeWebhook?: string;
    type?: string;
    idMessage?: string;
    chatId?: string;
    status?: string;
    statusMessage?: string;

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

      extendedTextMessageData?: {
        text: string;
        description?: string;
        title?: string;
      };
    };
  };
};