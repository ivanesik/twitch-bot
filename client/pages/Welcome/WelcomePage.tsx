import {type Component, createMemo, useContext} from 'solid-js';

import {appName} from '@/client/constants/common';
import {pageUrls} from '@/client/constants/pageUrls';
import {ETwitchPermission} from '@/common/constants/twitch';

import {OriginContext} from '@/client/context/OriginContext';
import {useClientId} from '@/client/context/CommonInfoContext';
import {SupabaseContext} from '@/client/context/SupabaseContent';

enum EAuthResponseType {
    TOKEN = 'token',
    CODE = 'code',
}

const REQUIRED_SCOPES = [
    ETwitchPermission.CHANNEL_READ_REDEMPTIONS,
    ETwitchPermission.USER_READ_EMAIL,
];

export const WelcomePage: Component = () => {
    const clientId = useClientId();
    const origin = useContext(OriginContext);
    const scopeParam = REQUIRED_SCOPES.join(' ');
    const supabaseClient = useContext(SupabaseContext);

    // TODO: return error page
    if (!clientId) {
        return 'ERROR: no cliendId on welcomePage';
    }

    // TODO: return error page
    if (!supabaseClient) {
        return 'ERROR: no supabase on welcomePage';
    }

    const generateTokenUrl = createMemo(() => {
        const url = new URL('https://id.twitch.tv/oauth2/authorize');
        const urlParams = new URLSearchParams({
            client_id: clientId.toString(),
            response_type: EAuthResponseType.TOKEN,
            redirect_uri: `${origin}${pageUrls.authorizePath}`,
            scope: scopeParam,
        });

        url.search = urlParams.toString();

        return url.toString();
    });

    const getSession = async () => {
        const {data, error} = await supabaseClient.auth.getSession();
        const currentUser = data.session?.user;

        console.log(currentUser);

        if (error) {
            console.log('ERROR: ');
            console.error(error);
        }
    };

    const login = async () => {
        const {data, error} = await supabaseClient.auth.signInWithOAuth({
            provider: 'twitch',
            options: {
                queryParams: {
                    response_type: EAuthResponseType.CODE,
                },
                scopes: scopeParam,
            },
        });

        console.log(data);

        if (error) {
            console.log('error');
            console.log(error);
        }
    };

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
                    <button
                        class={`rounded-2xl py-3 px-6 mt-4 ${
                            Boolean(clientId)
                                ? 'bg-blue-600'
                                : 'bg-gray-500 opacity-50 pointer-events-none'
                        }`}
                        type="button"
                        onClick={login}
                    >
                        Supabase get token
                    </button>

                    <a
                        href={generateTokenUrl()}
                        class={`rounded-2xl py-3 px-6 mt-4 ${
                            Boolean(clientId)
                                ? 'bg-blue-600'
                                : 'bg-gray-500 opacity-50 pointer-events-none'
                        }`}
                        type="submit"
                    >
                        Old get token
                    </a>

                    <button
                        class={`rounded-2xl py-3 px-6 mt-4 ${
                            Boolean(clientId)
                                ? 'bg-blue-600'
                                : 'bg-gray-500 opacity-50 pointer-events-none'
                        }`}
                        type="button"
                        onClick={getSession}
                    >
                        Get session
                    </button>
                </div>
            </div>
        </main>
    );
};
