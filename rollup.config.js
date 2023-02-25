import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.mts',
    output: {
        file: 'bundle.mjs',
        format: 'es',
    },
    external: ['chalk', 'ws', 'fs', 'path'],
    plugins: [
        typescript({
            sourceMap: false,
        }),
    ],
};
