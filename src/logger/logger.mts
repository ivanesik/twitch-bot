import {createLogger, transports, format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import type {ErrorEvent} from 'ws';

const logger = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.simple(), format.colorize({all: true})),
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
