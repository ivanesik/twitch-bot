import {Logger} from './logger.mjs';
import {buildErrorFromUnknown} from '../utilities/buildErrorFromUnknown.mjs';

export function logAction(eventName: string, options?: {onlyStart?: boolean; withArgs?: boolean}) {
    return function (
        target: unknown,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ): void {
        const originalFn = descriptor.value;

        if (typeof originalFn !== 'function') {
            throw new TypeError('logAction can only decorate functions');
        }

        descriptor.value = function (...args: unknown[]): void | Promise<void> {
            if (options?.withArgs) {
                Logger.info(`Action start: ${eventName} (${JSON.stringify(args)})`);
            } else {
                Logger.info(`Action start: ${eventName}`);
            }

            try {
                const result = originalFn.call(this, ...args);

                if (!options?.onlyStart) {
                    Logger.success(`Action success: ${eventName}`);
                }

                return result;
            } catch (err) {
                Logger.error(`Action error: ${eventName}`, buildErrorFromUnknown(err));
            }
        };
    };
}
