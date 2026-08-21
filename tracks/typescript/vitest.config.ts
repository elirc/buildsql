import { defineConfig } from "vitest/config";

// TypeScript track: gates grade both runtime behavior (expect) and types
// (expectTypeOf / @ts-expect-error), so typechecking is part of the gate.
export default defineConfig({
  test: {
    include: ["lessons/**/gate.test.ts"],
    environment: "node",
    typecheck: {
      enabled: true,
      checker: "tsc",
      tsconfig: "./tsconfig.json",
      include: ["lessons/**/gate.test-d.ts"],
      // `tsc -p tsconfig.json` typechecks the whole track at once, so an
      // unfinished lesson 07 would otherwise dump "Unhandled Source Error"
      // noise into a run filtered to lesson 02 - and would make `dojo verify`
      // fail every *other* lesson's reference pass. Errors inside the
      // gate.test-d.ts under test are still attributed to their test and
      // still fail the exercise; only errors in files this run is not
      // grading are dropped.
      ignoreSourceErrors: true,
    },
  },
});
