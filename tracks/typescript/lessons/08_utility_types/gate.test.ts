// Gate for typescript/08_utility_types. Quoted verbatim in README.md.
import { describe, expect, test, vi } from "vitest";

import { applyPatch } from "./ex1/solution";
import { toPublicUser, toSummary } from "./ex2/solution";
import { pickKeys } from "./ex3/solution";
import { once } from "./ex4/solution";
import { omitKeys } from "./challenge/solution";
import { tallyVerdicts } from "./review1/solution";

const user = {
  id: "u1",
  email: "ada@example.com",
  passwordHash: "not-a-real-hash",
  createdAt: "2026-01-01",
};

describe("08_utility_types", () => {
  test("ex1 - applyPatch() overrides only what the patch names", () => {
    const base = { retries: 1, label: "run", verbose: false };
    expect(
      applyPatch(base, { label: "nightly" }),
      "one member replaced, the rest copied across",
    ).toEqual({ retries: 1, label: "nightly", verbose: false });
    expect(
      applyPatch(base, { verbose: true, retries: 0 }),
      "an explicit 0 is a real value and must land in the result",
    ).toEqual({ retries: 0, label: "run", verbose: true });
    expect(
      applyPatch(base, { label: undefined }),
      "a patch value of undefined means 'no opinion', so the base survives - " +
        "this is the case a plain { ...base, ...patch } gets wrong (README ex1)",
    ).toEqual({ retries: 1, label: "run", verbose: false });
    expect(base.label, "the base object itself is never modified").toBe("run");
  });

  test("ex2 - toPublicUser() and toSummary() drop what they should", () => {
    const publicUser = toPublicUser(user);
    expect(
      "passwordHash" in publicUser,
      "the password hash must not be on the public object at all - not " +
        "undefined, not empty: absent",
    ).toBe(false);
    expect(publicUser, "everything else survives").toEqual({
      id: "u1",
      email: "ada@example.com",
      createdAt: "2026-01-01",
    });
    expect(toSummary(user), "the summary is exactly id and email").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(user.passwordHash, "the input is not modified on the way through").toBe(
      "not-a-real-hash",
    );
  });

  test("ex3 - pickKeys() copies just the named members", () => {
    expect(pickKeys(user, ["id", "email"]), "two keys in, two members out").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(pickKeys(user, []), "no keys means an empty object").toEqual({});
    expect(
      Object.keys(pickKeys(user, ["createdAt"])),
      "only the named key is present - no undefined placeholders",
    ).toEqual(["createdAt"]);
  });

  test("ex4 - once() calls through exactly one time", () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const memo = once(spy);
    expect(memo(2, 3), "the first call runs the function and returns its result").toBe(5);
    expect(
      memo(10, 10),
      "every later call returns the FIRST result, whatever the arguments",
    ).toBe(5);
    expect(spy, "the wrapped function ran exactly once").toHaveBeenCalledTimes(1);
  });

  test("challenge - omitKeys() removes the named members", () => {
    const trimmed = omitKeys(user, ["passwordHash", "createdAt"]);
    expect(trimmed, "two keys removed, two kept").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(
      "passwordHash" in trimmed,
      "removed means absent - a delete, not an assignment to undefined",
    ).toBe(false);
    expect(omitKeys(user, []), "omitting nothing returns a copy of everything").toEqual(user);
    expect(user.createdAt, "the source object is untouched").toBe("2026-01-01");
  });

  test("review1 - tallyVerdicts() always returns all three counters", () => {
    expect(
      tallyVerdicts(["pass", "fail", "pass"]),
      "two passes, one fail, and skip is present at zero",
    ).toEqual({ pass: 2, fail: 1, skip: 0 });
    expect(
      tallyVerdicts([]),
      "an empty run still reports all three keys - that is what Record buys you",
    ).toEqual({ pass: 0, fail: 0, skip: 0 });
  });
});
