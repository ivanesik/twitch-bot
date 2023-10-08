import {DynamicModule, Module} from '@nestjs/common';
import {ViteDevServer} from 'vite';

import {RenderController} from './render.controller';
import {RenderService} from './services/render.service';

export interface IAppModuleOptions {
    viteServer: ViteDevServer;
}

@Module({
    imports: [],
    controllers: [RenderController],
    providers: [],
})
export class AppModule {
    static register(options: IAppModuleOptions): DynamicModule {
        return {
            module: AppModule,
            providers: [
                {
                    provide: 'MODULE_OPTIONS',
                    useValue: options,
                },
                RenderService,
            ],
            controllers: [RenderController],
            exports: [RenderService],
        };
    }
}
