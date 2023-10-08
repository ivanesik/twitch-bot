import path from 'node:path';
import {defineConfig} from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default async () => {
    const {default: devtools} = await import('solid-devtools/vite');

    return defineConfig({
        build: {
            outDir: 'dist/server',
        },
        plugins: [
            // TODO: remove this plugin in production build
            devtools({
                /* features options - all disabled by default */
                autoname: true, // e.g. enable autoname
            }),
            solidPlugin({ssr: true, solid: {hydratable: true}}),
        ],
        optimizeDeps: {
            // Vite does not work well with optional dependencies,
            exclude: ['fsevents'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './'),
            },
        },
        base: '/dist/client',
    });
};
