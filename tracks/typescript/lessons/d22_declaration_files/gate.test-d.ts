// Type gate for typescript/d22_declaration_files. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Tag } from "./ex1/solution";
import { parseTag } from "./ex1/solution";
import { box } from "./ex2/solution";
import { readBuild } from "./ex3/solution";
import { Api } from "./ex4/solution";
import type { RequestContext } from "./ex5/solution";
import { Level } from "./ex6/solution";
import type { CommandName } from "./ex7/solution";
import { dispatch } from "./ex7/solution";
import { Money } from "./ex8/solution";

describe("d22_declaration_files", () => {
  test("ex1 - parseTag() is callable and has members", () => {
    expectTypeOf(parseTag("a:b")).toEqualTypeOf<Tag>();
    expectTypeOf(parseTag.VERSION).toEqualTypeOf<string>();
    expectTypeOf(parseTag.isValid("a:b")).toEqualTypeOf<boolean>();
  });

  test("ex2 - each overload of box() has its own return type", () => {
    expectTypeOf(box("a")).toEqualTypeOf<{ kind: "text"; value: string }>();
    expectTypeOf(box(1)).toEqualTypeOf<{ kind: "count"; value: number }>();
    // @ts-expect-error - only strings and numbers can be boxed.
    box(true);
  });

  test("ex3 - the global declaration is visible to every module", () => {
    expectTypeOf(globalThis.__d22BuildRegistry).toEqualTypeOf<
      Record<string, number> | undefined
    >();
    expectTypeOf(readBuild("edge")).toEqualTypeOf<number | undefined>();
  });

  test("ex4 - Api holds an interface, a type alias and a value", () => {
    expectTypeOf<Api.Row>().toEqualTypeOf<{ id: string; amount: number }>();
    expectTypeOf<Api.Id>().toEqualTypeOf<string>();
    expectTypeOf(Api.VERSION).toEqualTypeOf<number>();
  });

  test("ex5 - RequestContext is the union of its declarations", () => {
    expectTypeOf<RequestContext>().toEqualTypeOf<{ requestId: string; locale: string }>();
    const context: RequestContext = { requestId: "r", locale: "en" };
    expectTypeOf(context.locale).toEqualTypeOf<string>();
  });

  test("ex6 - Level is usable as a type and as a namespace", () => {
    expectTypeOf(Level.isAtLeast(Level.Error, Level.Info)).toEqualTypeOf<boolean>();
    expectTypeOf(Level.parse("Info")).toEqualTypeOf<Level | undefined>();
    expectTypeOf<Level>().toEqualTypeOf<Level.Debug | Level.Info | Level.Error>();
  });

  test("ex7 - the registry decides which names and payloads exist", () => {
    expectTypeOf<CommandName>().toEqualTypeOf<"build" | "test">();
    expectTypeOf(dispatch("build", { target: "web" })).toEqualTypeOf<string>();
    // @ts-expect-error - the build command does not take a pattern.
    dispatch("build", { pattern: "x" });
  });

  test("ex8 - Money names a class, a type and a namespace", () => {
    expectTypeOf<Money.Currency>().toEqualTypeOf<"USD" | "EUR">();
    expectTypeOf(Money.zero("USD")).toEqualTypeOf<Money>();
    const three = new Money(3, "USD");
    expectTypeOf(three.plus(2)).toEqualTypeOf<Money>();
    expectTypeOf(three.plus(new Money(1, "USD"))).toEqualTypeOf<Money>();
    // @ts-expect-error - GBP is not one of the two currencies.
    Money.zero("GBP");
  });
});
