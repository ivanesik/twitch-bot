import {ITwitchHttpClient} from '@/common/types/api/ITwitchHttpClient';
import {EServiceProviderKey} from '@/common/types/api/EServiceProviderKey';

import {getHttpServiceProvider} from '../getHttpServiceProvider';

import {TwitchBrowserProvider} from './TwitchBrowserProvider';

export const twitchServiceProvider = getHttpServiceProvider<ITwitchHttpClient>(
    TwitchBrowserProvider,
    EServiceProviderKey.TWITCH_HTTP_CLIENT,
);
