// Type gate for typescript/d17_template_literal_types. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Prefixed } from "./ex1/solution";
import type { GetterName } from "./ex2/solution";
import type { StartsWith } from "./ex3/solution";
import type { StripPrefix } from "./ex4/solution";
import type { Split } from "./ex5/solution";
import type { Join } from "./ex6/solution";
import type { SnakeToCamel } from "./ex7/solution";
import type { RouteParams } from "./ex8/solution";

describe("d17_template_literal_types", () => {
  test("ex1 - Prefixed<P, K> builds one name from two", () => {
    expectTypeOf<Prefixed<"user", "created">>().toEqualTypeOf<"user:created">();
    expectTypeOf<Prefixed<"user", "created" | "deleted">>().toEqualTypeOf<
      "user:created" | "user:deleted"
    >();
    expectTypeOf<Prefixed<"user" | "team", "created">>().toEqualTypeOf<
      "user:created" | "team:created"
    >();
    const topic: Prefixed<"user", "created"> = "user:created";
    expectTypeOf(topic).toEqualTypeOf<"user:created">();
    // @ts-expect-error - the separator is part of the type, so this literal does not fit.
    const wrong: Prefixed<"user", "created"> = "usercreated";
  });

  test("ex2 - GetterName<K> capitalises as it prefixes", () => {
    expectTypeOf<GetterName<"title">>().toEqualTypeOf<"getTitle">();
    expectTypeOf<GetterName<"id" | "name">>().toEqualTypeOf<"getId" | "getName">();
    expectTypeOf<GetterName<"URL">>().toEqualTypeOf<"getURL">();
    expectTypeOf<GetterName<"">>().toEqualTypeOf<"get">();
  });

  test("ex3 - StartsWith<S, P> matches a prefix", () => {
    expectTypeOf<StartsWith<"/api/users", "/api">>().toEqualTypeOf<true>();
    expectTypeOf<StartsWith<"/api", "/api">>().toEqualTypeOf<true>();
    expectTypeOf<StartsWith<"users", "/api">>().toEqualTypeOf<false>();
    expectTypeOf<StartsWith<"abc", "">>().toEqualTypeOf<true>();
    expectTypeOf<StartsWith<"/api" | "users", "/">>().toEqualTypeOf<boolean>();
  });

  test("ex4 - StripPrefix<S, P> keeps whatever came after", () => {
    expectTypeOf<StripPrefix<"/api/users", "/api">>().toEqualTypeOf<"/users">();
    expectTypeOf<StripPrefix<"onClick", "on">>().toEqualTypeOf<"Click">();
    expectTypeOf<StripPrefix<"users", "/api">>().toEqualTypeOf<"users">();
    expectTypeOf<StripPrefix<"/api", "/api">>().toEqualTypeOf<"">();
  });

  test("ex5 - Split<S, D> cuts a string into a tuple", () => {
    expectTypeOf<Split<"a,b,c", ",">>().toEqualTypeOf<["a", "b", "c"]>();
    expectTypeOf<Split<"a", ",">>().toEqualTypeOf<["a"]>();
    expectTypeOf<Split<"", ",">>().toEqualTypeOf<[""]>();
    expectTypeOf<Split<"a,,b", ",">>().toEqualTypeOf<["a", "", "b"]>();
    expectTypeOf<Split<"users/42/posts", "/">>().toEqualTypeOf<["users", "42", "posts"]>();
  });

  test("ex6 - Join<T, D> puts a tuple back together", () => {
    expectTypeOf<Join<["a", "b", "c"], ",">>().toEqualTypeOf<"a,b,c">();
    expectTypeOf<Join<["a"], ",">>().toEqualTypeOf<"a">();
    expectTypeOf<Join<[], ",">>().toEqualTypeOf<"">();
    expectTypeOf<Join<["users", "42"], "/">>().toEqualTypeOf<"users/42">();
    expectTypeOf<Join<readonly ["a", "b"], "-">>().toEqualTypeOf<"a-b">();
  });

  test("ex7 - SnakeToCamel<S> renames a column", () => {
    expectTypeOf<SnakeToCamel<"created_at">>().toEqualTypeOf<"createdAt">();
    expectTypeOf<SnakeToCamel<"user_first_name">>().toEqualTypeOf<"userFirstName">();
    expectTypeOf<SnakeToCamel<"id">>().toEqualTypeOf<"id">();
    expectTypeOf<SnakeToCamel<"created_at" | "updated_at">>().toEqualTypeOf<
      "createdAt" | "updatedAt"
    >();
  });

  test("ex8 - RouteParams<S> reads the params out of a path", () => {
    expectTypeOf<RouteParams<"/users/:id">>().toEqualTypeOf<{ id: string }>();
    expectTypeOf<RouteParams<"/users/:userId/posts/:postId">>().toEqualTypeOf<{
      userId: string;
      postId: string;
    }>();
    expectTypeOf<keyof RouteParams<"/health">>().toEqualTypeOf<never>();
    const params: RouteParams<"/users/:userId/posts/:postId"> = { userId: "1", postId: "2" };
    expectTypeOf(params.postId).toEqualTypeOf<string>();
    // @ts-expect-error - slug is not a parameter of this path.
    params.slug;
  });
});
