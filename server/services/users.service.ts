import * as path from 'node:path';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {Inject, Injectable, LoggerService} from '@nestjs/common';

import {ITwitchUser} from '@/common/types/dto/ITwitchUser';

import {logMethod} from '../utilities/logger/logMethod';
import {isUserTokenActive} from '../utilities/isUserTokenActive';

import {FileService} from './file.service';

const pathToUsers = path.join(process.cwd(), 'storage', 'users.json');

@Injectable()
export class UsersService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) readonly logger: LoggerService,
        private readonly fileService: FileService,
    ) {}

    @logMethod()
    saveUserToken(user: ITwitchUser): ITwitchUser {
        const users = this.getUsers();

        const updatedUserIndex = users.findIndex(
            storageUser => storageUser.twitchUserId === user.twitchUserId,
        );

        if (updatedUserIndex >= 0) {
            users[updatedUserIndex] = user;
        } else {
            users.push(user);
        }

        this.fileService.writeJsonFile(pathToUsers, users);

        return user;
    }

    @logMethod()
    getUsers(): ITwitchUser[] {
        return this.fileService.readJsonFile<ITwitchUser[]>(pathToUsers) || [];
    }

    @logMethod({withArgs: true})
    getUser(twitchUserId: string): ITwitchUser | undefined {
        return this.getUsers().find(user => user.twitchUserId === twitchUserId);
    }

    @logMethod()
    getUsersWithActiveToken() {
        return this.getUsers().filter(isUserTokenActive);
    }
}
