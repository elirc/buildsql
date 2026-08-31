// Gate for node/d10_error_patterns. Quoted verbatim in README.md.
//
// Nothing here is timed or concurrent: these are the shapes you put around a
// failure, and every one of them is graded by inspecting what came out. Where
// a helper must not act synchronously, the gate checks by looking at what has
// happened by the time the call returns.
import { describe, expect, test } from "vitest";

import { asError } from "./ex1/solution";
import { onceCallback } from "./ex2/solution";
import { ensureAsync } from "./ex3/solution";
import { explain } from "./ex4/solution";
import { withContext } from "./ex5/solution";
import { swallow } from "./ex6/solution";
import { flattenErrors } from "./ex7/solution";
import { createErrorBoundary } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("d10_error_patterns", () => {
  test("ex1 - asError() gives you something you can actually read a message off", () => {
    const real = new Error("the real thing");
    expect(
      asError(real),
      "an Error is returned as it is - the SAME object, so the stack trace is " +
        "the original one and not a copy taken three frames later",
    ).toBe(real);

    class NotFound extends Error {}
    const subclass = new NotFound("missing");
    expect(asError(subclass), "and so is any subclass of it").toBe(subclass);

    const fromString = asError("just a string");
    expect(fromString, "a thrown string becomes a real Error").toBeInstanceOf(Error);
    expect(fromString.message, "with the string as the message").toBe("just a string");
    expect(
      fromString.cause,
      "and nothing to keep as a cause - the string was the whole of it",
    ).toBeUndefined();

    const duck = { message: "looks like an error", code: "EDUCK" };
    const converted = asError(duck);
    expect(
      converted.message,
      "an object carrying a string message is the shape libraries and JSON " +
        "responses arrive in, so take the message",
    ).toBe("looks like an error");
    expect(
      converted.cause,
      "and keep the original as the cause, because everything else it carried " +
        "would otherwise be lost",
    ).toBe(duck);

    const odd = asError(42);
    expect(odd.message, "anything else is stringified").toBe("42");
    expect(odd.cause, "and kept").toBe(42);
    expect(
      asError(undefined).message,
      "including undefined, which is what a bare `throw` in a catch block " +
        "sometimes produces",
    ).toBe("undefined");
  });

  test("ex2 - onceCallback() makes a callback safe to call twice", () => {
    const seen: string[] = [];
    const guarded = onceCallback((value: string) => seen.push(value));

    guarded("first");
    expect(seen, "the first call goes through").toEqual(["first"]);
    expect(guarded.calls(), "and is counted").toBe(1);
    expect(guarded.suppressed(), "nothing suppressed yet").toBe(0);

    guarded("second");
    guarded("third");
    expect(
      seen,
      "the underlying callback is never called twice. In the callback world " +
        "that is not a niggle: calling back twice runs the whole continuation " +
        "twice, which is how one HTTP request becomes two charges",
    ).toEqual(["first"]);
    expect(guarded.calls(), "still one real call").toBe(1);
    expect(
      guarded.suppressed(),
      "and the suppressed ones are counted rather than thrown away silently - " +
        "a nonzero count here is a bug in the code that called you",
    ).toBe(2);

    let calls = 0;
    const counting = onceCallback(() => {
      calls += 1;
    });
    expect(counting.calls(), "an unused guard has done nothing").toBe(0);
    counting();
    expect(calls, "a zero-argument callback works the same").toBe(1);
  });

  test("ex3 - ensureAsync() never surprises its caller", async () => {
    const doubled = ensureAsync((n: number) => n * 2);
    const result = doubled(21);
    expect(result, "a plain return value comes back as a promise").toBeInstanceOf(Promise);
    expect(await result, "carrying the value").toBe(42);

    const order: string[] = [];
    void ensureAsync(() => "now")().then(() => order.push("settled"));
    order.push("after the call");
    await settle();
    expect(
      order,
      "and it never settles synchronously, even when the work was instant. A " +
        "function that is sometimes sync and sometimes not is the hardest kind " +
        "of race to reproduce",
    ).toEqual(["after the call", "settled"]);

    const validating = ensureAsync((n: number): number => {
      if (n < 0) throw new Error("n must not be negative");
      return n;
    });

    let threw = false;
    let promise: Promise<number> | undefined;
    try {
      promise = validating(-1);
    } catch {
      threw = true;
    }
    expect(
      threw,
      "a synchronous throw must NOT escape the wrapper. Argument validation " +
        "throws before any promise exists, and a caller writing .catch() has " +
        "no way to see it",
    ).toBe(false);
    await expect(promise, "it becomes a rejection instead").rejects.toThrow(
      "n must not be negative",
    );

    const alreadyAsync = ensureAsync(async (n: number) => n + 1);
    expect(
      await alreadyAsync(1),
      "a function that already returns a promise is adopted, not wrapped in " +
        "another layer",
    ).toBe(2);
    await expect(
      ensureAsync(async () => {
        throw new Error("async failure");
      })(),
      "and its rejections pass straight through",
    ).rejects.toThrow("async failure");
  });

  test("ex4 - explain() walks the cause chain without falling into a loop", () => {
    const root = new Error("ECONNREFUSED 127.0.0.1:5432");
    const middle = new Error("loading the user profile", { cause: root });
    const outer = new Error("rendering the dashboard", { cause: middle });

    expect(
      explain(outer),
      "the chain reads outermost first, which is the order a human wants: what " +
        "you were doing, then why it failed, then what actually broke",
    ).toEqual({
      chain: [
        "rendering the dashboard",
        "loading the user profile",
        "ECONNREFUSED 127.0.0.1:5432",
      ],
      root,
      depth: 3,
    });

    expect(
      explain(root),
      "an error with no cause is its own root, one link deep",
    ).toEqual({ chain: ["ECONNREFUSED 127.0.0.1:5432"], root, depth: 1 });

    const withData = new Error("bad row", { cause: { row: 3 } });
    expect(
      explain(withData),
      "cause is allowed to hold anything at all. Only an Error is another link " +
        "in the chain - a plain object is data, and the walk stops there",
    ).toEqual({ chain: ["bad row"], root: withData, depth: 1 });

    const first = new Error("first");
    const second = new Error("second", { cause: first });
    (first as Error & { cause?: unknown }).cause = second;

    const looped = explain(second);
    expect(
      looped.chain,
      "a cause chain that points back at itself must stop rather than spin. " +
        "Wrapping code in a retry loop is one very ordinary way to build one",
    ).toEqual(["second", "first"]);
    expect(looped.root, "the last error reached before the repeat is the root").toBe(first);
    expect(looped.depth, "two links").toBe(2);
  });

  test("ex5 - withContext() says what you were doing when it broke", async () => {
    const value = { id: 1 };
    const ok = withContext(async () => value, "loading the invoice");
    expect(
      await ok(),
      "a success passes through untouched, by identity - a wrapper that " +
        "rebuilds the value on the way out is not a wrapper",
    ).toBe(value);

    const original = new Error("ECONNREFUSED");
    const failing = withContext(async () => {
      throw original;
    }, "loading the invoice");

    const error = await failing().then(
      () => undefined,
      (reason: unknown) => reason as Error,
    );
    expect(
      error?.message,
      "the context goes in front of the original message, separated by a colon " +
        "and a space",
    ).toBe("loading the invoice: ECONNREFUSED");
    expect(
      error?.cause,
      "and the original goes in cause, unchanged - that is how a reader gets " +
        "from your sentence to the real stack trace",
    ).toBe(original);
    expect(
      error,
      "which means it is a NEW error: mutating the one you caught changes it " +
        "for everybody else holding it",
    ).not.toBe(original);
    expect(original.message, "and the original is untouched").toBe("ECONNREFUSED");

    const thrownString = await withContext(async () => {
      throw "the pool is empty";
    }, "checking out a connection")().then(
      () => undefined,
      (reason: unknown) => reason as Error,
    );
    expect(
      thrownString?.message,
      "anything thrown gets the same treatment, so the caller can always read " +
        "a message",
    ).toBe("checking out a connection: the pool is empty");

    const args: number[] = [];
    const withArgs = withContext(async (a: number, b: number) => {
      args.push(a, b);
      return a + b;
    }, "adding");
    expect(await withArgs(2, 3), "the arguments are passed through").toBe(5);
    expect(args).toEqual([2, 3]);
  });

  test("ex6 - swallow() catches narrowly and rethrows everything else", async () => {
    const missing = Object.assign(new Error("no such file"), { code: "ENOENT" });
    const denied = Object.assign(new Error("permission denied"), { code: "EACCES" });
    const isMissing = (error: Error): boolean =>
      (error as Error & { code?: string }).code === "ENOENT";

    expect(
      await swallow(async () => "the real value", { when: isMissing, fallback: "default" }),
      "a success never reaches the predicate at all",
    ).toBe("the real value");

    expect(
      await swallow(
        async () => {
          throw missing;
        },
        { when: isMissing, fallback: "default" },
      ),
      "a failure the predicate accepts becomes the fallback - which is the " +
        "whole point of a config file that may not exist",
    ).toBe("default");

    const escaped = await swallow(
      async () => {
        throw denied;
      },
      { when: isMissing, fallback: "default" },
    ).then(
      () => undefined,
      (reason: unknown) => reason,
    );
    expect(
      escaped,
      "a failure it does not recognise is rethrown AS IT IS - same object, same " +
        "stack. A catch that returns a fallback for everything is how real " +
        "damage gets reported as a missing file",
    ).toBe(denied);

    const seen: Error[] = [];
    const rethrown = await swallow(
      async () => {
        throw "a bare string";
      },
      {
        when: (error) => {
          seen.push(error);
          return false;
        },
        fallback: "default",
      },
    ).then(
      () => undefined,
      (reason: unknown) => reason,
    );
    expect(
      seen[0],
      "the predicate is always handed a real Error, so it can read .message " +
        "without checking the type first",
    ).toBeInstanceOf(Error);
    expect(
      rethrown,
      "but what is rethrown is the ORIGINAL thing that was thrown, not your " +
        "tidied-up version of it",
    ).toBe("a bare string");
  });

  test("ex7 - flattenErrors() finds the leaves of a failure tree", () => {
    const alpha = new Error("alpha");
    const beta = new Error("beta");
    const aggregate = new AggregateError([alpha, beta], "two uploads failed");
    const wrapped = new Error("request failed", { cause: aggregate });

    expect(
      flattenErrors(wrapped).map((error) => error.message),
      "follow cause into the aggregate and its errors out the other side: what " +
        "a human needs is the leaves, not the scaffolding around them",
    ).toEqual(["alpha", "beta"]);

    const alone = new Error("alone");
    expect(
      flattenErrors(alone),
      "an error with nothing underneath it is itself the leaf",
    ).toEqual([alone]);

    const shared = new Error("shared");
    expect(
      flattenErrors(new AggregateError([shared, shared], "twice")),
      "the same error reached twice is reported once - a fan-out failure " +
        "commonly puts one underlying error in several branches",
    ).toEqual([shared]);

    const nested = new AggregateError(
      [new AggregateError([alpha], "inner"), new Error("gamma", { cause: beta })],
      "outer",
    );
    expect(
      flattenErrors(nested).map((error) => error.message),
      "the tree can be any depth and mix both kinds of link",
    ).toEqual(["alpha", "beta"]);

    const first = new Error("first");
    const second = new Error("second", { cause: first });
    (first as Error & { cause?: unknown }).cause = second;
    expect(
      flattenErrors(second).map((error) => error.message),
      "and a loop must terminate: an error whose only link points at something " +
        "already visited has nothing new underneath it, so it is a leaf",
    ).toEqual(["first"]);

    expect(
      flattenErrors("not an error at all"),
      "something that is not an Error has no leaves to report",
    ).toEqual([]);
  });

  test("ex8 - createErrorBoundary() routes failures and survives a broken handler", () => {
    const operational: string[] = [];
    const fatal: string[] = [];
    const boundary = createErrorBoundary({
      classify: (error) => (error.message.startsWith("bad input") ? "operational" : "fatal"),
      onOperational: (error) => operational.push(error.message),
      onFatal: (error) => fatal.push(error.message),
    });

    boundary.handle(new Error("bad input: email must contain an @"));
    expect(
      operational,
      "an expected failure is handled and the process carries on",
    ).toEqual(["bad input: email must contain an @"]);

    boundary.handle(new TypeError("x is not a function"));
    expect(fatal, "a bug in your own code is a different category").toEqual([
      "x is not a function",
    ]);

    boundary.handle("a thrown string");
    expect(
      fatal,
      "and whatever arrives is normalised first, so classify() and the " +
        "handlers only ever deal with real Errors",
    ).toEqual(["x is not a function", "a thrown string"]);

    const brokenLogger: string[] = [];
    const broken = createErrorBoundary({
      classify: () => "operational",
      onOperational: () => {
        throw new Error("the logger is down");
      },
      onFatal: (error) => brokenLogger.push(error.message),
    });
    broken.handle(new Error("some ordinary problem"));
    expect(
      brokenLogger,
      "a handler that throws is itself a fatal problem, and it must not escape " +
        "silently. The failure of your error handling is the last thing you " +
        "can afford to lose",
    ).toEqual(["the logger is down"]);

    const confused: string[] = [];
    const unsure = createErrorBoundary({
      classify: () => {
        throw new Error("the classifier broke");
      },
      onOperational: () => confused.push("operational"),
      onFatal: (error) => confused.push(`fatal:${error.message}`),
    });
    unsure.handle(new Error("original problem"));
    expect(
      confused,
      "if you cannot decide what kind of failure it is, assume the worst - and " +
        "report the ORIGINAL error, which is the one somebody has to fix",
    ).toEqual(["fatal:original problem"]);

    const hopeless = createErrorBoundary({
      classify: () => "fatal",
      onOperational: () => {},
      onFatal: () => {
        throw new Error("everything is on fire");
      },
    });
    expect(
      () => hopeless.handle(new Error("original")),
      "and when the last handler fails there is nobody left to tell, so it " +
        "escapes - which in a process-level handler is exactly right",
    ).toThrow("everything is on fire");
  });
});
