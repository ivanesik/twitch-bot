import {SECOND} from '@/common/constants/time';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';

export function isUserTokenActive(user: ITwitchUser): boolean {
    const now = new Date();
    const tokenExpiredDate = user
        ? user.timestamp + user.twitchTokenExpiresIn * SECOND
        : 0;

    return tokenExpiredDate - now.valueOf() > 0;
}
