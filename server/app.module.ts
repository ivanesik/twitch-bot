import {ViteDevServer} from 'vite';
import {
    DynamicModule,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {WinstonModule} from 'nest-winston';
import {transports, format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {HttpModule} from '@nestjs/axios';

import {APP_MODULE_OPTIONS} from './constants/modules';

import {EServiceProviderKey} from '@/common/types/api/EServiceProviderKey';

import {RenderController} from './render.controller';
import {HttpApiController} from './httpApi.controller';
import {RenderService} from './services/render.service';
import {TwitchHttpClient} from './services/twitchHttpClient.service';
import {SupabaseMiddleware} from './middleware/supabase.middleware';

export interface IAppModuleOptions {
    viteServer: ViteDevServer;
}

@Module({})
export class AppModule implements NestModule {
    static register(options: IAppModuleOptions): DynamicModule {
        return {
            module: AppModule,
            imports: [
                HttpModule,
                ConfigModule.forRoot(),
                WinstonModule.forRoot({
                    transports: [
                        new transports.Console({
                            format: format.combine(
                                format.simple(),
                                format.colorize({
                                    all: true,
                                    colors: {
                                        info: 'white',
                                        success: 'green',
                                    },
                                }),
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
                {
                    provide: EServiceProviderKey.TWITCH_HTTP_CLIENT,
                    useClass: TwitchHttpClient,
                },
            ],
            controllers: [HttpApiController, RenderController],
        };
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SupabaseMiddleware).forRoutes('*');
    }
}
