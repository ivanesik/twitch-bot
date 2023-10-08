import {Controller, Get, Req, Request} from '@nestjs/common';

import {RenderService} from './services/render.service';

@Controller()
export class RenderController {
    constructor(private readonly appService: RenderService) {}

    @Get('*')
    async getWildcard(@Req() request: Request): Promise<string> {
        return this.appService.getAppString(request.url);
    }
}
