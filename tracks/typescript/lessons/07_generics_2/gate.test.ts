// Gate for typescript/07_generics_2. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { pluck } from "./ex1/solution";
import { longest } from "./ex2/solution";
import { Registry } from "./ex3/solution";
import { indexBy } from "./ex4/solution";
import { getIn } from "./challenge/solution";
import { firstWith } from "./review1/solution";

const learners = [
  { id: "a", name: "Ada", streak: 12 },
  { id: "b", name: "Eli", streak: 3 },
];

describe("07_generics_2", () => {
  test("ex1 - pluck() collects one property from every item", () => {
    expect(pluck(learners, "name"), "the names, in input order").toEqual(["Ada", "Eli"]);
    expect(pluck(learners, "streak"), "the streaks, as numbers").toEqual([12, 3]);
    expect(pluck([], "name"), "no items means no values").toEqual([]);
  });

  test("ex2 - longest() compares by length", () => {
    expect(longest("abc", "de"), "'abc' is longer than 'de'").toBe("abc");
    expect(longest([1, 2], [3]), "arrays have a length too - the constraint covers both").toEqual([
      1, 2,
    ]);
    expect(
      longest("ab", "cd"),
      "on a tie the FIRST argument wins - reread README ex2 and check your operator",
    ).toBe("ab");
  });

  test("ex3 - Registry stores and returns values of its own type", () => {
    const scores = new Registry<number>();
    scores.set("ada", 90);
    expect(scores.get("ada"), "what went in comes back out").toBe(90);
    expect(scores.has("ada"), "has() reports a key that was set").toBe(true);
    expect(scores.has("nobody"), "and reports a key that was not").toBe(false);
    expect(
      scores.get("nobody"),
      "a missing key is undefined, which is why get() returns T | undefined",
    ).toBeUndefined();
    scores.set("ada", 95);
    expect(scores.size, "setting the same key twice replaces it - size stays 1").toBe(1);

    const titles = new Registry();
    titles.set("ts", "TypeScript");
    expect(titles.get("ts"), "with no type argument the default kicks in").toBe("TypeScript");
  });

  test("ex4 - indexBy() builds a lookup keyed by a property", () => {
    const byId = indexBy(learners, "id");
    expect(byId.get("a"), "the whole item is the value, not just the key").toEqual({
      id: "a",
      name: "Ada",
      streak: 12,
    });
    expect(byId.size, "two items means two entries").toBe(2);
    const collided = indexBy(
      [
        { id: "a", name: "first" },
        { id: "a", name: "second" },
      ],
      "id",
    );
    expect(
      collided.get("a"),
      "when two items share a key the LAST one wins - a Map overwrites (README ex4)",
    ).toEqual({ id: "a", name: "second" });
  });

  test("challenge - getIn() reaches two levels down", () => {
    const config = {
      server: { host: "localhost", port: 8080 },
      logging: { level: "debug", json: false },
    };
    expect(getIn(config, "server", "port"), "two keys, one value: 8080").toBe(8080);
    expect(getIn(config, "logging", "level"), "and again on the other branch").toBe("debug");
    expect(getIn(config, "logging", "json"), "false is a value, not a miss").toBe(false);
  });

  test("review1 - firstWith() finds by a named property", () => {
    expect(firstWith(learners, "name", "Eli"), "the whole matching item comes back").toEqual({
      id: "b",
      name: "Eli",
      streak: 3,
    });
    expect(firstWith(learners, "streak", 12), "searching a numeric property works the same").toEqual(
      { id: "a", name: "Ada", streak: 12 },
    );
    expect(
      firstWith(learners, "name", "Grace"),
      "no match means undefined - find() already returns exactly that",
    ).toBeUndefined();
  });
});
