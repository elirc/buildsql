// Gate for typescript/d02_functions_signatures. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { shelfLabel } from "./ex1/solution";
import { joinPath } from "./ex2/solution";
import { countMatching } from "./ex3/solution";
import { formatAll } from "./ex4/solution";
import { normaliseTag } from "./ex5/solution";
import { makeCounter } from "./ex6/solution";
import { buildQuery } from "./ex7/solution";
import { runMiddleware } from "./ex8/solution";

describe("d02_functions_signatures", () => {
  test("ex1 - shelfLabel() treats the author as optional", () => {
    expect(
      shelfLabel("Dune"),
      "one argument means no author, so the label is just the title",
    ).toBe("Dune");
    expect(shelfLabel("Dune", "Herbert"), "two arguments join with a spaced dash").toBe(
      "Dune - Herbert",
    );
    expect(
      shelfLabel("Dune", ""),
      "an empty author is no author - a truthiness check covers both cases",
    ).toBe("Dune");
    expect(
      shelfLabel("Dune", "   "),
      "and so is an author made only of spaces (README ex1)",
    ).toBe("Dune");
  });

  test("ex2 - joinPath() is variadic and drops empty segments", () => {
    expect(joinPath("books", "sci-fi", "dune"), "segments joined with a slash").toBe(
      "books/sci-fi/dune",
    );
    expect(joinPath("a"), "one segment is that segment").toBe("a");
    expect(
      joinPath(),
      "no arguments at all is a legal call for a rest parameter, and the answer " +
        "is the empty string",
    ).toBe("");
    expect(
      joinPath("books", "", "dune"),
      "an empty segment must not produce a double slash",
    ).toBe("books/dune");
    expect(
      joinPath("/books/", "/dune/"),
      "leading and trailing slashes are trimmed off each segment before joining",
    ).toBe("books/dune");
    expect(
      joinPath(...["books", "sci-fi"]),
      "spreading an array into a rest parameter is the same call",
    ).toBe("books/sci-fi");
    expect(joinPath("/", "/"), "segments that are only slashes vanish entirely").toBe("");
  });

  test("ex3 - countMatching() calls its predicate once per value", () => {
    expect(
      countMatching(["a", "bb", "ccc"], (value) => value.length > 1),
      "two of the three values are longer than one character",
    ).toBe(2);
    expect(countMatching([], () => true), "no values means no matches").toBe(0);
    expect(
      countMatching(["a", "b"], () => false),
      "a predicate that never matches counts nothing, it does not return undefined",
    ).toBe(0);

    const seen: string[] = [];
    countMatching(["x", "y", "z"], (value) => {
      seen.push(value);
      return true;
    });
    expect(
      seen,
      "the predicate sees every value, in input order, exactly once - reread README ex3",
    ).toEqual(["x", "y", "z"]);
  });

  test("ex4 - formatAll() has a default formatter", () => {
    expect(
      formatAll([1, 2.5]),
      "the default formatter is two decimal places: 1.00 and 2.50",
    ).toEqual(["1.00", "2.50"]);
    expect(
      formatAll([1, 2], (value) => `#${value}`),
      "a supplied formatter replaces the default entirely",
    ).toEqual(["#1", "#2"]);
    expect(formatAll([]), "an empty list formats to an empty list").toEqual([]);
    expect(
      formatAll([0]),
      "zero is a value, not a missing one - the default still applies to it",
    ).toEqual(["0.00"]);
  });

  test("ex5 - normaliseTag() overloads on scalar and array", () => {
    expect(
      normaliseTag("  Science Fiction "),
      "trimmed, lower-cased, inner runs of whitespace become one dash",
    ).toBe("science-fiction");
    expect(normaliseTag("Dune"), "an already-clean tag comes back lower-cased").toBe("dune");
    expect(
      normaliseTag(["A B", " C ", "D   E"]),
      "an array in, an array out - same order, each element normalised",
    ).toEqual(["a-b", "c", "d-e"]);
    expect(normaliseTag([]), "an empty array normalises to an empty array").toEqual([]);
    expect(
      normaliseTag("   "),
      "a tag of nothing but whitespace normalises to the empty string",
    ).toBe("");
  });

  test("ex6 - makeCounter() closes over its own state", () => {
    const counter = makeCounter();
    expect(counter.next(), "the default start is 0, and next() hands it out first").toBe(0);
    expect(counter.next(), "the second call hands out 1").toBe(1);
    expect(
      counter.peek(),
      "peek() shows what next() would return without consuming it",
    ).toBe(2);
    expect(counter.peek(), "so calling peek() twice shows the same number twice").toBe(2);
    expect(counter.next(), "and next() still returns that number").toBe(2);

    counter.reset();
    expect(counter.next(), "reset() goes back to the start this counter was made with").toBe(0);

    const fromTen = makeCounter(10);
    expect(fromTen.next(), "a counter made at 10 starts at 10").toBe(10);
    expect(
      counter.next(),
      "two counters do not share state - each call to makeCounter() makes a new closure",
    ).toBe(1);
  });

  test("ex7 - buildQuery() appends a sorted, encoded query string", () => {
    expect(buildQuery("/books"), "no params at all means the base, unchanged").toBe("/books");
    expect(buildQuery("/books", {}), "an empty params object is the same case").toBe("/books");
    expect(
      buildQuery("/books", { year: 1965, author: "Herbert" }),
      "keys are sorted alphabetically so the same query always renders the same way",
    ).toBe("/books?author=Herbert&year=1965");
    expect(
      buildQuery("/books", { q: "dune messiah" }),
      "values are URL-encoded, so the space becomes %20",
    ).toBe("/books?q=dune%20messiah");
    expect(
      buildQuery("/books", { draft: false }),
      "false is a value, not a missing one - it must appear in the query",
    ).toBe("/books?draft=false");
    expect(
      buildQuery("/books", { "a key": "a value" }),
      "the key is encoded too, not just the value",
    ).toBe("/books?a%20key=a%20value");
  });

  test("ex8 - runMiddleware() threads a value through an onion", () => {
    const upper = (input: string, next: (value: string) => string) => next(input.toUpperCase());
    const exclaim = (input: string, next: (value: string) => string) => `${next(input)}!`;
    const block = (_input: string, _next: (value: string) => string) => "blocked";

    expect(
      runMiddleware("a", []),
      "no middleware at all returns the input untouched",
    ).toBe("a");
    expect(
      runMiddleware("a", [upper]),
      "one middleware that upper-cases on the way in",
    ).toBe("A");
    expect(
      runMiddleware("a", [upper, exclaim]),
      "the FIRST middleware is the outermost: it upper-cases on the way in, the " +
        "second appends on the way out (README ex8)",
    ).toBe("A!");
    expect(
      runMiddleware("a", [exclaim, upper]),
      "swap them and the exclamation mark is added after the upper-casing, outside it",
    ).toBe("A!");
    expect(
      runMiddleware("a", [block, upper]),
      "a middleware that never calls next() short-circuits the rest of the chain",
    ).toBe("blocked");

    const order: string[] = [];
    runMiddleware("x", [
      (input, next) => {
        order.push("in:1");
        const out = next(input);
        order.push("out:1");
        return out;
      },
      (input, next) => {
        order.push("in:2");
        const out = next(input);
        order.push("out:2");
        return out;
      },
    ]);
    expect(
      order,
      "the onion order is in:1, in:2, out:2, out:1 - not two independent calls",
    ).toEqual(["in:1", "in:2", "out:2", "out:1"]);
  });
});
