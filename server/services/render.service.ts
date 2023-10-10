import * as fs from 'node:fs';
import * as path from 'node:path';
import {Request} from 'express';
import {ViteDevServer} from 'vite';
import {generateHydrationScript} from 'solid-js/web';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {Inject, Injectable, LoggerService} from '@nestjs/common';

import {APP_MODULE_OPTIONS} from '@/server/constants/modules';

import {TRenderFunction} from '@/client/server.entry';

import {IAppModuleOptions} from '../app.module';

const isProdution = process.env.NODE_ENV === 'production';

@Injectable()
export class RenderService {
    private readonly vite: ViteDevServer;
    private template: string;

    constructor(
        @Inject(APP_MODULE_OPTIONS)
        readonly options: IAppModuleOptions,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        readonly logger: LoggerService,
    ) {
        this.vite = options.viteServer;
        this.template = fs.readFileSync(
            path.resolve(path.join(process.cwd(), 'index.html')),
            'utf-8',
        );
    }

    async getAppString(request: Request): Promise<string> {
        const render: TRenderFunction = (
            await this.vite.ssrLoadModule('/client/server.entry.tsx')
        ).render;
        const appHtml = await render(request, this.logger);

        const html = this.template
            .replace('<!--ssr-head-->', generateHydrationScript())
            .replace('<!--ssr-outlet-->', appHtml);

        return isProdution
            ? html
            : await this.vite.transformIndexHtml(request.url, html);
    }
}
