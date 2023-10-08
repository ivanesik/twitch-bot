import type {TAuthorizationScope} from 'types/twitch/ITwitchValidateTokenResponse';

/** https://dev.twitch.tv/docs/pubsub/#available-topics */
export const APP_REQUIRED_SCOPES: TAuthorizationScope[] = ['channel:read:redemptions'];
