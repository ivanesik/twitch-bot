import {Config} from 'postcss-load-config';
import autoprefixerPlugin from 'autoprefixer';
import tailwindPlugin from 'tailwindcss';

const config: Config = {
    plugins: [tailwindPlugin(), autoprefixerPlugin()],
};

export default config;
