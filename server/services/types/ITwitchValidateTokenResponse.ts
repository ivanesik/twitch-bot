import {ETwitchPermission} from '@/common/constants/twitch';

export interface ITwitchValidateTokenResponse {
    client_id: string;
    /** @example 'IvanesY' */
    login: string;
    scopes: ETwitchPermission[];
    /** @example '424342489' */
    user_id: string;
    /**
     * Seconds to moment when token will be expired
     *
     * @example '4425601'
     */
    expires_in: 4425601;
}
