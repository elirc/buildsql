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
