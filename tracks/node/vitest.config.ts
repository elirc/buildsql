import { defineConfig } from "vitest/config";

// Node track: real Node APIs (fs/promises, streams, http, express via
// supertest). Nothing is mocked away - the point is the platform itself.
export default defineConfig({
  test: {
    include: ["lessons/**/gate.test.ts"],
    environment: "node",
  },
});
