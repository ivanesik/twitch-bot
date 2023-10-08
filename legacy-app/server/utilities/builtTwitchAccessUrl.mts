import {APP_REQUIRED_SCOPES} from 'constants/twitchApp.mjs';

export function builtTwitchAccessUrl(clientId: string): string {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    url.searchParams.set('response_type', 'token');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', 'http://localhost');
    url.searchParams.set('scope', APP_REQUIRED_SCOPES.join(' '));

    return url.toString();
}
