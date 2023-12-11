import type {KnipConfig} from 'knip/dist/index';

const entries = [
    './server/main.ts',
    './client/server.entry.tsx',
    './client/client.entry.tsx',
];
const configs = ['postcss.config.ts'];

const TODO = [
    './server/services/file.service.ts',
    './server/services/users.service.ts',
];

const config: KnipConfig = {
    entry: [...entries, ...configs, ...TODO],
    ignore: ['./legacy-app/**'],
    ignoreDependencies: ['ts-node', '@nestjs/schematics'],
    ignoreExportsUsedInFile: {interface: true},
    rules: {
        classMembers: 'warn',
    },
};

export default config;
