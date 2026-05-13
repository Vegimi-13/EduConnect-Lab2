import { AccessToken } from "livekit-server-sdk";
import { config } from "../../config/env";
import userRepository from "../../persistence/repositories/user.repository";
import messagingService from "./message.service";

const livekitService = {

    async createPrivateCallToken(userId: number, conversationId: number) {
        await messagingService.ensureCanAccessConversation(userId, conversationId);

        const user = await userRepository.findById(userId);
        const roomName = `private-conversation-${conversationId}`;

        return createToken({
            userId,
            name: user ? `${user.first_name} ${user.last_name}` : `User ${userId}`,
            roomName,
            canPublish: true,
            canSubscribe: true,
        })
    },

    async createChannelCallToken(userId: number, channelId: number) {
        const roomName = `group-channel-${channelId}`;

        return createToken({
            userId,
            name: `User ${userId}`,
            roomName,
            canPublish: true,
            canSubscribe: true,
        });
    },
}

function createToken(data:{
    userId: number;
    name: string;
    roomName: string;
    canPublish: boolean;
    canSubscribe: boolean;
}) {
    const token = new AccessToken(config.livekit.key, config.livekit.secret, {
        identity: String(data.userId),
        name: data.name,
        ttl: "2h",
    });

    token.addGrant({
        room: data.roomName,
        roomJoin: true,
        canPublish: data.canPublish,
        canSubscribe: data.canSubscribe,
    });

    return token.toJwt()
}

export default livekitService