import {NestFactory} from '@nestjs/core';
import {createServer as createViteServer} from 'vite';

import {RenderController} from './render.controller';
import {AppModule} from './app.module';

const PORT = 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const vite = await createViteServer({
        server: {middlewareMode: true},
        appType: 'custom',
    });

    app.use(vite.middlewares);

    const appController = app.get(RenderController);
    appController.setViteInstance(vite);

    await app.listen(PORT);
}
bootstrap();
