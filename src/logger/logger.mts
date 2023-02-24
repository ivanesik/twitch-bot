import chalk from 'chalk';
import {ErrorEvent} from 'ws';

export class Logger {
    public static info(message: string) {
        console.log(chalk.blue(message));
    }

    public static success(message: string) {
        console.log(chalk.green(message));
    }

    public static error(message: string, error?: Error | ErrorEvent) {
        console.log(chalk.red(message));

        if (error) {
            console.log(chalk.red(error.message));
        }
    }
}
