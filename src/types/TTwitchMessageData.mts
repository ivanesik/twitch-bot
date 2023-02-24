import {THexColor} from './common.mjs';
import {IRewardImage} from './twitchReward.mjs';

/** @example '2023-02-24T21:33:07.704059988Z' */
type TDateLikeType = string;

interface IPongMessageData {
    type: 'PONG';
    error: undefined;
    data: undefined;
}

/** Received on PubSub Subscribe */
interface IResponseMessageData {
    type: 'RESPONSE';
    error: '';
    nonce: '';
    data: undefined;
}

/**
 * Clients may receive a RECONNECT message at any time. This indicates that the server is about to
 * restart (typically for maintenance) and will disconnect the client within 30 seconds. During this
 * time, we recommend that clients reconnect to the server; otherwise, the client will be forcibly
 * disconnected.
 */
interface IReconnectMessageData {
    type: 'RECONNECT';
    error: undefined;
    nonce: undefined;
    data: undefined;
}

export interface IRewardData {
    type: 'reward-redeemed';
    data: {
        timestamp: TDateLikeType;
        redemption: {
            /** @example '7f639c46-3fa2-4431-9d04-4a982315fa9c' */
            id: string;
            user: {
                id: string;
                login: string;
                display_name: string;
            };
            channel_id: string;
            redeemed_at: TDateLikeType;
            reward: {
                id: '3f6701cf-223b-4a78-bf53-3a27d2c3a3e0';
                channel_id: string;
                /** @example 'Нелюбимый зритель стрима' */
                title: string;
                prompt: string;
                /** Cost of reward in channel points */
                cost: number;
                is_user_input_required: boolean;
                is_sub_only: boolean;
                image: IRewardImage;
                default_image: IRewardImage;
                background_color: THexColor;
                is_enabled: boolean;
                is_paused: boolean;
                is_in_stock: boolean;
                max_per_stream: {
                    is_enabled: boolean;
                    /** 0 - is unlimited */
                    max_per_stream: number;
                };
                should_redemptions_skip_request_queue: boolean;
                template_id: null;
                updated_for_indicator_at: TDateLikeType;
                max_per_user_per_stream: {
                    is_enabled: boolean;
                    /** 0 - is unlimited */
                    max_per_user_per_stream: number;
                };
                global_cooldown: {
                    is_enabled: boolean;
                    /** 0 - is unlimited */
                    global_cooldown_seconds: number;
                };
                redemptions_redeemed_current_stream: null;
                cooldown_expires_at: null;
            };
            status: 'UNFULFILLED';
        };
    };
}

interface IRewardRedeemedMessageData {
    type: 'MESSAGE';
    error: undefined;
    data: {
        topic: 'channel-points-channel-v1.424342489';
        message: string;
    };
}

interface IBadAuthErrorMessageData {
    type: 'RESPONSE';
    error: 'ERR_BADAUTH';
    nonce: '';
    data: undefined;
}

interface IUnknownErrorMessageData {
    type: 'RESPONSE';
    error: string;
    nonce: '';
    data: undefined;
}

type TErrorMessageData = IBadAuthErrorMessageData | IUnknownErrorMessageData;

export type TTwitchMessageData =
    | IPongMessageData
    | IResponseMessageData
    | IReconnectMessageData
    | IRewardRedeemedMessageData
    | TErrorMessageData;
