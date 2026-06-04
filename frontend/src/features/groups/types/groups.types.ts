export type Group = {
  id: number;
  owner_id: number;
  institution_id?: number | null;
  name: string;
  description?: string | null;
  visibility?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type GroupMembership = {
  group_id: number;
  user_id: number;
  role?: string | null;
  status?: string | null;
  joined_at: string;
  group: Group;
};

export type GroupMember = {
  group_id: number;
  user_id: number;
  role?: string | null;
  status?: string | null;
  joined_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type ExploreGroup = {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  visibility?: string | null;
  created_at: string;
  owner?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  counts: {
    members: number;
    posts: number;
    channels: number;
  };
  viewer: {
    membership: {
      role?: string | null;
      status?: string | null;
    } | null;
    join_request: {
      id: number;
      status: string;
      created_at: string;
    } | null;
  };
};

export type GroupChannel = {
  id: number;
  group_id: number;
  name: string;
  type: string;
  description?: string | null;
  position_order?: number | null;
  created_at: string;
};

export type CreateGroupChannelRequest = {
  name: string;
  type: string;
  description?: string;
};

export type ChannelMessage = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  reply_to_message_id?: number | null;
  is_edited?: boolean;
  created_at: string;
  updated_at?: string | null;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
  };
};

export type ChannelJoinedPayload = {
  channel_id: number;
  conversation_id: number;
  messages: ChannelMessage[];
};

export type ChannelMessagePayload = {
  channel_id: number;
  conversation_id: number;
  message: ChannelMessage;
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
  visibility?: "public" | "private";
};

export type GroupApiResponse<T> = {
  message: string;
  data: T;
};

export type GroupApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};
