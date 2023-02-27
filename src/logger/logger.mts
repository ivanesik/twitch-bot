import {createLogger, transports, format} from 'winston';
import {ErrorEvent} from 'ws';

const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.simple(), format.colorize({all: true})),
        }),
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

export class Logger {
    public static info(message: string) {
        logger.info(message);
    }

    public static success(message: string) {
        logger.warn(message);
    }

    public static error(message: string, error?: Error | ErrorEvent) {
        logger.error(message);

        if (error) {
            logger.error(error.message);
        }
    }
}
