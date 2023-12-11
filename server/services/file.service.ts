import * as fs from 'node:fs';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {Inject, Injectable, LoggerService} from '@nestjs/common';

import {logMethod} from '../utilities/logger/logMethod';

@Injectable()
export class FileService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) readonly logger: LoggerService,
    ) {}

    @logMethod({withArgs: true})
    readJsonFile<T extends object>(filePath: string): T | undefined {
        if (!fs.existsSync(filePath)) {
            this.logger.log(`File "${filePath}" doesn't exists.`);

            return undefined;
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    @logMethod()
    writeJsonFile(filePath: string, value: object): void {
        if (!fs.existsSync(filePath)) {
            this.logger.log(`File "${filePath}" doesn't exists. Create file.`);
        }

        fs.writeFileSync(filePath, JSON.stringify(value, null, 4));
    }
}
