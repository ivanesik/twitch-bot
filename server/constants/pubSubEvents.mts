type TTwitchPubSubTopic = `channel-points-channel-v1.${number | string}`;

export const twitchPubSubTopics: Record<
    string,
    (...args: (string | number)[]) => TTwitchPubSubTopic
> = {
    /** A custom reward is redeemed in a channel.  */
    channelPoints: (userId: number | string) => `channel-points-channel-v1.${userId}`,
};
