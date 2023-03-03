import {Logger} from './logger/logger.mjs';

import {TwitchHttpClient} from './api/TwitchHttpClient.mjs';
import {TwitchSocketClient} from './api/TwitchSocketClient.mjs';

Logger.success('Application started\n');

// TODO: change to "userId" and move it into env variables
const userName = 'viktorysa';
const clientId = process.env.CLIENT_ID;
const clientAccessToken = process.env.CLIENT_ACCESS_TOKEN;

if (!clientId) {
    throw Error('No CLIENT_ID found. Please pass it into $CLIENT_ID');
}

if (!clientAccessToken) {
    throw Error('No CLIENT_ACCESS_TOKEN found. Please pass it into $CLIENT_ACCESS_TOKEN');
}

const twitchClient = new TwitchHttpClient(clientId, clientAccessToken);

const user = await twitchClient.getUserByLogin(userName);
const isAccessTokenValid = await twitchClient.validateAccessToken();

if (!user?.id) {
    throw Error(`Can't init APP for user: ${userName}`);
}

if (isAccessTokenValid) {
    const app = new TwitchSocketClient(user?.id, clientAccessToken, clientId);

    process.on('SIGINT', function () {
        Logger.info('Stop application');
        app.stop();

        process.exit();
    });
} else {
    Logger.error("Access token isn't valid");
}
