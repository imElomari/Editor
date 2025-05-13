# Label Editor

A secure web application built with React, TypeScript, and Supabase authentication.

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- Supabase account and project

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

## Code Quality Tools

### ESLint

We use ESLint for JavaScript/TypeScript linting.

1. Install ESLint:

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. Run linter:

```bash
npm run lint
```

### Prettier

We use Prettier for code formatting.

1. Install Prettier:

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

### Husk

We use Husky for Git hooks to ensure code quality before commits.

1. Install and setup Husky:

```bash
npm install husky --save-dev
npx husky install
```
