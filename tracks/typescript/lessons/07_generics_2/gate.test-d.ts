// Type gate for typescript/07_generics_2. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { pluck } from "./ex1/solution";
import { longest } from "./ex2/solution";
import { Registry } from "./ex3/solution";
import { indexBy } from "./ex4/solution";
import { getIn } from "./challenge/solution";
import { firstWith } from "./review1/solution";

interface Learner {
  id: string;
  name: string;
  streak: number;
}

const learners: Learner[] = [{ id: "a", name: "Ada", streak: 12 }];

describe("07_generics_2", () => {
  test("ex1 - pluck() returns the type stored at the key", () => {
    expectTypeOf(pluck(learners, "name")).toEqualTypeOf<string[]>();
    expectTypeOf(pluck(learners, "streak")).toEqualTypeOf<number[]>();
    // @ts-expect-error - "nickname" is not a key of Learner.
    pluck(learners, "nickname");
  });

  test("ex2 - longest() only accepts things with a length", () => {
    expectTypeOf(longest("a", "bb")).toEqualTypeOf<string>();
    expectTypeOf(longest([1], [2, 3])).toEqualTypeOf<number[]>();
    // @ts-expect-error - a number has no length, so the constraint rejects it.
    longest(1, 2);
  });

  test("ex3 - Registry<T> defaults to string", () => {
    const scores = new Registry<number>();
    expectTypeOf(scores.get("ada")).toEqualTypeOf<number | undefined>();
    expectTypeOf(scores.has("ada")).toEqualTypeOf<boolean>();
    expectTypeOf(scores.size).toEqualTypeOf<number>();
    const titles = new Registry();
    expectTypeOf(titles.get("ts")).toEqualTypeOf<string | undefined>();
    // @ts-expect-error - a Registry<number> stores numbers.
    scores.set("ada", "ninety");
  });

  test("ex4 - indexBy() keys the map by the property type", () => {
    expectTypeOf(indexBy(learners, "id")).toEqualTypeOf<Map<string, Learner>>();
    expectTypeOf(indexBy(learners, "streak")).toEqualTypeOf<Map<number, Learner>>();
    // @ts-expect-error - "missing" is not a key of Learner.
    indexBy(learners, "missing");
  });

  test("challenge - getIn() chains two keyof constraints", () => {
    const config = { server: { host: "localhost", port: 8080 } };
    expectTypeOf(getIn(config, "server", "port")).toEqualTypeOf<number>();
    expectTypeOf(getIn(config, "server", "host")).toEqualTypeOf<string>();
    // @ts-expect-error - "colour" is not a key of config.server.
    getIn(config, "server", "colour");
  });

  test("review1 - firstWith() types the search value by the key", () => {
    expectTypeOf(firstWith(learners, "name", "Ada")).toEqualTypeOf<Learner | undefined>();
    // @ts-expect-error - streak is a number, so a string cannot match it.
    firstWith(learners, "streak", "twelve");
  });
});
