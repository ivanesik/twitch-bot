import {NestFactory} from '@nestjs/core';
import cookieParser from 'cookie-parser';
import {createServer as createViteServer} from 'vite';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';

import {AppModule} from './app.module';

const PORT = 3000;

async function bootstrap() {
    const vite = await createViteServer({
        server: {middlewareMode: true},
        appType: 'custom',
    });
    const app = await NestFactory.create(
        AppModule.register({viteServer: vite}),
    );

    app.use(cookieParser());
    app.use(vite.middlewares);
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    await app.listen(PORT);
}
bootstrap();
