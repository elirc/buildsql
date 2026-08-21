import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// React track: jsdom + React Testing Library. Gates assert on the accessible
// DOM (roles, labels, text) - never on component internals.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["lessons/**/gate.test.tsx", "lessons/**/gate.test.ts"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
  },
});
