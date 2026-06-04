import { api } from "@/lib/axios";

export type MutualUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export type Participant = {
  user_id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
};

export type MessageType = "text" | "image" | "file" | "system";

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string | null;
  message_type: MessageType;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  reply_to_message_id: number | null;
  reply_to_message: Message | null;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
  };
};

export type Conversation = {
  id: number;
  type: "private" | "group" | "channel";
  name: string | null;
  created_by: number;
  created_at: string;
  conversation_participants: Participant[];
  messages: Message[]; // last message only (preview)
};

async function getMutualFollows(): Promise<MutualUser[]> {
  const { data } = await api.get<MutualUser[]>("/conversations/mutual-follows");
  return data;
}

async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/conversations");
  return data;
}

async function getMessages(conversationId: number): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
  return data;
}

async function createConversation(participantId: number): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/conversations", {
    type: "private",
    participant_id: participantId,
  });
  return data;
}

async function sendMessage(
  conversationId: number,
  content: string,
  replyToMessageId?: number
): Promise<Message> {
  const { data } = await api.post<Message>(`/conversations/${conversationId}/messages`, {
    content,
    message_type: "text",
    ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
  });
  return data;
}

export const messagesApi = {
  getMutualFollows,
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
};