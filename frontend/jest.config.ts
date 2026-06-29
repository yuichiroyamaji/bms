import type { Config } from 'jest';
import nextJest from 'next/jest.js';

// next/jest wires up SWC transform, tsconfig paths, and Next.js env automatically.
const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // jsdom for component/hook tests; node-only tests can override with a per-file docblock.
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],
};

export default createJestConfig(config);
