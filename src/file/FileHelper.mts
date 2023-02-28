import fs from 'fs';
import path from 'path';

import {Logger} from '../logger/logger.mjs';
import {logAction} from '../logger/logMethod.mjs';

export class FileHelper {
    @logAction('Write file', {withArgs: true})
    public write(directoryName: string, fileName: string, value: string) {
        const filePath = path.join(directoryName, fileName);

        if (!fs.existsSync(directoryName)) {
            Logger.info(`Directory "${directoryName}" doesn't exists. Create directory.`);
            fs.mkdirSync(directoryName);
        }

        if (!fs.existsSync(filePath)) {
            Logger.info(`File "${fileName}" doesn't exists. Create file.`);
        }

        fs.writeFileSync(filePath, value);
    }

    @logAction('Read json file')
    public readJsonFile<T>(directoryName: string, fileName: string): T | undefined {
        const filePath = path.join(directoryName, fileName);

        if (!fs.existsSync(filePath)) {
            Logger.info(`File "${fileName}" doesn't exists.`);

            return undefined;
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}
