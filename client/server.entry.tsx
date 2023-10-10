import type {Request} from 'express';
import {LoggerService} from '@nestjs/common';
import {renderToStringAsync} from 'solid-js/web';

import {App} from './App';

export async function render(request: Request, logger: LoggerService) {
    logger.log(`[serverEntry.render] Start: ${request.url}`);

    const appString = await renderToStringAsync(() => <App />);

    logger.log(`[serverEntry.render] Complete: ${request.url}`);

    return appString;
}

export type TRenderFunction = typeof render;
