# d07 - Discriminated unions (drill set)

Eight problems on the single most useful pattern in TypeScript: object variants
that share a tag, each pinned to its own literal type. They drill lesson
**04_unions_narrowing**, second half; go back there if you cannot say why
`kind: string` narrows nothing.

**Every stub in this set ships with `string` (or `number`) as the discriminant
type instead of a literal.** That is the bug in all eight, and it is why the
type gate fails before you have written a line of logic. Fixing it is exercise
zero, every time.

## ex1 - describe a command

`Cmd` is `insert` (with `cents`), `select` (with `slot`) and `refund` (with
nothing at all).

- `{ kind: "insert", cents: 125 }` -> `"insert 125c"`
- `{ kind: "select", slot: "A4" }` -> `"select A4"`
- `{ kind: "refund" }` -> `"refund"`

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex1
```

## ex2 - a reducer

`reduce(state, action)` returns a **new** `MachineState` for every action:

- `coin` adds `cents` to the credit; message `"credit <total>c"`
- `buy` with enough credit spends `price`, appends `slot` to `dispensed`, and
  says `"dispensed <slot>"`; with too little it changes nothing but the message,
  which becomes `"need <shortfall>c more"`
- `refund` zeroes the credit and says `"refunded <old credit>c"`

The state you were handed, and its `dispensed` array, must both come back
untouched.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex2
```

## ex3 - render a load

`Load` is `idle`, `loading` (with `startedAt`), `done` (with `body`) and
`failed` (with `error` and `retriable`).

- `"idle"`, `"loading since 5"`, `"done: hi"`
- `"failed: boom (retry)"` or `"failed: boom (give up)"`

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex3
```

## ex4 - a numeric discriminant

`Frame` is `{ version: 1, payload: string }` or
`{ version: 2, payload: readonly string[], codec: "gzip" | "raw" }`. A
discriminant does not have to be a string.

- v1 -> the payload as it is
- v2 `raw` -> the payload joined with `|`
- v2 `gzip` -> that join wrapped as `gzip(...)`

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex4
```

## ex5 - route a list of events

`UiEvent` is `click` (with `button: 0 | 1 | 2`), `key` (with `key` and `repeat`)
and `scroll` (with `dy`). `route(events)` renders one string per event:

- `click` -> `"click:left"`, `"click:middle"`, `"click:right"`
- `key` -> `"key:a"`, or `"key:a(repeat)"` when repeating
- `scroll` -> `"scroll:up:3"` for `dy: -3`, `"scroll:down:3"` for `dy: 3`,
  `"scroll:none"` for `dy: 0`

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex5
```

## ex6 - build the union from text

`tokenise(input)` splits on runs of whitespace and tags each field:

1. a finite number -> `{ kind: "number", value: <number> }`
2. letters only -> `{ kind: "word", value: <text> }`
3. anything else -> `{ kind: "symbol", value: <text> }`

- `"12 abc +"` -> number 12, word `"abc"`, symbol `"+"`
- `"-3.5 x1 =="` -> number -3.5, symbol `"x1"`, symbol `"=="`
- `""` and `"   "` -> `[]`

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex6
```

## ex7 - a state machine

`transition(state, event)` moves a door. The legal moves are: closed + `open` ->
open (remembering `at`); closed + `lock` -> locked (with the code); open +
`close` -> closed; locked + `unlock` with the **matching** code -> closed.

