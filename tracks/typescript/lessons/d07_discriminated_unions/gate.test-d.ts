// Type gate for typescript/d07_discriminated_unions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Cmd } from "./ex1/solution";
import { describeCommand } from "./ex1/solution";
import type { Action, MachineState } from "./ex2/solution";
import { reduce } from "./ex2/solution";
import type { Load } from "./ex3/solution";
import type { Frame } from "./ex4/solution";
import { readFrame } from "./ex4/solution";
import type { UiEvent } from "./ex5/solution";
import { route } from "./ex5/solution";
import type { Token } from "./ex6/solution";
import { tokenise } from "./ex6/solution";
import type { DoorState } from "./ex7/solution";
import { transition } from "./ex7/solution";
import type { Expr } from "./ex8/solution";
import { evaluate, render } from "./ex8/solution";

describe("d07_discriminated_unions", () => {
  test("ex1 - Cmd narrows on its kind", () => {
    function inspect(cmd: Cmd): void {
      if (cmd.kind === "insert") {
        expectTypeOf(cmd.cents).toEqualTypeOf<number>();
      } else if (cmd.kind === "select") {
        expectTypeOf(cmd.slot).toEqualTypeOf<string>();
      }
    }
    inspect({ kind: "refund" });
    expectTypeOf(describeCommand).returns.toEqualTypeOf<string>();
    // @ts-expect-error - there is no eject command.
    describeCommand({ kind: "eject" });
  });

  test("ex2 - Action narrows, and reduce() returns a whole state", () => {
    function inspect(action: Action): void {
      if (action.type === "buy") {
        expectTypeOf(action.price).toEqualTypeOf<number>();
        expectTypeOf(action.slot).toEqualTypeOf<string>();
      } else if (action.type === "coin") {
        expectTypeOf(action.cents).toEqualTypeOf<number>();
      }
    }
    inspect({ type: "refund" });
    const state: MachineState = { credit: 0, dispensed: [], message: "" };
    expectTypeOf(reduce(state, { type: "refund" })).toEqualTypeOf<MachineState>();
    // @ts-expect-error - a coin action carries cents, not a slot.
    reduce(state, { type: "coin", slot: "A1" });
  });

  test("ex3 - Load narrows on its status", () => {
    function inspect(load: Load): void {
      switch (load.status) {
        case "loading":
          expectTypeOf(load.startedAt).toEqualTypeOf<number>();
          break;
        case "done":
          expectTypeOf(load.body).toEqualTypeOf<string>();
          break;
        case "failed":
          expectTypeOf(load.retriable).toEqualTypeOf<boolean>();
          break;
        default:
          expectTypeOf(load).toEqualTypeOf<{ status: "idle" }>();
      }
    }
    inspect({ status: "idle" });
  });

  test("ex4 - Frame narrows on a numeric discriminant", () => {
    function inspect(frame: Frame): void {
      if (frame.version === 1) {
        expectTypeOf(frame.payload).toEqualTypeOf<string>();
      } else {
        expectTypeOf(frame.payload).toEqualTypeOf<readonly string[]>();
        expectTypeOf(frame.codec).toEqualTypeOf<"gzip" | "raw">();
      }
    }
    inspect({ version: 1, payload: "x" });
    expectTypeOf(readFrame).returns.toEqualTypeOf<string>();
    // @ts-expect-error - there is no version 3.
    readFrame({ version: 3, payload: "x" });
  });

  test("ex5 - UiEvent pins the button to three values", () => {
    function inspect(event: UiEvent): void {
      if (event.type === "click") {
        expectTypeOf(event.button).toEqualTypeOf<0 | 1 | 2>();
      } else if (event.type === "key") {
        expectTypeOf(event.repeat).toEqualTypeOf<boolean>();
      } else {
        expectTypeOf(event.dy).toEqualTypeOf<number>();
      }
    }
    inspect({ type: "scroll", dy: 1 });
    expectTypeOf(route([])).toEqualTypeOf<string[]>();
    // @ts-expect-error - there is no fourth mouse button.
    route([{ type: "click", button: 3 }]);
  });

  test("ex6 - Token pairs each kind with its value type", () => {
    function inspect(token: Token): void {
      if (token.kind === "number") {
        expectTypeOf(token.value).toEqualTypeOf<number>();
      } else {
        expectTypeOf(token.value).toEqualTypeOf<string>();
      }
    }
    inspect({ kind: "word", value: "a" });
    expectTypeOf(tokenise("a")).toEqualTypeOf<Token[]>();
    // @ts-expect-error - there is no punctuation kind.
    inspect({ kind: "punctuation", value: "," });
  });

  test("ex7 - DoorState carries different data per state", () => {
    function inspect(state: DoorState): void {
      if (state.state === "open") {
        expectTypeOf(state.since).toEqualTypeOf<number>();
      } else if (state.state === "locked") {
        expectTypeOf(state.code).toEqualTypeOf<string>();
      } else {
        expectTypeOf(state).toEqualTypeOf<{ state: "closed" }>();
      }
    }
    inspect({ state: "closed" });
    expectTypeOf(transition({ state: "closed" }, { event: "close" })).toEqualTypeOf<DoorState>();
    // @ts-expect-error - a locked door needs its code.
    transition({ state: "locked" }, { event: "close" });
  });

  test("ex8 - Expr is a recursive discriminated union", () => {
    function inspect(expr: Expr): void {
      switch (expr.kind) {
        case "lit":
          expectTypeOf(expr.value).toEqualTypeOf<number>();
          break;
        case "var":
          expectTypeOf(expr.name).toEqualTypeOf<string>();
          break;
        case "neg":
          expectTypeOf(expr.operand).toEqualTypeOf<Expr>();
          break;
        default:
          expectTypeOf(expr.left).toEqualTypeOf<Expr>();
      }
    }
    inspect({ kind: "lit", value: 1 });
    expectTypeOf(evaluate({ kind: "lit", value: 1 }, {})).toEqualTypeOf<number>();
    expectTypeOf(render({ kind: "lit", value: 1 })).toEqualTypeOf<string>();
    // @ts-expect-error - there is no division node.
    render({ kind: "div", left: { kind: "lit", value: 1 }, right: { kind: "lit", value: 2 } });
  });
});
