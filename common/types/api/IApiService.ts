import {ITwitchUser} from '@/common/types/dto/ITwitchUser';

export interface IApiService {
    saveToken: (accessToken: string) => Promise<ITwitchUser | void>;
}
