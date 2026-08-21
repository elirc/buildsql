// Adds jest-dom's DOM matchers (toBeInTheDocument, toHaveTextContent, ...)
// to vitest's expect, and cleans up the jsdom container between tests.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
