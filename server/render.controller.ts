import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {Get, Req, Inject, Controller, LoggerService} from '@nestjs/common';

import {IAppRequest} from './types/IAppRequest';

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
    async getWildcard(@Req() request: IAppRequest): Promise<string> {
        return this.appService.getAppString(request);
    }
}
