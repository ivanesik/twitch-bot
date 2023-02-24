export const PUB_SUB_EVENTS = {
    /** A custom reward is redeemed in a channel.  */
    channelPoints: (userId: string) => `channel-points-channel-v1.${userId}`,
};
