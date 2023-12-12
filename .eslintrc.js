module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'eslint-plugin-import-helpers',
    ],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'interface',
                format: ['PascalCase'],
                prefix: ['I'],
            },
            {
                selector: 'typeAlias',
                format: ['PascalCase'],
                prefix: ['T'],
            },
            {
                selector: 'enum',
                format: ['PascalCase'],
                prefix: ['E'],
            },
            {
                selector: 'enumMember',
                format: ['UPPER_CASE'],
            },
        ],
        'import-helpers/order-imports': [
            'error',
            {
                newlinesBetween: 'always',
                groups: [
                    'module',
                    '/.*constants//',
                    '/.*types//',
                    '/.*api//',
                    '/(.*utilities)|(.*hooks)//',
                    '/.*pages//',
                    '/(.*components/)|(.*context/)/',
                    '/@//',
                    'parent',
                    'sibling',
                    'index',
                ],
            },
        ],
    },
};
