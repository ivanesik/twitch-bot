import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.simple(), format.colorize({ all: true })),
        }),
        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '20d',
        }),
    ],
});
class Logger {
    static info(message) {
        logger.info(message);
    }
    static success(message) {
        logger.warn(message);
    }
    static error(message, error) {
        logger.error(message);
        if (error) {
            logger.error(error.message);
        }
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function buildErrorFromUnknown(error) {
    return error instanceof Error ? error : new Error(String(error));
}

function logAction(eventName, options) {
    return function (_, __, descriptor) {
        const originalFn = descriptor.value;
        if (typeof originalFn !== 'function') {
            throw new TypeError('logAction can only decorate functions');
        }
        descriptor.value = function (...args) {
            if (options?.withArgs) {
                Logger.info(`Action start: ${eventName} (${JSON.stringify(args)})`);
            }
            else {
                Logger.info(`Action start: ${eventName}`);
            }
            try {
                const result = originalFn.call(this, ...args);
                if (!options?.onlyStart) {
                    Logger.success(`Action success: ${eventName}`);
                }
                return result;
            }
            catch (err) {
                Logger.error(`Action error: ${eventName}`, buildErrorFromUnknown(err));
            }
        };
    };
}

class TwitchHttpClient {
    clientId;
    constructor(clientId) {
        this.clientId = clientId;
    }
    async validateAccessToken(accessToken) {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: { Authorization: `OAuth ${accessToken}` },
        });
        if (response.status === 200) {
            return true;
        }
        else {
            return false;
        }
    }
    async getUserIdByLogin(login, accessToken) {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${login}`, {
            method: 'GET',
            headers: {
                'Client-ID': this.clientId,
                Authorization: 'Bearer ' + accessToken,
            },
        });
        const result = (await response.json());
        return result.data?.[0]?.id;
    }
}
__decorate([
    logAction('Validate access token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TwitchHttpClient.prototype, "validateAccessToken", null);
__decorate([
    logAction('Getting user id by login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TwitchHttpClient.prototype, "getUserIdByLogin", null);

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const PUB_SUB_EVENTS = {
    /** A custom reward is redeemed in a channel.  */
    channelPoints: (userId) => `channel-points-channel-v1.${userId}`,
};

class FileWriter {
    write(directoryName, fileName, value) {
        const filePath = path.join(directoryName, fileName);
        if (!fs.existsSync(directoryName)) {
            Logger.info(`Directory "${directoryName}" doesn't exists. Create directory.`);
            fs.mkdirSync(directoryName);
        }
        if (!fs.existsSync(filePath)) {
            Logger.info(`File "${fileName}" doesn't exists. Create file.`);
        }
        fs.writeFileSync(filePath, value);
    }
}
__decorate([
    logAction('Write file', { withArgs: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FileWriter.prototype, "write", null);

/** https://dev.twitch.tv/docs/pubsub/#available-topics */
const APP_REQUIRED_SCOPES = ['channel:read:redemptions'];

function builtTwitchAccessUrl(clientId) {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', 'http://localhost');
    url.searchParams.set('scope', APP_REQUIRED_SCOPES.join(' '));
    return url.toString();
}

function logHandler(eventName) {
    return function (_, __, descriptor) {
        const originalFn = descriptor.value;
        if (typeof originalFn !== 'function') {
            throw new TypeError('logAction can only decorate functions');
        }
        descriptor.value = function (...args) {
            Logger.info(`Handle: ${eventName}`);
            return originalFn.call(this, ...args);
        };
    };
}

const TWITCH_PUBSUB_URL = 'wss://pubsub-edge.twitch.tv';
const PING_MESSAGE = JSON.stringify({
    type: 'PING',
});
class TwitchSocketClient {
    userId;
    accessToken;
    clientId;
    websocket;
    heartbeatHandle;
    constructor(userId, accessToken, clientId) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.clientId = clientId;
        this.websocket = this.start();
    }
    start() {
        const websocket = new WebSocket(TWITCH_PUBSUB_URL);
        websocket.onopen = this.onOpen.bind(this);
        websocket.onclose = this.onClose.bind(this);
        websocket.onerror = this.onError.bind(this);
        websocket.onmessage = this.onMessage.bind(this);
        return websocket;
    }
    stop() {
        this.websocket.close();
    }
    subscribe(subscriptionName) {
        const subscriptionData = JSON.stringify({
            type: 'LISTEN',
            data: {
                topics: [subscriptionName],
                auth_token: this.accessToken,
            },
        });
        this.websocket.send(subscriptionData);
    }
    sendPing() {
        Logger.info('Send PING message');
        this.websocket.send(PING_MESSAGE);
    }
    onOpen() {
        this.sendPing();
        this.heartbeatHandle = setInterval(() => {
            this.sendPing();
        }, 4 * MINUTE);
        this.subscribe(PUB_SUB_EVENTS.channelPoints(this.userId));
    }
    onError(error) {
        Logger.error('Socket Error', error);
        clearInterval(this.heartbeatHandle);
    }
    onClose(event) {
        Logger.error('Socket closed by reason: ' + event.reason);
        clearInterval(this.heartbeatHandle);
    }
    onMessage(event) {
        const data = typeof event.data === 'string'
            ? JSON.parse(event.data)
            : undefined;
        if (!data) {
            Logger.error('No data in message');
            return;
        }
        Logger.info(`Handle: Received message type - "${data.type}"`);
        if (data.error) {
            switch (data.error) {
                case 'ERR_BADAUTH': {
                    const errorMessage = `The user (${this.userId}) has not granted access.\n` +
                        `Please ask user to give token to you from: ${builtTwitchAccessUrl(this.clientId)}`;
                    Logger.error(errorMessage);
                    break;
                }
                default: {
                    Logger.error(`Unknown error: ${data.error}`);
                }
            }
            return;
        }
        if (data.type === 'RECONNECT') {
            this.stop();
            this.start();
        }
        const rewardData = data.data?.message && JSON.parse(data.data.message);
        if (rewardData) {
            switch (rewardData.type) {
                case 'reward-redeemed': {
                    const fileWriter = new FileWriter();
                    Logger.info(`Handle: receive reward "${rewardData.data.redemption.reward.title}" from ${rewardData.data.redemption.user.display_name}`);
                    fileWriter.write('rewardUsers', `${rewardData.data.redemption.reward.id}.txt`, rewardData.data.redemption.user.display_name);
                }
            }
        }
    }
}
__decorate([
    logAction('Start websocket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", WebSocket)
], TwitchSocketClient.prototype, "start", null);
__decorate([
    logAction('Stop websocket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "stop", null);
__decorate([
    logAction('Subscribe', { onlyStart: true, withArgs: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "subscribe", null);
__decorate([
    logAction('Send "PING"'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "sendPing", null);
__decorate([
    logHandler('Socket open'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "onOpen", null);
__decorate([
    logHandler('Socket error'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "onError", null);
__decorate([
    logHandler('Socket disconnect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "onClose", null);
__decorate([
    logHandler('Socket receive message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TwitchSocketClient.prototype, "onMessage", null);

Logger.success('Application started\n');
const clientId = process.env.CLIENT_ID;
const clientAccessToken = process.env.CLIENT_ACCESS_TOKEN;
if (!clientId) {
    throw Error('No CLIENT_ID found. Please pass it into $CLIENT_ID');
}
if (!clientAccessToken) {
    throw Error('No CLIENT_ACCESS_TOKEN found. Please pass it into $CLIENT_ACCESS_TOKEN');
}
const twitchClient = new TwitchHttpClient(clientId);
const userId = await twitchClient.getUserIdByLogin('viktorysa', clientAccessToken);
const isAccessTokenValid = await twitchClient.validateAccessToken(clientAccessToken);
if (isAccessTokenValid) {
    const app = new TwitchSocketClient(userId, clientAccessToken, clientId);
    process.on('SIGINT', function () {
        Logger.info('Stop application');
        app.stop();
        process.exit();
    });
}
else {
    Logger.error("Access token isn't valid");
}
