import {ITwitchUser} from '@/common/types/dto/ITwitchUser';

export interface ITwitchHttpClient {
    validateAccessToken: (accessToken: string) => Promise<ITwitchUser | void>;
}