Every other combination is illegal, and an illegal move returns **the same state
object it was given** - the gate checks identity, not just equality.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex7
```

## ex8 - an expression tree

`Expr` is `lit`, `var`, `neg`, `add` and `mul`, and the last three contain more
`Expr`s. Write two folds over it:

- `evaluate(expr, env)` computes the number; a variable missing from `env`
  throws a message containing `unknown variable: <name>`
- `render(expr)` renders it fully parenthesised: `"(1 + (2 * x))"`, `"-(2)"`,
  `"1"`, `"x"`

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d07_discriminated_unions ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d07_discriminated_unions. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { describeCommand } from "./ex1/solution";
import { reduce } from "./ex2/solution";
import { renderLoad } from "./ex3/solution";
import { readFrame } from "./ex4/solution";
import { route } from "./ex5/solution";
import { tokenise } from "./ex6/solution";
import { transition } from "./ex7/solution";
import { evaluate, render } from "./ex8/solution";

describe("d07_discriminated_unions", () => {
  test("ex1 - describeCommand() renders each variant", () => {
    expect(describeCommand({ kind: "insert", cents: 125 }), "an insert names its coins").toBe(
      "insert 125c",
    );
    expect(describeCommand({ kind: "select", slot: "A4" }), "a select names its slot").toBe(
      "select A4",
    );
    expect(
      describeCommand({ kind: "refund" }),
      "a refund carries nothing but its tag, and that is allowed",
    ).toBe("refund");
    expect(describeCommand({ kind: "insert", cents: 0 }), "zero coins is still an insert").toBe(
      "insert 0c",
    );
  });

  test("ex2 - reduce() returns a new state for every action", () => {
    const start = { credit: 0, dispensed: [], message: "" };

    const afterCoin = reduce(start, { type: "coin", cents: 100 });
    expect(afterCoin, "a coin raises the credit and reports it").toEqual({
      credit: 100,
      dispensed: [],
      message: "credit 100c",
    });
    expect(afterCoin, "and the state you were handed is not the state you get back").not.toBe(
      start,
    );
    expect(start.credit, "the original credit is untouched").toBe(0);

    expect(
      reduce(afterCoin, { type: "buy", slot: "A1", price: 150 }),
      "too little credit dispenses nothing and says how much is missing",
    ).toEqual({ credit: 100, dispensed: [], message: "need 50c more" });

    const bought = reduce(afterCoin, { type: "buy", slot: "A1", price: 100 });
    expect(bought, "enough credit spends it and appends the slot").toEqual({
      credit: 0,
      dispensed: ["A1"],
      message: "dispensed A1",
    });
    expect(
      afterCoin.dispensed,
      "the previous state keeps its own empty list - copy, do not push (README ex2)",
    ).toEqual([]);

    expect(
      reduce({ credit: 75, dispensed: ["A1"], message: "x" }, { type: "refund" }),
      "a refund zeroes the credit and reports what came back",
    ).toEqual({ credit: 0, dispensed: ["A1"], message: "refunded 75c" });
  });

  test("ex3 - renderLoad() covers four statuses", () => {
    expect(renderLoad({ status: "idle" }), "idle carries no data").toBe("idle");
    expect(
      renderLoad({ status: "loading", startedAt: 5 }),
      "loading reports when it started",
    ).toBe("loading since 5");
    expect(renderLoad({ status: "done", body: "hi" }), "done reports its body").toBe("done: hi");
    expect(
      renderLoad({ status: "failed", error: "boom", retriable: true }),
      "a retriable failure says retry",
    ).toBe("failed: boom (retry)");
    expect(
      renderLoad({ status: "failed", error: "boom", retriable: false }),
      "and a final one says give up",
    ).toBe("failed: boom (give up)");
  });

  test("ex4 - readFrame() discriminates on a number", () => {
    expect(readFrame({ version: 1, payload: "hello" }), "a v1 payload is already text").toBe(
      "hello",
    );
    expect(
      readFrame({ version: 2, payload: ["a", "b"], codec: "raw" }),
      "a v2 raw payload joins with pipes",
    ).toBe("a|b");
    expect(
      readFrame({ version: 2, payload: ["a", "b"], codec: "gzip" }),
      "and a gzip one wraps the join",
    ).toBe("gzip(a|b)");
    expect(
      readFrame({ version: 2, payload: [], codec: "raw" }),
      "an empty v2 payload joins to nothing",
    ).toBe("");
  });

  test("ex5 - route() maps a whole array of the union", () => {
    expect(
      route([
        { type: "click", button: 0 },
        { type: "click", button: 1 },
        { type: "click", button: 2 },
      ]),
      "the three buttons are left, middle and right",
    ).toEqual(["click:left", "click:middle", "click:right"]);
    expect(
      route([
        { type: "key", key: "a", repeat: false },
        { type: "key", key: "a", repeat: true },
      ]),
      "a repeating key says so",
    ).toEqual(["key:a", "key:a(repeat)"]);
    expect(
      route([
        { type: "scroll", dy: -3 },
        { type: "scroll", dy: 3 },
        { type: "scroll", dy: 0 },
      ]),
      "a negative dy scrolls up, and the distance is never negative",
    ).toEqual(["scroll:up:3", "scroll:down:3", "scroll:none"]);
    expect(route([]), "no events means no lines").toEqual([]);
  });

  test("ex6 - tokenise() builds the union from text", () => {
    expect(tokenise("12 abc +"), "one token per field, tagged by what it is").toEqual([
      { kind: "number", value: 12 },
      { kind: "word", value: "abc" },
      { kind: "symbol", value: "+" },
    ]);
    expect(tokenise(""), "an empty input has no tokens").toEqual([]);
    expect(tokenise("   "), "and neither does one that is only spaces").toEqual([]);
    expect(tokenise("  a   b "), "runs of whitespace separate, they do not tokenise").toEqual([
      { kind: "word", value: "a" },
      { kind: "word", value: "b" },
    ]);
    expect(
      tokenise("-3.5 x1 =="),
      "a number token keeps a real number; x1 is not all letters, so it is a symbol",
    ).toEqual([
      { kind: "number", value: -3.5 },
      { kind: "symbol", value: "x1" },
      { kind: "symbol", value: "==" },
    ]);
    expect(tokenise("0"), "zero is a number token, value 0").toEqual([
      { kind: "number", value: 0 },
    ]);
  });

  test("ex7 - transition() refuses illegal moves by standing still", () => {
    expect(
      transition({ state: "closed" }, { event: "open", at: 7 }),
      "a closed door opens, remembering when",
    ).toEqual({ state: "open", since: 7 });
    expect(
      transition({ state: "open", since: 7 }, { event: "close" }),
      "an open door closes",
    ).toEqual({ state: "closed" });
    expect(
      transition({ state: "closed" }, { event: "lock", code: "1234" }),
      "a closed door locks with a code",
    ).toEqual({ state: "locked", code: "1234" });
    expect(
      transition({ state: "locked", code: "1234" }, { event: "unlock", code: "1234" }),
      "the right code unlocks it, back to closed",
    ).toEqual({ state: "closed" });

    const locked = { state: "locked", code: "1234" } as const;
    expect(
      transition(locked, { event: "unlock", code: "0000" }),
      "the wrong code changes nothing - and the SAME state object comes back " +
        "(README ex7)",
    ).toBe(locked);

    const open = { state: "open", since: 1 } as const;
    expect(transition(open, { event: "lock", code: "x" }), "an open door cannot be locked").toBe(
      open,
    );

    const closed = { state: "closed" } as const;
    expect(transition(closed, { event: "close" }), "closing a closed door is a no-op").toBe(
      closed,
    );
    expect(
      transition(closed, { event: "unlock", code: "1234" }),
      "and unlocking one that is not locked is a no-op too",
    ).toBe(closed);
  });

  test("ex8 - evaluate() and render() fold a recursive union", () => {
    const one = { kind: "lit", value: 1 } as const;
    const two = { kind: "lit", value: 2 } as const;
    const x = { kind: "var", name: "x" } as const;
    const tree = {
      kind: "add",
      left: one,
      right: { kind: "mul", left: two, right: x },
    } as const;

    expect(evaluate(one, {}), "a literal is its own value").toBe(1);
    expect(evaluate(x, { x: 5 }), "a variable is looked up in the environment").toBe(5);
    expect(evaluate(tree, { x: 5 }), "1 + (2 * 5) is 11").toBe(11);
    expect(evaluate({ kind: "neg", operand: two }, {}), "negation flips the sign").toBe(-2);
    expect(
      () => evaluate({ kind: "var", name: "y" }, {}),
      "a variable the environment does not have must fail loudly, not read as NaN",
    ).toThrow(/unknown variable: y/);
    expect(
      evaluate({ kind: "var", name: "z" }, { z: 0 }),
      "a variable bound to zero is bound - do not confuse it with missing",
    ).toBe(0);

    expect(render(one), "a literal renders as its number").toBe("1");
    expect(render(x), "a variable renders as its name").toBe("x");
    expect(
      render(tree),
      "every operator is fully parenthesised, so the shape is never ambiguous",
    ).toBe("(1 + (2 * x))");
    expect(render({ kind: "neg", operand: two }), "negation wraps its operand").toBe("-(2)");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
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
```

An exercise is green only when both gates agree about it.
