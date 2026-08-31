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
