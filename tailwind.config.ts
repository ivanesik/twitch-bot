import type {Config} from 'tailwindcss';

export default {
    content: ['index.html', './client/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
