import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import * as importResolverTypescript from 'eslint-import-resolver-typescript';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactRecommendedRules = {
  ...reactPlugin.configs.recommended.rules,
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/jsx-uses-react': 'off',
};

const reactHooksRecommendedRules = reactHooksPlugin.configs.recommended.rules;

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'dist/types/',
      '*.config.js',
      '*.config.mjs',
      '*.d.ts',
      '.vscode/',
      '.idea/',
      '.DS_Store',
      'coverage/',
      'test/',
    ],
  },

  { ...eslint.configs.recommended, plugins: {} },
  {
    ...tseslint.configs.recommended[0],
    plugins: {},
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        browser: true,
        React: true,
        NodeJS: true,
        navigator: true,
        setTimeout: true,
        clearTimeout: true,
        AbortController: true,
        AbortSignal: true,
        GeolocationPosition: true,
        GeolocationPositionError: true,
        PositionOptions: true,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },

    rules: {
      ...eslint.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-extra-semi': 'error',
      'no-unused-vars': 'off',
      'no-redeclare': 'error',

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // React 规则
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      'react-hooks/exhaustive-deps': 'warn',

      // Prettier 规则
      'prettier/prettier': 'error',

      // 🔥 核心修改：彻底禁用 import/extensions 规则，消除误报
      'import/extensions': 'off',
      // 保留 import/no-unresolved 并兼容 .js 导入对应 .ts 源码
      'import/no-unresolved': [
        'error',
        {
          ignore: ['.*\\.js$', '.*\\.jsx$'], // 允许 .js 导入对应 .ts/.tsx 源码
        },
      ],
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        },
      ],
    },

    // 保留解析配置，确保 TS 与 ESLint 路径识别兼容
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          tsconfigRootDir: __dirname,
          extensions: ['.ts', '.tsx'],
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.json'],
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
];
