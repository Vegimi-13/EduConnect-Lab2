import { api } from "@/lib/axios";

export type LiveKitTokenResponse = {
  token: string;
  roomName: string;
  wsUrl: string;
};

const livekitApi = {
  async getPrivateCallToken(conversationId: number): Promise<LiveKitTokenResponse> {
    const { data } = await api.post<LiveKitTokenResponse>(
      `/livekit/private/${conversationId}/token`
    );
    return data;
  },
};

export default livekitApi;