# d23 - Real-world API shapes (drill set)

Eight problems from the boundary layer: result types, an HTTP wrapper that
tells a bad status from a bad payload, query strings, DTO mapping, a cache with
a clock, a signature whose arity depends on the method, a route matcher and a
small typed client. They draw on the whole track - narrowing, generics, mapped
and template literal types, `satisfies` and async - because that is what this
layer actually needs.

Both gates run, and every exercise is self-contained: each file defines the
types it needs, even where a neighbour defines something similar. Nothing here
touches the network - every collaborator (the fetcher, the clock, the sender) is
injected, which is the only way this code is testable at all.

## ex1 - a result you have to look inside

`Result<T, E>` is the discriminated union
`{ ok: true; value: T } | { ok: false; error: E }`, and three functions go with
it:

- `ok(value)` -> `Result<T, never>`
- `err(error)` -> `Result<never, E>`
- `unwrapOr(result, fallback)` -> the value if `ok`, the fallback otherwise

- `unwrapOr(ok(0), 99)` -> `0`, and `unwrapOr(ok(undefined), 5)` -> `undefined`

Those last two are the point: the decision is made by the discriminant, never by
the truthiness of the value.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex1
```

## ex2 - bad status against bad payload

`getJson(fetcher, url, guard)` calls `fetcher(url)`, which resolves with
`{ status: number; body: unknown }`, and resolves with

```ts
{ ok: true; data: T } | { ok: false; reason: "http" | "shape"; status: number }
```

- a status in the 2xx range **and** a body the guard accepts -> `{ ok: true, data }`
- a status outside 2xx -> `{ ok: false, reason: "http", status }`
- a 2xx whose body fails the guard -> `{ ok: false, reason: "shape", status }`

201 is a success: the check is a range, not an equality. `T` comes from the
guard, so the caller never writes it.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex2
```

## ex3 - build the query string

`buildQuery(params)` turns
`Record<string, string | number | boolean | undefined>` into a query string.

- keys are sorted alphabetically, joined with `&`, and there is **no** leading
  `?`
- an `undefined` value drops the key entirely
- keys and values are both percent-encoded
- `false` and `0` are values, not absences

Examples:

- `buildQuery({ b: 1, a: "x y", d: true })` -> `"a=x%20y&b=1&d=true"`
- `buildQuery({ a: 1, c: undefined })` -> `"a=1"`
- `buildQuery({})` -> `""`
- `buildQuery({ "a b": "c&d" })` -> `"a%20b=c%26d"`

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex3
```

## ex4 - dto in, domain model out

Three exports.

`UserDto` is the wire shape: `{ user_id: string; display_name: string; created_at: string }`.

`CamelKeys<T>` is a mapped type that renames every `snake_case` key to
`camelCase`, leaving the value types alone:

- `CamelKeys<UserDto>` -> `{ userId: string; displayName: string; createdAt: string }`
- `CamelKeys<{ a_b_c: number }>` -> `{ aBC: number }`

`User` is the domain shape - the camel-cased keys, except that `createdAt` is a
`Date`. `toUser(dto)` builds one.

- `toUser({ user_id: "u1", display_name: "Ada", created_at: "2024-03-01T10:00:00.000Z" })`
  -> a `User` whose `createdAt` is a real `Date`

`User` and `CamelKeys` are given in the stub; the renaming type and the mapper
are yours.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex4
```

## ex5 - a cache that can tell the time

`createTtlCache<T>(ttlMs, now)` returns
`{ set(key, value): void; get(key): T | undefined; size(): number }`.

`now` is an injected clock returning milliseconds - there is no `Date.now()`
anywhere in the implementation.

- an entry is live while `now() - writtenAt < ttlMs`
- at exactly `ttlMs` it has expired: the comparison is inclusive
- reading an expired entry returns `undefined` **and drops it**, so `size()`
  falls
- the age is measured from the write, and a rewrite restarts it

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex5
```

## ex6 - the method decides the arity

`describeRequest(method, url, ...rest)` is generic over
`M extends "GET" | "POST"`, and its **rest parameter type is a conditional**:
no body for a `GET`, exactly one for a `POST`.

- `describeRequest("GET", "/users")` -> `"GET /users"`
- `describeRequest("POST", "/users", "{}")` -> `"POST /users {}"`
- `describeRequest("GET", "/users", "{}")` is a compile error
- `describeRequest("POST", "/users")` is a compile error

An empty body string is still a body: `describeRequest("POST", "/x", "")` is
`"POST /x "`.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex6
```

