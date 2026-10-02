import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/*.repository.ts',
        '**/database/**',
        '**/config/**',
        '**/main.ts',
        '**/app.module.ts',
        '**/*.module.ts',
        '**/*.schema.ts',
        '**/*.errors.ts',
        '**/*.constants.ts',
        '**/*.docs.ts',
        '**/docs/**',
        '**/guards/**',
        '**/strategies/**',
        '**/middlewares/**',
        '**/decorators/**',
        '**/filters/**',
      ],
    },
  },
});
