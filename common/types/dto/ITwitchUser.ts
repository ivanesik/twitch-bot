import {ETwitchPermission} from '@/common/constants/twitch';

export interface ITwitchUser {
    twitchUserId: string;
    twitchToken: string;
    /** Date.valueOf() */
    timestamp: number;
    /** Amount of seconds from timestamp */
    twitchTokenExpiresIn: number;
    twitchLogin: string;
    twitchScopes: ETwitchPermission[];
}
