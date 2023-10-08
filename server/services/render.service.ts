import {Injectable} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {ViteDevServer} from 'vite';

@Injectable()
export class RenderService {
    async getAppString(vite: ViteDevServer, url: string): Promise<string> {
        const template = fs.readFileSync(
            path.resolve(path.join(process.cwd(), 'index.html')),
            'utf-8',
        );

        return await vite.transformIndexHtml(url, template);
    }
}
