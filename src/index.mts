import chalk from 'chalk';

import {Logger} from './logger/logger.mjs';

import {TwitchHttpClient} from './api/TwitchHttpClient.mjs';
import {TwitchSocketClient} from './api/TwitchSocketClient.mjs';

Logger.success(chalk.green('Application started\n'));

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientAccessToken = process.env.CLIENT_ACCESS_TOKEN;

if (!clientId) {
    throw Error('No CLIENT_ID found. Please pass it into $CLIENT_ID');
}

if (!clientSecret) {
    throw Error('No CLIENT_SECRET found. Please pass it into $CLIENT_SECRET');
}

if (!clientAccessToken) {
    throw Error('No CLIENT_ACCESS_TOKEN found. Please pass it into $CLIENT_ACCESS_TOKEN');
}

const twitchClient = new TwitchHttpClient(clientId, clientSecret);

const rootAccessToken = await twitchClient.getAccessToken();
const userId = await twitchClient.getUserIdByLogin('viktorysa', rootAccessToken);

const app = new TwitchSocketClient(userId, clientAccessToken, clientId);

process.on('SIGINT', function () {
    Logger.info('Stop application');
    app.stop();

    process.exit();
});
