import {ViteDevServer} from 'vite';
import {DynamicModule, Module} from '@nestjs/common';
import {WinstonModule} from 'nest-winston';
import {transports, format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import {APP_MODULE_OPTIONS} from './constants/modules';

import {RenderController} from './render.controller';
import {RenderService} from './services/render.service';

export interface IAppModuleOptions {
    viteServer: ViteDevServer;
}

@Module({})
export class AppModule {
    static register(options: IAppModuleOptions): DynamicModule {
        return {
            module: AppModule,
            imports: [
                WinstonModule.forRoot({
                    transports: [
                        new transports.Console({
                            format: format.combine(
                                format.simple(),
                                format.colorize({all: true}),
                            ),
                        }),
                        new DailyRotateFile({
                            filename: 'logs/app-%DATE%.log',
                            datePattern: 'YYYY-MM-DD-HH',
                            zippedArchive: true,
                            maxSize: '20m',
                            maxFiles: '20d',
                        }),
                    ],
                }),
            ],
            providers: [
                {
                    provide: APP_MODULE_OPTIONS,
                    useValue: options,
                },
                RenderService,
            ],
            controllers: [RenderController],
            exports: [RenderService],
        };
    }
}
