import nextVitals from 'eslint-config-next/core-web-vitals';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextVitals,
  {
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // react-hooks v7 (via eslint-config-next 16.2) — existing patterns; not CVE-related
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'public/css/**'],
  },
];

export default config;
