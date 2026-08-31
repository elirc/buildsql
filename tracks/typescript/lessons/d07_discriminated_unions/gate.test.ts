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
