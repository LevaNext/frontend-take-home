import type { Config } from "jest";
import nextJest from "next/jest";

// Tell next-jest where your Next.js app is located
const createJestConfig = nextJest({ dir: "./" });

const customJestConfig: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/apollo/(.*)$": "<rootDir>/src/apollo/$1",
    "^@/zod/(.*)$": "<rootDir>/src/zod/$1",
  },
};

export default createJestConfig(customJestConfig);
