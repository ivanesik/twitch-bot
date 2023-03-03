import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.mts',
    output: {
        file: 'bundle.mjs',
        format: 'es',
    },
    external: [
        'fs',
        'path',
        // ws can't be bundled with Rollup and ESM (RollupError: "default" is not exported)
        // Need to research
        'ws',
    ],
    plugins: [
        typescript({
            sourceMap: false,
        }),
        nodeResolve({modulesOnly: true}),
    ],
};