## ex7 - a route that types its own params

`defineRoute(path, handler)` returns `{ path; run(url) }`.

The handler's parameter type is derived from the path: every `:name` segment
becomes a `string` member.

- `defineRoute("/users/:userId/posts/:postId", handler)` gives the handler
  `{ userId: string; postId: string }`
- `defineRoute("/health", handler)` gives it an object with no members
- `route.path` keeps the literal path type it was built with

`run(url)` returns the handler's result, or `undefined` when the url does not
match:

- `"/users/7/posts/9"` -> the handler runs with `{ userId: "7", postId: "9" }`
- `"/users/7/posts"` -> `undefined` (wrong number of segments)
- `"/teams/7/posts/9"` -> `undefined` (a literal segment must match exactly)

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex7
```

## ex8 - a client built from an endpoint table

`ENDPOINTS` is the single source of truth:

```
getUser:     { method: "GET",  path: "/users/:id" }
createOrder: { method: "POST", path: "/orders" }
getPost:     { method: "GET",  path: "/users/:userId/posts/:postId" }
```

frozen and checked against `Record<string, { method: "GET" | "POST"; path: string }>`.

`createClient(send)` returns `{ call(name, params) }`:

- `name` is constrained to the endpoint names, so `call("deleteUser", {})` is a
  compile error
- `params` is derived from that endpoint's path, so `call("getUser", {})` is a
  compile error and `call("createOrder", {})` is fine
- `call` substitutes the params into the path and calls
  `send(method, url)`, resolving with whatever `send` resolved with

`call("getPost", { userId: "u1", postId: "p9" })` sends
`("GET", "/users/u1/posts/p9")`.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d23_realworld_apis ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d23_realworld_apis. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { err, ok, unwrapOr } from "./ex1/solution";
import { getJson } from "./ex2/solution";
import { buildQuery } from "./ex3/solution";
import { toUser } from "./ex4/solution";
import { createTtlCache } from "./ex5/solution";
import { describeRequest } from "./ex6/solution";
import { defineRoute } from "./ex7/solution";
import { createClient } from "./ex8/solution";

const isUser = (value: unknown): value is { id: string } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { id?: unknown }).id === "string";

describe("d23_realworld_apis", () => {
  test("ex1 - ok, err and unwrapOr agree about the discriminant", () => {
    expect(ok(1), "a success carries its value under ok true").toEqual({ ok: true, value: 1 });
    expect(err("bad"), "a failure carries its error under ok false").toEqual({
      ok: false,
      error: "bad",
    });
    expect(unwrapOr(ok(1), 0), "a success unwraps to its value").toBe(1);
    expect(unwrapOr(err("bad"), 0), "a failure unwraps to the fallback").toBe(0);
    expect(unwrapOr(ok(0), 99), "a value of 0 is a value - do not test truthiness, test " +
      "the discriminant (README ex1)").toBe(0);
    expect(unwrapOr(ok(undefined), 5), "and neither is undefined a failure").toBe(undefined);
  });

  test("ex2 - getJson() separates a bad status from a bad shape", async () => {
    const good = await getJson(async () => ({ status: 200, body: { id: "u1" } }), "/u", isUser);
    expect(good, "a 200 whose body passes the guard is a success").toEqual({
      ok: true,
      data: { id: "u1" },
    });
    const missing = await getJson(async () => ({ status: 404, body: null }), "/u", isUser);
    expect(missing, "a non-2xx status is an http failure and the status is kept").toEqual({
      ok: false,
      reason: "http",
      status: 404,
    });
    const wrong = await getJson(async () => ({ status: 200, body: { id: 7 } }), "/u", isUser);
    expect(wrong, "a 200 whose body fails the guard is a shape failure, not an http one - " +
      "the two mean different things to the caller (README ex2)").toEqual({
      ok: false,
      reason: "shape",
      status: 200,
    });
    const created = await getJson(async () => ({ status: 201, body: { id: "u2" } }), "/u", isUser);
    expect(created.ok, "201 is a success too - the check is a range, not an equality").toBe(true);
    let seen = "";
    await getJson(
      async (url) => {
        seen = url;
        return { status: 200, body: { id: "u3" } };
      },
      "/users/3",
      isUser,
    );
    expect(seen, "the url is passed through to the fetcher unchanged").toBe("/users/3");
  });

  test("ex3 - buildQuery() sorts, skips and encodes", () => {
    expect(
      buildQuery({ b: 1, a: "x y", d: true }),
      "keys in alphabetical order, joined with ampersands, no leading question mark",
    ).toBe("a=x%20y&b=1&d=true");
    expect(buildQuery({ a: 1, c: undefined }), "an undefined value drops the whole key").toBe(
      "a=1",
    );
    expect(buildQuery({}), "no parameters is the empty string").toBe("");
    expect(buildQuery({ c: undefined }), "and so is a bag of nothing but undefined").toBe("");
    expect(buildQuery({ "a b": "c&d" }), "keys are encoded as well as values").toBe(
      "a%20b=c%26d",
    );
    expect(buildQuery({ flag: false }), "false is a value, not an absence").toBe("flag=false");
    expect(buildQuery({ n: 0 }), "and so is zero").toBe("n=0");
  });

  test("ex4 - toUser() renames the fields and parses the date", () => {
    const user = toUser({
      user_id: "u1",
      display_name: "Ada",
      created_at: "2024-03-01T10:00:00.000Z",
    });
    expect(user.userId, "user_id becomes userId").toBe("u1");
    expect(user.displayName, "display_name becomes displayName").toBe("Ada");
    expect(user.createdAt instanceof Date, "created_at becomes a real Date, not a string").toBe(
      true,
    );
    expect(user.createdAt.toISOString(), "and it round-trips").toBe("2024-03-01T10:00:00.000Z");
  });

  test("ex5 - the cache forgets entries once the ttl has passed", () => {
    let clock = 1000;
    const cache = createTtlCache<string>(500, () => clock);
    cache.set("a", "first");
    expect(cache.get("a"), "a fresh entry reads back").toBe("first");
    clock = 1400;
    expect(cache.get("a"), "still inside the window").toBe("first");
    clock = 1500;
    expect(cache.get("a"), "exactly at the ttl the entry has expired - the comparison is " +
      "inclusive (README ex5)").toBe(undefined);
    expect(cache.size(), "and the expired entry is dropped rather than kept").toBe(0);
    clock = 2000;
    cache.set("b", "second");
    clock = 2100;
    expect(cache.get("b"), "the age is measured from the write, not from the first read").toBe(
      "second",
    );
    expect(cache.get("missing"), "an unknown key is undefined").toBe(undefined);
    cache.set("b", "third");
    expect(cache.get("b"), "a rewrite replaces the value").toBe("third");
  });

  test("ex6 - describeRequest() asks for a body only when there is one", () => {
    expect(describeRequest("GET", "/users"), "a GET is method and url").toBe("GET /users");
    expect(
      describeRequest("POST", "/users", "{\"name\":\"Ada\"}"),
      "a POST appends the body after a space",
    ).toBe("POST /users {\"name\":\"Ada\"}");
    expect(describeRequest("POST", "/x", ""), "an empty body is still a body").toBe("POST /x ");
  });

  test("ex7 - defineRoute() matches a url and extracts its params", () => {
    const route = defineRoute("/users/:userId/posts/:postId", (params) => {
      return params.userId + "/" + params.postId;
    });
    expect(route.path, "the route keeps the pattern it was built from").toBe(
      "/users/:userId/posts/:postId",
    );
    expect(route.run("/users/7/posts/9"), "a matching url runs the handler").toBe("7/9");
    expect(route.run("/users/7/posts"), "too few segments does not match").toBe(undefined);
    expect(route.run("/teams/7/posts/9"), "a literal segment has to match exactly").toBe(
      undefined,
    );
    const plain = defineRoute("/health", () => "up");
    expect(plain.run("/health"), "a route with no params still matches").toBe("up");
    expect(plain.run("/health/x"), "and still rejects a longer url").toBe(undefined);
  });

  test("ex8 - the client builds its url from the endpoint table", async () => {
    const sent: string[] = [];
    const client = createClient(async (method, url) => {
      sent.push(method + " " + url);
      return { done: true };
    });
    expect(await client.call("getUser", { id: "u1" }), "the response is passed through").toEqual({
      done: true,
    });
    expect(sent, "the param is substituted into the path").toEqual(["GET /users/u1"]);
    await client.call("createOrder", {});
    expect(sent[1], "an endpoint with no params sends its path unchanged").toBe("POST /orders");
    await client.call("getPost", { userId: "u1", postId: "p9" });
    expect(sent[2], "and every param is substituted, in place").toBe("GET /users/u1/posts/p9");
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d23_realworld_apis. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Result } from "./ex1/solution";
import { err, ok, unwrapOr } from "./ex1/solution";
import { getJson } from "./ex2/solution";
import type { CamelKeys, User, UserDto } from "./ex4/solution";
import { toUser } from "./ex4/solution";
import { createTtlCache } from "./ex5/solution";
import { describeRequest } from "./ex6/solution";
import { defineRoute } from "./ex7/solution";
import { createClient } from "./ex8/solution";

const isUser = (value: unknown): value is { id: string } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { id?: unknown }).id === "string";

describe("d23_realworld_apis", () => {
  test("ex1 - Result narrows on the ok discriminant", () => {
    expectTypeOf(ok(1)).toEqualTypeOf<Result<number, never>>();
    expectTypeOf(err("bad")).toEqualTypeOf<Result<never, string>>();
    const result: Result<number, string> = ok(1);
    if (result.ok) {
      expectTypeOf(result.value).toEqualTypeOf<number>();
    } else {
      expectTypeOf(result.error).toEqualTypeOf<string>();
    }
    expectTypeOf(unwrapOr(result, 0)).toEqualTypeOf<number>();
  });

  test("ex2 - getJson() carries the guarded type into the success case", async () => {
    const outcome = await getJson(async () => ({ status: 200, body: {} }), "/u", isUser);
    if (outcome.ok) {
      expectTypeOf(outcome.data).toEqualTypeOf<{ id: string }>();
    } else {
      expectTypeOf(outcome.reason).toEqualTypeOf<"http" | "shape">();
      expectTypeOf(outcome.status).toEqualTypeOf<number>();
    }
  });

  test("ex4 - CamelKeys renames every key of the dto", () => {
    expectTypeOf<CamelKeys<UserDto>>().toEqualTypeOf<{
      userId: string;
      displayName: string;
      createdAt: string;
    }>();
    expectTypeOf<CamelKeys<{ a_b_c: number }>>().toEqualTypeOf<{ aBC: number }>();
    expectTypeOf(toUser({ user_id: "u", display_name: "n", created_at: "d" })).toEqualTypeOf<User>();
    expectTypeOf<User["createdAt"]>().toEqualTypeOf<Date>();
  });

  test("ex5 - the cache is generic in its value type", () => {
    const cache = createTtlCache<{ id: string }>(100, () => 0);
    expectTypeOf(cache.get("a")).toEqualTypeOf<{ id: string } | undefined>();
    expectTypeOf(cache.size()).toEqualTypeOf<number>();
    const texts = createTtlCache<string>(100, () => 0);
    expectTypeOf(texts.get("a")).toEqualTypeOf<string | undefined>();
  });

  test("ex6 - the method decides how many arguments there are", () => {
    expectTypeOf(describeRequest("GET", "/u")).toEqualTypeOf<string>();
    expectTypeOf(describeRequest("POST", "/u", "{}")).toEqualTypeOf<string>();
    // @ts-expect-error - a GET request takes no body.
    describeRequest("GET", "/u", "{}");
    // @ts-expect-error - a POST request needs one.
    describeRequest("POST", "/u");
  });

  test("ex7 - the handler sees the params the path declares", () => {
    const route = defineRoute("/users/:userId/posts/:postId", (params) => {
      expectTypeOf(params).toEqualTypeOf<{ userId: string; postId: string }>();
      return params.userId;
    });
    expectTypeOf(route.run("/users/1/posts/2")).toEqualTypeOf<string | undefined>();
    expectTypeOf(route.path).toEqualTypeOf<"/users/:userId/posts/:postId">();
    defineRoute("/health", (params) => {
      // @ts-expect-error - this path declares no params.
      params.id;
      return 1;
    });
  });

  test("ex8 - call() demands exactly the params its endpoint declares", async () => {
    const client = createClient(async () => ({}));
    expectTypeOf(client.call("getUser", { id: "u1" })).toEqualTypeOf<Promise<unknown>>();
    // @ts-expect-error - getUser needs an id.
    client.call("getUser", {});
    // @ts-expect-error - deleteUser is not in the endpoint table.
    client.call("deleteUser", {});
  });
});
```

An exercise is green only when both gates agree about it.
