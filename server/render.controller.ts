import {ViteDevServer} from 'vite';
import {Controller, Get, Req, Request} from '@nestjs/common';

import {RenderService} from './services/render.service';

@Controller()
export class RenderController {
    // TODO: think abount vite.service.ts OR render.controller.ts with params
    vite?: ViteDevServer;

    constructor(private readonly appService: RenderService) {}

    public setViteInstance(vite: ViteDevServer) {
        this.vite = vite;
    }

    @Get('*')
    getWildcard(@Req() request: Request): Promise<string> {
        if (this.vite) {
            return this.appService.getAppString(this.vite, request.url);
        } else {
            throw Error('Set vite instance in AppController');
        }
    }
}
