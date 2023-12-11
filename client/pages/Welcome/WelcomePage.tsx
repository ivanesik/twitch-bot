import {type Component, createMemo, useContext} from 'solid-js';

import {appName} from '@/client/constants/common';
import {pageUrls} from '@/client/constants/pageUrls';
import {ETwitchPermission} from '@/common/constants/twitch';

import {OriginContext} from '@/client/context/OriginContext';
import {useClientId} from '@/client/context/CommonInfoContext';

enum EAuthResponseType {
    TOKEN = 'token',
    CODE = 'code',
}

export const WelcomePage: Component = () => {
    const clientId = useClientId();
    const origin = useContext(OriginContext);

    if (!clientId) {
        return 'ERROR: no cliendId on welcomePage';
    }

    const generateTokenUrl = createMemo(() => {
        const url = new URL('https://id.twitch.tv/oauth2/authorize');
        const urlParams = new URLSearchParams({
            client_id: clientId.toString(),
            response_type: EAuthResponseType.TOKEN,
            redirect_uri: `${origin}${pageUrls.authorizePath}`,
            scope: ETwitchPermission.CHANNEL_READ_REDEMPTIONS,
        });

        url.search = urlParams.toString();

        return url.toString();
    });

    return (
        <main class="flex flex-col items-center p-24 text-sm">
            <div class="w-full items-center font-mono flex">
                <h1 class="p-4 border-neutral-800 rounded-xl border bg-zinc-800/30">
                    {appName}
                </h1>
            </div>
            <div class="mt-20 w-full flex items-center">
                <img
                    class="mr-8"
                    src="./assets/welcome.svg"
                    alt=""
                    width="505"
                    height="363"
                />

                <div class="flex-1 max-w-[500px]">
                    <a
                        href={generateTokenUrl()}
                        class={`rounded-2xl py-3 px-6 mt-4 ${
                            Boolean(clientId)
                                ? 'bg-blue-600'
                                : 'bg-gray-500 opacity-50 pointer-events-none'
                        }`}
                        type="submit"
                    >
                        Get token
                    </a>
                </div>
            </div>
        </main>
    );
};
