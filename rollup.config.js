import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.mts',
    output: [
        {
            dir: 'build/es',
            format: 'es',
        },
        {
            dir: 'build/cjs',
            format: 'cjs',
        },
    ],
    external: ['fs', 'path'],
    plugins: [
        json(),
        commonjs(),
        nodeResolve({
            preferBuiltins: true,
        }),
        typescript({
            sourceMap: false,
        }),
    ],
};
