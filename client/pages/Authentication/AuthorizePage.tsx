import {type Component, createEffect} from 'solid-js';
import {isServer} from 'solid-js/web';

import {appName} from '@/client/constants/common';
import {ETwitchPermission} from '@/common/constants/twitch';

import {twitchServiceProvider} from '@/client/api/http/twitch/twitchServiceProvider';

import {useService} from '@/client/hooks/useService';

interface IHashSearchParams {
    access_token?: 'string';
    scope?: ETwitchPermission[];
    token_type?: 'bearer';
}

/**
 * Page is nessesary because access_token returns in Hash.
 * And browser remove hash from http request (security reasons)
 *
 * http://localhost:3000/authorize#access_token=1zoghhm4qftf3n9u5iw14fi2tkun8h&scope=channel%3Aread%3Aredemptions&token_type=bearer
 */
export const AuthenticationPage: Component = () => {
    const twitchService = useService(twitchServiceProvider);

    createEffect(async () => {
        if (isServer) {
            return;
        }

        const paramsFromHash: IHashSearchParams = Object.fromEntries(
            new URLSearchParams(window.location.hash.substring(1)),
        );
        const {access_token: accessToken} = paramsFromHash;

        if (accessToken) {
            const userInfo =
                await twitchService.validateAccessToken(accessToken);

            console.log(userInfo);
        } else {
            throw new Error('No access_token in url');
        }
    });

    return (
        <main class="flex flex-col items-center p-24 text-sm">
            <div class="w-full items-center font-mono flex">
                <h1 class="p-4 border-neutral-800 rounded-xl border bg-zinc-800/30">
                    {appName}
                </h1>
            </div>
            <div>Status: Loading...</div>
        </main>
    );
};
