// d01_esm_cjs / ex6 - predict the module evaluation order.
// See lessons/d01_esm_cjs/README.md, "Problem 6".
//
// Four fixtures sit next to this file. ./trace holds a shared array; ./alpha
// and ./beta push a label onto it as their bodies run; ./entry pulls them in:
//
//   trace.ts   export const trace: string[] = [];
//              export function note(label) { trace.push(label); }
//
//   alpha.ts   import { note } from "./trace";
//              note("alpha");
//              export const alpha = "alpha";
//
//   beta.ts    import { alpha } from "./alpha";
//              import { note } from "./trace";
//              note(`beta sees ${alpha}`);
//              export const beta = "beta";
//
//   entry.ts   import "./beta";
//              import "./alpha";
//              import { note } from "./trace";
//              note("entry");
//
// The gate imports ./entry once and compares `trace` with your answer.

/** The labels in `trace`, in the order the module bodies put them there. */
export function predictEvaluationOrder(): string[] {
  throw new Error("ex6: predictEvaluationOrder() is not implemented yet - edit this file.");
}
