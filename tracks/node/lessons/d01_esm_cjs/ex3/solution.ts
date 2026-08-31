// d01_esm_cjs / ex3 - reaching into CommonJS from an ES module.
// See lessons/d01_esm_cjs/README.md, "Problem 3".
//
// `./legacy-rules.cjs` exports { VERSION, RULES, apply }. Read it; do not
// reimplement it.

/** The VERSION string the legacy module publishes. */
export function legacyVersion(): string {
  throw new Error("ex3: legacyVersion() is not implemented yet - edit this file.");
}

/** The names in the legacy RULES object, sorted. */
export function ruleNames(): string[] {
  throw new Error("ex3: ruleNames() is not implemented yet - edit this file.");
}

/** Run one legacy rule, letting its own error out unchanged. */
export function applyRule(name: string, value: number): number {
  throw new Error("ex3: applyRule() is not implemented yet - edit this file.");
}
