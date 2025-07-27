import type { Config } from 'jest';
import path from 'path';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Emotion JSX runtime mappings (use these exact paths)
    '@emotion/react/jsx-dev-runtime': path.join(__dirname, 'node_modules/@emotion/react/jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.js'),
    '@emotion/react/jsx-runtime': path.join(__dirname, 'node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.cjs.js')
  },

  // Simplified transform without the non-existent transformer
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest', 
      {
        tsconfig: 'tsconfig.jest.json',
        babelConfig: 'babel.jest.config.js'
      }
    ]
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ]
};

export default config;