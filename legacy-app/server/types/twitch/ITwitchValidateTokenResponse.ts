export type TAuthorizationScope = 'channel:read:redemptions';

export interface ITwitchValidateTokenResponse {
    client_id: string;
    login: string;
    scopes: TAuthorizationScope[];
    /** @example '424342489' */
    user_id: string;
    expires_in: 4425601;
}
