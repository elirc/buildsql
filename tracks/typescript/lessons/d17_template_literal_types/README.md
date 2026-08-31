# d17 - Template literal types (drill set)

Eight problems on the string type that is also a template: building names,
matching prefixes, cutting strings into tuples and putting them back, and
finally reading a route's parameters out of its path. They drill lesson
**09_mapped_conditional**, whose key-remapping section introduced the syntax -
but this set treats it as a subject in its own right, so `reading.md` starts
from the construct rather than assuming it.

Every exercise is **type-level only** - each stub compiles and is wrong, and
the whole gate is `gate.test-d.ts`. `// @ts-expect-error` only suppresses the
line immediately after it, so the expressions it guards are kept to one line.

## ex1 - one name from two

`Prefixed<P, K>` joins a namespace and an event name with a colon.

- `Prefixed<"user", "created">` -> `"user:created"`
- `Prefixed<"user", "created" | "deleted">` -> `"user:created" | "user:deleted"`
- `Prefixed<"user" | "team", "created">` -> `"user:created" | "team:created"`

Both parameters are constrained to `string`. A union in either position
produces every combination - that happens on its own, with nothing in your
definition mentioning unions.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex1
```

## ex2 - capitalise as you prefix

`GetterName<K>` turns a property name into the name of its getter.

- `GetterName<"title">` -> `"getTitle"`, `GetterName<"URL">` -> `"getURL"`
- `GetterName<"id" | "name">` -> `"getId" | "getName"`
- `GetterName<"">` -> `"get"`

TypeScript ships four intrinsic string types - `Uppercase`, `Lowercase`,
`Capitalize`, `Uncapitalize` - and one of them does exactly this.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex2
```

## ex3 - does it start with that

`StartsWith<S, P>` is `true` when the string type `S` begins with the string
type `P`.

- `StartsWith<"/api/users", "/api">` -> `true`, `StartsWith<"/api", "/api">` -> `true`
- `StartsWith<"users", "/api">` -> `false`, `StartsWith<"abc", "">` -> `true`
- `StartsWith<"/api" | "users", "/">` -> `boolean` - it distributes, and the
  two members disagree

The trick is that `string` is usable *inside* a template as a wildcard.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex3
```

## ex4 - cut the prefix off

`StripPrefix<S, P>` removes `P` from the front of `S`, and leaves `S` alone if
it does not start with `P`.

- `StripPrefix<"/api/users", "/api">` -> `"/users"`
- `StripPrefix<"onClick", "on">` -> `"Click"`
- `StripPrefix<"users", "/api">` -> `"users"` - no prefix, no change
- `StripPrefix<"/api", "/api">` -> `""`

Same pattern as ex3, but this time you have to keep the part you matched
around.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex4
```

## ex5 - cut a string into a tuple

`Split<S, D>` splits the string type `S` on the delimiter `D` and returns the
parts as a tuple, exactly like `String.prototype.split` does at runtime.

- `Split<"a,b,c", ",">` -> `["a", "b", "c"]`
- `Split<"a", ",">` -> `["a"]`, `Split<"", ",">` -> `[""]`
- `Split<"a,,b", ",">` -> `["a", "", "b"]` - an empty part is still a part
- `Split<"users/42/posts", "/">` -> `["users", "42", "posts"]`

This one recurses, and the base case is "no delimiter left".

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex5
```

## ex6 - put a tuple back together

`Join<T, D>` is ex5 backwards: a tuple of string literals and a delimiter
become one string literal.

- `Join<["a", "b", "c"], ",">` -> `"a,b,c"`
- `Join<["a"], ",">` -> `"a"` - no trailing delimiter
- `Join<[], ",">` -> `""`
- `Join<readonly ["a", "b"], "-">` -> `"a-b"` - readonly tuples too

`T` is constrained to `readonly string[]`.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex6
```

## ex7 - snake_case to camelCase

`SnakeToCamel<S>` renames a database column into a JavaScript property.

- `SnakeToCamel<"created_at">` -> `"createdAt"`
- `SnakeToCamel<"user_first_name">` -> `"userFirstName"`
- `SnakeToCamel<"id">` -> `"id"` - nothing to do
- `SnakeToCamel<"created_at" | "updated_at">` -> `"createdAt" | "updatedAt"`

Recursion plus one intrinsic. The underscore is consumed, not replaced.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex7
```

## ex8 - read the params out of a path

`RouteParams<S>` takes an Express-style path and produces an object type whose
keys are its parameters, all typed `string`.

- `RouteParams<"/users/:id">` -> `{ id: string }`
- `RouteParams<"/users/:userId/posts/:postId">` -> `{ userId: string; postId: string }`
- `RouteParams<"/health">` -> an object with no keys

Two shapes to match: a parameter with a path segment after it (`:userId/...`)
and a parameter at the very end (`:postId`). Collect the names first, then map
over the union you collected - a mapped type over a union of string literals is
the last step, not the first.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d17_template_literal_types ex8
```

## The gate

This is the entire gate, `gate.test-d.ts`:

```ts
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
```
