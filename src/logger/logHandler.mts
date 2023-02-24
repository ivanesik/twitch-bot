import {Logger} from './logger.mjs';

export function logHandler(eventName: string) {
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
            Logger.info(`Handle: ${eventName}`);

            return originalFn.call(this, ...args);
        };
    };
}
