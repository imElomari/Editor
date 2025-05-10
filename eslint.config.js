import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// Base configuration
const baseConfig = {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
        allowExportNames: [
          'buttonVariants',
          'badgeVariants',
          'variants',
          'useSupabaseUpload',
          'ThemeProvider',
          'AuthProvider'
        ]
      }
    ],
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        enableDangerousAutofixThisMayCauseInfiniteLoops: true,
        additionalHooks: '(useAsync|useAsyncCallback)'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  }
}

export default tseslint.config(
  // Ignore patterns
  { ignores: [
    'dist/**',
    'node_modules/**',
    '.next/**',
    'build/**',
    'coverage/**',
    'public/**',
    '*.config.js'
  ] },
  
  // Base config for all TypeScript/TSX files
  {
    ...baseConfig,
    files: ['**/*.{ts,tsx}'],
  },
  
  // Config for hooks
  {
    files: ['**/hooks/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off'
    }
  },
  
  // Config for components
  {
    files: ['**/components/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': [
        'error',
        {
          enableDangerousAutofixThisMayCauseInfiniteLoops: true
        }
      ]
    }
  },

  // Config for pages
  {
    files: ['**/pages/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': [
        'error',
        {
          enableDangerousAutofixThisMayCauseInfiniteLoops: true,
          additionalHooks: '(useAsync|useAsyncCallback)'
        }
      ],
      'react-hooks/rules-of-hooks': 'error'
    }
  },

  // Config for utilities
  {
    files: ['**/utils/**/*.{ts,tsx}', '**/lib/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'off'
    }
  }
)