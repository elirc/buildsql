# d12 - Built-in utility types (drill set)

Eight problems on the utility types that ship with TypeScript: `Required`,
`Exclude`, `Extract`, `NonNullable`, `Parameters`, `ReturnType`, `Partial`,
`Awaited`, `ConstructorParameters`, `InstanceType`, `Omit` and `Readonly`. They
drill lesson **08_utility_types**; go back there if you cannot say what
`Pick` and `Omit` have to do with each other.

**Every stub here has given up on a derived type** - returning the input type
instead of the transformed one, or `unknown[]` instead of a real argument list.
The type gate marks each one.

## ex1 - fill a draft

`JobDraft` has three optional members. `complete(draft)` returns
`Required<JobDraft>` with the holes filled: `"untitled"`, `0`, `false`.

An explicitly supplied `0`, `false` or `""` is a value, not a hole.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex1
```

## ex2 - cut a union in two

`Status` is `"draft" | "open" | "paused" | "closed" | "archived"`. Derive both
halves:

- `Live` = `Exclude<Status, "closed" | "archived">`
- `Dead` = `Extract<Status, "closed" | "archived">`

Then `isLive(status)` is a type predicate for `Live` - so the `else` branch
narrows to `Dead` - and `liveOnly(statuses)` returns `Live[]`.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex2
```

## ex3 - the first value that is really there

`firstDefined(values)` returns `NonNullable<T> | undefined` - the first element
that is neither `null` nor `undefined`. `0` and `""` are values.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex3
```

## ex4 - take a function type apart

`loadPosting` is written for you. Derive `LoadArgs` with `Parameters<typeof
loadPosting>` and `Loaded` with `ReturnType<typeof loadPosting>`, then write
`callWith(args)` which spreads a saved argument list into the call.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex4
```

## ex5 - a patch of what changed

`diffPatch(before, after)` returns `Partial<Posting>` containing only the
members whose values differ. An unchanged member is **absent**, not present as
`undefined`.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex5
```

## ex6 - unwrap a promise type

`fetchPosting` returns a `Promise`. Derive `Fetched` as
`Awaited<ReturnType<typeof fetchPosting>>` - the resolved shape, with no
`Promise` left in it - and write `loadAll(ids)` returning `Promise<Fetched[]>`.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex6
```

## ex7 - take a class apart

