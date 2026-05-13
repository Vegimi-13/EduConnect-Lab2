import { api } from "../../../lib/axios";

export type LiveKitTokenResponse = {
  token: string;
  roomName?: string;
  serverUrl?: string;
  url?: string;
};

export type LiveKitCallMode = "private" | "channel";

export async function getLiveKitToken(mode: LiveKitCallMode, id: string) {
  const path =
    mode === "private"
      ? `/livekit/private/${id}/token`
      : `/livekit/channels/${id}/token`;

  const { data } = await api.post<LiveKitTokenResponse>(path);
  return data;
}
