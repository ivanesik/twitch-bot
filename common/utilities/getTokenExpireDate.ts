import {SECOND} from '@/common/constants/time';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';

export function getTokenExpireDate(user: ITwitchUser) {
    return new Date(
        user ? user.timestamp + user.twitchTokenExpiresIn * SECOND : 0,
    );
}