`Search` takes `(term, limit)` and its `run(postings)` returns the postings
containing `term`, case-insensitively, capped at `limit`. Derive
`SearchArgs` with `ConstructorParameters<typeof Search>` and `SearchInstance`
with `InstanceType<typeof Search>`, then write `makeSearch(args)` and `run`.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex7
```

## ex8 - a public view of a posting

`PublicPosting` is `Readonly<Omit<Posting, "internalNotes" | "recruiterEmail">>`.
`publish(postings)` drops every posting whose status is `"closed"` or
`"archived"`, and strips the two private members from the rest - **removed**,
not blanked. Input order is kept and the source postings are never modified.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d12_builtin_utilities ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d12_builtin_utilities. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { complete } from "./ex1/solution";
import { isLive, liveOnly } from "./ex2/solution";
import { firstDefined } from "./ex3/solution";
import { callWith } from "./ex4/solution";
import { diffPatch } from "./ex5/solution";
import { loadAll } from "./ex6/solution";
import { makeSearch } from "./ex7/solution";
import { publish } from "./ex8/solution";

const posting = {
  id: "p1",
  title: "Engineer",
  salary: 100,
  remote: true,
};

describe("d12_builtin_utilities", () => {
  test("ex1 - complete() fills every hole", () => {
    expect(complete({}), "an empty draft gets all three defaults").toEqual({
      title: "untitled",
      salary: 0,
      remote: false,
    });
    expect(
      complete({ title: "Engineer", salary: 100, remote: true }),
      "a full draft is unchanged",
    ).toEqual({ title: "Engineer", salary: 100, remote: true });
    expect(
      complete({ salary: 0, remote: false }),
      "an explicit 0 and an explicit false are supplied values and must survive - " +
        "`||` would replace both, `??` would not (README ex1)",
    ).toEqual({ title: "untitled", salary: 0, remote: false });
    expect(
      complete({ title: "" }),
      "and so must an explicitly empty title",
    ).toEqual({ title: "", salary: 0, remote: false });
  });

  test("ex2 - isLive() splits the status union in two", () => {
    expect(isLive("draft"), "a draft is still live").toBe(true);
    expect(isLive("open"), "so is an open posting").toBe(true);
    expect(isLive("paused"), "and a paused one").toBe(true);
    expect(isLive("closed"), "a closed posting is not").toBe(false);
    expect(isLive("archived"), "and neither is an archived one").toBe(false);
    expect(
      liveOnly(["draft", "closed", "open", "archived", "paused"]),
      "the live statuses, in input order",
    ).toEqual(["draft", "open", "paused"]);
    expect(liveOnly([]), "nothing in, nothing out").toEqual([]);
    expect(liveOnly(["closed"]), "and nothing live means an empty array").toEqual([]);
  });

  test("ex3 - firstDefined() skips only the nullish values", () => {
    expect(
      firstDefined([null, undefined, "a", "b"]),
      "the first value that is neither null nor undefined",
    ).toBe("a");
    expect(
      firstDefined([0, 1]),
      "zero is defined - a truthiness check would skip it (README ex3)",
    ).toBe(0);
    expect(firstDefined([""]), "and so is the empty string").toBe("");
    expect(firstDefined([null, undefined]), "nothing defined means undefined").toBeUndefined();
    expect(firstDefined([]), "an empty list is the same answer").toBeUndefined();
  });

  test("ex4 - callWith() applies a saved argument list", () => {
    expect(callWith(["p1", true]), "the tuple is spread into the function").toEqual({
      id: "p1",
      title: "posting p1",
      draft: true,
    });
    expect(callWith(["p2", false]), "and again with different arguments").toEqual({
      id: "p2",
      title: "posting p2",
      draft: false,
    });
  });

  test("ex5 - diffPatch() reports only what changed", () => {
    expect(
      diffPatch(posting, { ...posting, title: "Senior Engineer" }),
      "one member changed, so one member in the patch",
    ).toEqual({ title: "Senior Engineer" });
    expect(diffPatch(posting, posting), "nothing changed means an empty patch").toEqual({});
    expect(
      diffPatch(posting, { ...posting, salary: 120, remote: false }),
      "two changes, two members - and false is a change, not an absence",
    ).toEqual({ salary: 120, remote: false });
    expect(
      "title" in diffPatch(posting, { ...posting, salary: 120 }),
      "an unchanged member is absent from the patch, not present as undefined",
    ).toBe(false);
  });

  test("ex6 - loadAll() resolves to the unwrapped shape", async () => {
    await expect(loadAll(["a", "b"]), "one posting per id, in order").resolves.toEqual([
      { id: "a", title: "posting a" },
      { id: "b", title: "posting b" },
    ]);
    await expect(loadAll([]), "no ids means an empty array").resolves.toEqual([]);
  });

  test("ex7 - makeSearch() builds the class from a saved argument list", () => {
    const search = makeSearch(["dev", 2]);
    expect(search.term, "the instance carries the term it was built with").toBe("dev");
    expect(search.limit, "and the limit").toBe(2);
    expect(
      search.run(["Dev A", "ops role", "developer B", "DEV C"]),
      "case-insensitive match, capped at the limit",
    ).toEqual(["Dev A", "developer B"]);
    expect(
      makeSearch(["ops", 5]).run(["Dev A", "ops role"]),
      "a shorter result than the limit is not padded",
    ).toEqual(["ops role"]);
    expect(makeSearch(["nothing", 5]).run(["Dev A"]), "no matches is an empty array").toEqual([]);
  });

  test("ex8 - publish() drops private members and dead postings", () => {
    const postings = [
      {
        id: "p1",
        title: "Engineer",
        status: "open" as const,
        internalNotes: "hire fast",
        recruiterEmail: "r@example.com",
      },
      {
        id: "p2",
        title: "Old role",
        status: "archived" as const,
        internalNotes: "gone",
        recruiterEmail: "r@example.com",
      },
      {
        id: "p3",
        title: "Designer",
        status: "draft" as const,
        internalNotes: "maybe",
        recruiterEmail: "r@example.com",
      },
    ];
    const published = publish(postings);
    expect(published, "archived postings are dropped, the rest keep their order").toEqual([
      { id: "p1", title: "Engineer", status: "open" },
      { id: "p3", title: "Designer", status: "draft" },
    ]);
    expect(
      "internalNotes" in published[0],
      "removed means absent - not undefined, not empty: absent",
    ).toBe(false);
    expect("recruiterEmail" in published[0], "and the same for the recruiter email").toBe(false);
    expect(postings[0].internalNotes, "the source postings are never modified").toBe("hire fast");
    expect(publish([]), "no postings means nothing published").toEqual([]);
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
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
```

An exercise is green only when both gates agree about it.
