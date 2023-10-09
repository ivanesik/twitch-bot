import {
    Get,
    Req,
    Inject,
    Request,
    Controller,
    LoggerService,
} from '@nestjs/common';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';

import {logMethod} from './utilities/logger/logMethod';

import {RenderService} from './services/render.service';

@Controller()
export class RenderController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        readonly logger: LoggerService,
        private readonly appService: RenderService,
    ) {}

    @Get('*')
    @logMethod()
    async getWildcard(@Req() request: Request): Promise<string> {
        return this.appService.getAppString(request.url);
    }
}
