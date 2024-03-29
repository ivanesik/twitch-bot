import * as fs from 'node:fs';
import * as path from 'node:path';
import {ViteDevServer} from 'vite';
import {ModuleRef} from '@nestjs/core';
import {createStore} from 'solid-js/store';
import {ConfigService} from '@nestjs/config';
import {generateHydrationScript} from 'solid-js/web';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {Inject, Injectable, LoggerService} from '@nestjs/common';

import {APP_MODULE_OPTIONS} from '@/server/constants/modules';

import {IAppRequest} from '@/server/types/IAppRequest';
import {ICommonStore} from '@/common/types/store/ICommonStore';

import {TRenderFunction} from '@/client/server.entry';

import {IAppModuleOptions} from '../app.module';

const isProdution = process.env.NODE_ENV === 'production';

@Injectable()
export class RenderService {
    private readonly vite: ViteDevServer;
    private template: string;

    constructor(
        @Inject(APP_MODULE_OPTIONS) options: IAppModuleOptions,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly moduleRef: ModuleRef,
        private readonly configService: ConfigService,
    ) {
        this.vite = options.viteServer;
        this.template = fs.readFileSync(
            path.resolve(path.join(process.cwd(), 'index.html')),
            'utf-8',
        );
    }

    async getAppString(request: IAppRequest): Promise<string> {
        const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
        const render: TRenderFunction = (
            await this.vite.ssrLoadModule('/client/server.entry.tsx')
        ).render;

        if (!clientId) {
            throw new Error('No client id in render service');
        }

        const [store] = createStore<ICommonStore>({
            clientId,
        });
        const appHtml = await render({
            request,
            logger: this.logger,
            moduleRef: this.moduleRef,
            store: store,
            supabaseClient: request.supabase.client,
        });
        const serverState: typeof window._SERVER_STATE_ = {
            commonStore: store,
            supabase: {
                url: request.supabase.options.url,
                apiKey: request.supabase.options.apiKey,
            },
        };

        const html = this.template
            .replace(
                '<!--ssr-head-->',
                `<script>
                    self._SERVER_STATE_ = ${JSON.stringify(serverState)}
                </script>
                ${generateHydrationScript()}`,
            )
            .replace('<!--ssr-outlet-->', appHtml);

        return isProdution
            ? html
            : await this.vite.transformIndexHtml(request.url, html);
    }
}
