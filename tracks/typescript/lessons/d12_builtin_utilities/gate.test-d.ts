// Type gate for typescript/d12_builtin_utilities. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { JobDraft } from "./ex1/solution";
import { complete } from "./ex1/solution";
import type { Dead, Live, Status } from "./ex2/solution";
import { isLive, liveOnly } from "./ex2/solution";
import { firstDefined } from "./ex3/solution";
import type { LoadArgs, Loaded } from "./ex4/solution";
import { callWith } from "./ex4/solution";
import type { Posting } from "./ex5/solution";
import { diffPatch } from "./ex5/solution";
import type { Fetched } from "./ex6/solution";
import { loadAll } from "./ex6/solution";
import type { Search, SearchArgs, SearchInstance } from "./ex7/solution";
import { makeSearch } from "./ex7/solution";
import type { PublicPosting } from "./ex8/solution";
import { publish } from "./ex8/solution";

describe("d12_builtin_utilities", () => {
  test("ex1 - Required removes every question mark", () => {
    expectTypeOf(complete({})).toEqualTypeOf<Required<JobDraft>>();
    expectTypeOf(complete({})).toEqualTypeOf<{
      title: string;
      salary: number;
      remote: boolean;
    }>();
    expectTypeOf<JobDraft["salary"]>().toEqualTypeOf<number | undefined>();
    // @ts-expect-error - a title is a string.
    complete({ title: 1 });
  });

  test("ex2 - Exclude and Extract cut the union both ways", () => {
    expectTypeOf<Live>().toEqualTypeOf<"draft" | "open" | "paused">();
    expectTypeOf<Dead>().toEqualTypeOf<"closed" | "archived">();
    function inspect(status: Status): void {
      if (isLive(status)) {
        expectTypeOf(status).toEqualTypeOf<Live>();
      } else {
        expectTypeOf(status).toEqualTypeOf<Dead>();
      }
    }
    inspect("open");
    expectTypeOf(liveOnly([])).toEqualTypeOf<Live[]>();
  });

  test("ex3 - NonNullable strips null and undefined from the result", () => {
    expectTypeOf(firstDefined(["a", null])).toEqualTypeOf<string | undefined>();
    expectTypeOf(firstDefined([1, undefined])).toEqualTypeOf<number | undefined>();
    expectTypeOf(firstDefined([])).toEqualTypeOf<undefined>();
  });

  test("ex4 - Parameters and ReturnType read a function type apart", () => {
    expectTypeOf<LoadArgs>().toEqualTypeOf<[id: string, includeDrafts: boolean]>();
    expectTypeOf<Loaded>().toEqualTypeOf<{ id: string; title: string; draft: boolean }>();
    expectTypeOf(callWith(["p1", true])).toEqualTypeOf<Loaded>();
    // @ts-expect-error - the argument list needs both arguments.
    callWith(["p1"]);
  });

  test("ex5 - Partial makes every member optional", () => {
    const before: Posting = { id: "p1", title: "t", salary: 1, remote: false };
    expectTypeOf(diffPatch(before, before)).toEqualTypeOf<Partial<Posting>>();
    expectTypeOf<Partial<Posting>["salary"]>().toEqualTypeOf<number | undefined>();
    // @ts-expect-error - a patch is not a whole posting, so it cannot be assigned to one.
    const wrong: Posting = diffPatch(before, before);
  });

  test("ex6 - Awaited unwraps the promise", () => {
    expectTypeOf<Fetched>().toEqualTypeOf<{ id: string; title: string }>();
    expectTypeOf(loadAll([])).toEqualTypeOf<Promise<Fetched[]>>();
    // @ts-expect-error - the ids are strings.
    loadAll([1]);
  });

  test("ex7 - ConstructorParameters and InstanceType read a class apart", () => {
    expectTypeOf<SearchArgs>().toEqualTypeOf<[term: string, limit: number]>();
    expectTypeOf<SearchInstance>().toEqualTypeOf<Search>();
    expectTypeOf(makeSearch(["dev", 2]).run([])).toEqualTypeOf<string[]>();
    // @ts-expect-error - the constructor takes a term and a limit.
    makeSearch(["dev"]);
  });

  test("ex8 - Omit and Readonly compose", () => {
    expectTypeOf<PublicPosting>().toEqualTypeOf<{
      readonly id: string;
      readonly title: string;
      readonly status: Status;
    }>();
    expectTypeOf(publish([])).toEqualTypeOf<PublicPosting[]>();
    const published = publish([])[0];
    // @ts-expect-error - a published posting is readonly.
    published.title = "x";
    // @ts-expect-error - the recruiter email is gone from the type, not just from the value.
    published.recruiterEmail;
  });
});
