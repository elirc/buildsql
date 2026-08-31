// Runtime gate for typescript/d22_declaration_files. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { parseTag } from "./ex1/solution";
import { box } from "./ex2/solution";
import { readBuild, registerBuild } from "./ex3/solution";
import { Api, makeRow } from "./ex4/solution";
import { describeContext } from "./ex5/solution";
import { Level } from "./ex6/solution";
import { dispatch } from "./ex7/solution";
import { Money } from "./ex8/solution";

describe("d22_declaration_files", () => {
  test("ex1 - parseTag() is a function with members bolted on", () => {
    expect(parseTag("dojo:ts"), "the part before the colon is the scope").toEqual({
      scope: "dojo",
      name: "ts",
    });
    expect(parseTag("plain"), "with no colon the whole string is the name").toEqual({
      scope: "",
      name: "plain",
    });
    expect(parseTag.VERSION, "the namespace member rides along on the function object").toBe("1.0");
    expect(parseTag.isValid("a:b"), "and so does the helper").toBe(true);
    expect(parseTag.isValid("plain"), "which says no to a tag with no scope").toBe(false);
  });

  test("ex2 - box() returns a different shape per overload", () => {
    expect(box("hello"), "a string is boxed as text").toEqual({ kind: "text", value: "hello" });
    expect(box(3), "a number is boxed as a count").toEqual({ kind: "count", value: 3 });
    expect(box(""), "the empty string is still a string - the branch is on the type, " +
      "not on the truthiness (README ex2)").toEqual({ kind: "text", value: "" });
    expect(box(0), "and zero is still a number").toEqual({ kind: "count", value: 0 });
  });

  test("ex3 - the build registry lives on globalThis", () => {
    expect(readBuild("nothing"), "an unregistered name reads back undefined").toBe(undefined);
    registerBuild("edge", 7);
    expect(readBuild("edge"), "what went in comes back out").toBe(7);
    registerBuild("edge", 8);
    expect(readBuild("edge"), "a second registration overwrites").toBe(8);
    registerBuild("api", 1);
    expect(readBuild("edge"), "and a second name does not disturb the first").toBe(8);
  });

  test("ex4 - the Api namespace carries types and a value together", () => {
    expect(makeRow("r1", 12), "the row is assembled from the two arguments").toEqual({
      id: "r1",
      amount: 12,
    });
    expect(Api.VERSION, "and the namespace also holds a runtime value").toBe(2);
  });

  test("ex5 - describeContext() sees both halves of the merged interface", () => {
    expect(
      describeContext({ requestId: "req-1", locale: "en-GB" }),
      "the request id and the locale, joined by an at sign",
    ).toBe("req-1@en-GB");
    expect(
      describeContext({ requestId: "req-2", locale: "fr" }),
      "and the same for any other pair",
    ).toBe("req-2@fr");
  });

  test("ex6 - Level is an enum and a namespace at once", () => {
    expect(Level.Info, "the enum member is still a number").toBe(20);
    expect(Level.isAtLeast(Level.Error, Level.Info), "40 is at least 20").toBe(true);
    expect(Level.isAtLeast(Level.Debug, Level.Info), "and 10 is not").toBe(false);
    expect(Level.isAtLeast(Level.Info, Level.Info), "the comparison is inclusive").toBe(true);
    expect(Level.parse("Error"), "a known name parses to its value").toBe(40);
    expect(Level.parse("Fatal"), "an unknown name is undefined").toBe(undefined);
    expect(Level.parse("20"), "and so is the reverse-mapped numeric key - a numeric enum " +
      "has entries in both directions and only one of them is a level (README ex6)").toBe(
      undefined,
    );
  });

  test("ex7 - dispatch() routes by the registered command name", () => {
    expect(dispatch("build", { target: "web" }), "the build handler reads target").toBe(
      "build:web",
    );
    expect(dispatch("test", { pattern: "*.ts" }), "and the test handler reads pattern").toBe(
      "test:*.ts",
    );
  });

  test("ex8 - Money is a class and a namespace with the same name", () => {
    const three = new Money(3, "USD");
    expect(three.plus(new Money(2, "USD")).amount, "two amounts add up").toBe(5);
    expect(three.plus(2).amount, "and the number overload adds a bare amount").toBe(5);
    expect(three.plus(2).currency, "keeping the currency of the receiver").toBe("USD");
    expect(Money.zero("EUR").amount, "the namespace factory builds an empty amount").toBe(0);
    expect(Money.zero("EUR").currency, "in the currency it was asked for").toBe("EUR");
    expect(Money.SYMBOLS.USD, "and the namespace holds the symbol table").toBe("$");
    expect(three.toString(), "which toString() uses, with two decimal places").toBe("$3.00");
    expect(() => three.plus(new Money(1, "EUR")), "adding two currencies is a mistake the " +
      "class has to refuse at runtime, because the type says both are Money").toThrow(/currency/);
  });
});
