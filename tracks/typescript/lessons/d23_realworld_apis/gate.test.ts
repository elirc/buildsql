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
