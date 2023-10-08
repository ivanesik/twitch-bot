import {Inject, Injectable} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {ViteDevServer} from 'vite';

import {IAppModuleOptions} from '../app.module';

@Injectable()
export class RenderService {
    private readonly vite: ViteDevServer;
    private template: string;

    constructor(@Inject('MODULE_OPTIONS') options: IAppModuleOptions) {
        this.vite = options.viteServer;
        this.template = fs.readFileSync(
            path.resolve(path.join(process.cwd(), 'index.html')),
            'utf-8',
        );
    }

    async getAppString(url: string): Promise<string> {
        return await this.vite.transformIndexHtml(url, this.template);
    }
}
