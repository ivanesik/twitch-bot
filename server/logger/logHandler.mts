import {buildErrorFromUnknown} from 'utilities/buildErrorFromUnknown.mjs';

import {Logger} from './logger.mjs';

export function logHandler(eventName: string) {
    return function (_: unknown, __: string | symbol, descriptor: PropertyDescriptor): void {
        const originalFn = descriptor.value;

        if (typeof originalFn !== 'function') {
            throw new TypeError('logHandle can only decorate functions');
        }

        descriptor.value = function (...args: unknown[]): void | Promise<void> {
            try {
                Logger.info(`Handler: ${eventName}`);

                return originalFn.call(this, ...args);
            } catch (err) {
                Logger.error(`Handler error: ${eventName}`, buildErrorFromUnknown(err));
            }
        };
    };
}
