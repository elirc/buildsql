// Type gate for typescript/04_unions_narrowing. Quoted verbatim in README.md.
//
// Each test narrows inside a function that *takes* the union, because a `const`
// annotated with a union is immediately narrowed by control flow analysis to
// whatever you assigned it - which would make these checks prove nothing.
import { describe, expectTypeOf, test } from "vitest";

import { formatCell } from "./ex1/solution";
import type { DojoEvent } from "./ex2/solution";
import type { Failure } from "./ex3/solution";
import { assertNever } from "./ex4/solution";
import type { Result } from "./challenge/solution";
import type { Payment } from "./review1/solution";

describe("04_unions_narrowing", () => {
  test("ex1 - formatCell() accepts exactly three primitive types", () => {
    expectTypeOf(formatCell).parameters.toEqualTypeOf<[value: string | number | boolean]>();
    // @ts-expect-error - null is not one of the three members.
    formatCell(null);
  });

  test("ex2 - DojoEvent narrows on its kind", () => {
    function inspect(event: DojoEvent): void {
      if (event.kind === "hint") {
        expectTypeOf(event.tier).toEqualTypeOf<number>();
      } else if (event.kind === "pass") {
        expectTypeOf(event.attempts).toEqualTypeOf<number>();
      } else {
        expectTypeOf(event.message).toEqualTypeOf<string>();
      }
      expectTypeOf(event.exercise).toEqualTypeOf<string>();
    }
    inspect({ kind: "pass", exercise: "ex1", attempts: 1 });
    // @ts-expect-error - "skipped" is not one of the three kinds.
    inspect({ kind: "skipped", exercise: "ex1" });
    // @ts-expect-error - a pass event carries attempts, not a message.
    inspect({ kind: "pass", exercise: "ex1", message: "no" });
  });

  test("ex3 - Failure is three unrelated shapes", () => {
    function inspect(failure: Failure): void {
      if (failure instanceof Error) {
        expectTypeOf(failure.message).toEqualTypeOf<string>();
      } else if ("code" in failure) {
        expectTypeOf(failure.detail).toEqualTypeOf<string>();
      } else {
        expectTypeOf(failure.timeoutMs).toEqualTypeOf<number>();
      }
    }
    inspect(new Error("boom"));
    inspect({ code: 500, detail: "server" });
    inspect({ timeoutMs: 10 });
  });

  test("ex4 - assertNever() only accepts a value that cannot exist", () => {
    expectTypeOf(assertNever).parameters.toEqualTypeOf<[value: never]>();
    // @ts-expect-error - a string is a value, and never has none.
    assertNever("triangle");
  });

  test("challenge - the Result discriminant is a literal true/false", () => {
    function inspect(result: Result): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<string>();
      } else {
        expectTypeOf(result.error).toEqualTypeOf<string>();
      }
    }
    inspect({ ok: true, value: "green" });
    inspect({ ok: false, error: "boom" });
    // @ts-expect-error - a success has no error member.
    inspect({ ok: true, value: "x", error: "y" });
  });

  test("review1 - Payment narrows on its method", () => {
    function inspect(payment: Payment): void {
      if (payment.method === "card") {
        expectTypeOf(payment.last4).toEqualTypeOf<string>();
      } else if (payment.method === "transfer") {
        expectTypeOf(payment.iban).toEqualTypeOf<string>();
      }
    }
    inspect({ method: "cash" });
    // @ts-expect-error - cheque is not a supported method.
    inspect({ method: "cheque" });
  });
});
