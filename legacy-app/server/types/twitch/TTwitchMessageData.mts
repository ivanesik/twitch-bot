import type {TwitchEventSubTopic} from 'constants/eventSubEvents.mjs';

/** @example '2023-02-24T21:33:07.704059988Z' */
type TDateLikeType = string;

type TEventSubWsSessionStatus = 'connected' | 'reconnecting';

interface ITwitchEventSubMetadata<TEvent extends string> {
    message_id: string;
    message_type: TEvent;
    message_timestamp: TDateLikeType;
}

interface ITwitchSessionWelcomeMessageData {
    metadata: ITwitchEventSubMetadata<'session_welcome'>;
    payload: {
        session: {
            id: string;
            status: TEventSubWsSessionStatus;
            connected_at: TDateLikeType;
            keepalive_timeout_seconds: number;
            reconnect_url: null | string;
            recovery_url: null | string;
        };
    };
}

interface ITwitchSessionKeepAliveMessageData {
    metadata: ITwitchEventSubMetadata<'session_keepalive'>;
    payload: Record<string, never>;
}

interface ITwitchReconnectMessageData {
    metadata: ITwitchEventSubMetadata<'session_reconnect'>;
    payload: {
        session: {
            id: string;
            status: 'reconnecting';
            keepalive_timeout_seconds: null | number;
            reconnect_url: string;
            connected_at: TDateLikeType;
        };
    };
}

interface ITwitchReward {
    id: string;
    title: string;
    prompt: string;
    cost: number;
}

export interface ITwitchNotificationPayloadEvent {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    user_id: string;
    /** @example ivanesy */
    user_login: string;
    /** @example IvanesY */
    user_name: string;
    user_input: string;
    status: 'unfulfilled';
    redeemed_at: TDateLikeType;
    reward: ITwitchReward;
}

interface ITwitchNotificationMessageData {
    metadata: ITwitchEventSubMetadata<'notification'> & {
        subscription_type: TwitchEventSubTopic;
        subscription_version: '1';
    };
    payload: {
        subscription: {
            id: string;
            status: 'enabled';
            type: TwitchEventSubTopic;
            version: '1';
            condition: {
                broadcaster_user_id: string;
                reward_id: string;
            };
            transport: {
                method: 'websocket';
                session_id: string;
            };
            created_at: TDateLikeType;
            cost: 0;
        };
        event: ITwitchNotificationPayloadEvent;
    };
}

interface ITwitchUnhandledMessageData {
    metadata: ITwitchEventSubMetadata<string>;
}

export type TTwitchEventSubMessageData =
    | ITwitchSessionWelcomeMessageData
    | ITwitchSessionKeepAliveMessageData
    | ITwitchReconnectMessageData
    | ITwitchNotificationMessageData
    | ITwitchUnhandledMessageData;

export function isTwitchSessionWelcomeMessage(
    event: TTwitchEventSubMessageData,
): event is ITwitchSessionWelcomeMessageData {
    return event.metadata.message_type === 'session_welcome';
}

export function isTwitchSessionKeepAliveMessage(
    event: TTwitchEventSubMessageData,
): event is ITwitchSessionKeepAliveMessageData {
    return event.metadata.message_type === 'session_keepalive';
}

export function isTwitchReconnectMessage(
    event: TTwitchEventSubMessageData,
): event is ITwitchReconnectMessageData {
    return event.metadata.message_type === 'session_reconnect';
}

export function isTwitchNotificationMessage(
    event: TTwitchEventSubMessageData,
): event is ITwitchNotificationMessageData {
    return event.metadata.message_type === 'notification';
}
