import {Logger} from './logger/logger.mjs';

import {TwitchHttpClient} from './api/TwitchHttpClient.mjs';
import {TwitchSocketClient} from './api/TwitchSocketClient.mjs';

Logger.success('Application started\n');

const clientId = process.env.CLIENT_ID;
const clientAccessToken = process.env.CLIENT_ACCESS_TOKEN;

if (!clientId) {
    throw Error('No CLIENT_ID found. Please pass it into $CLIENT_ID');
}

if (!clientAccessToken) {
    throw Error('No CLIENT_ACCESS_TOKEN found. Please pass it into $CLIENT_ACCESS_TOKEN');
}

const twitchClient = new TwitchHttpClient(clientId, clientAccessToken);
const accessTokenValidationData = await twitchClient.validateAccessToken();

if (accessTokenValidationData.isValid) {
    const {user_id} = accessTokenValidationData.result;

    if (!user_id) {
        throw Error("Can't init APP for user with current token");
    }

    const app = new TwitchSocketClient(user_id, clientAccessToken, clientId);

    process.on('SIGINT', function () {
        Logger.info('Stop application');
        app.stop();

        process.exit();
    });

    process.on('uncaughtException', (err, origin) => {
        Logger.error(`Caught exception. Exception origin: ${origin}`, err);
    });
} else {
    Logger.error("Access token isn't valid");
}
