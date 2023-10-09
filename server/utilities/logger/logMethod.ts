import {LoggerService} from '@nestjs/common';

import {buildErrorFromUnknown} from '@/server/utilities/buildErrorFromUnknown';

interface IOptions {
    onlyStart?: boolean;
    withArgs?: boolean;
}

interface ITargetWithLogger {
    logger: LoggerService;
}

export function logMethod(options?: IOptions) {
    return function (
        target: ITargetWithLogger,
        propertyName: string | symbol,
        descriptor: PropertyDescriptor,
    ): void {
        const prefix = `[${target.constructor.name}${
            typeof propertyName === 'string' ? `.${propertyName}` : ''
        }]`;
        const originalFn = descriptor.value;

        if (typeof originalFn !== 'function') {
            throw new TypeError('logAction can only decorate functions');
        }

        descriptor.value = function (...args: unknown[]): void | Promise<void> {
            const logger: LoggerService = (this as ITargetWithLogger).logger;

            logger?.log(
                `${prefix} Action started${
                    options?.withArgs ? `- (${JSON.stringify(args)})` : ''
                }`,
            );

            try {
                const result = originalFn.call(this, ...args);

                if (!options?.onlyStart) {
                    logger?.warn(`${prefix} Action success`);
                }

                return result;
            } catch (err) {
                logger?.error(
                    `${prefix} Action error`,
                    buildErrorFromUnknown(err),
                );
            }
        };
    };
}
