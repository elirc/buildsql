# d22 — Validation with zod

Eight problems on the boundary where somebody else's JSON becomes your typed
data. Lesson **10_middleware_validation** taught `validateBody` and the 400 that
lists every failing field; lesson **11_rest_capstone** used schemas to keep a
client from patching an `id`. This set drills the rest of zod: coercion,
discriminated unions, cross-field rules, transforms, unknown keys, whole-request
validation, error rendering, and a schema that contains itself.

Two things run through all eight. A schema is a *parser*, not a checker — what
comes out is allowed to be a different shape from what went in, and most of
these answers depend on that. And an issue is only useful if the client can act
on it, which means every failure carries a **path** pointing at the field that
has to change.

## Problem 1 — the query string is all strings

Edit `ex1/solution.ts`. `createApp()` serves `GET /articles`, parsing `limit`
(a number, 1–50, default 10), `page` (a number, at least 1, default 1) and
`order` (`asc` or `desc`, default `asc`). Valid queries answer 200 with the
typed values; anything else is a 400 `{ error: "invalid_query", issues }` where
each issue is `{ path, code, message }` — **every** failing parameter, not the
first.

```
uv run dojo test node d22_validation_zod ex1
```

## Problem 2 — one field decides the shape of the rest

Edit `ex2/solution.ts`. `createApp()` serves `POST /events` over a
`z.discriminatedUnion("type", ...)` of `click` (`x`, `y`: numbers), `keypress`
(`key`: a non-empty string) and `scroll` (`delta`: a number). Success is 202
with `{ summary }` — `click at 3,4`, `key Enter`, `scroll by -120`. An unknown
tag is 400 `{ error: "unknown_event_type", discriminator: "type", issues }`; a
known tag with the wrong fields is 400 `{ error: "invalid_event", issues }`.

```
uv run dojo test node d22_validation_zod ex2
```

## Problem 3 — the rules that need two fields

Edit `ex3/solution.ts`. Export `bookingSchema`: `startsAt`, `endsAt` (non-empty
strings), `seats` (an integer, 1–8), and optional `email` and `phone`. Two
rules that no single field can check: `endsAt` must be after `startsAt`
(reported on `endsAt`), and at least one of `email` and `phone` must be present
(reported on `email`). All problems come back at once.

```
uv run dojo test node d22_validation_zod ex3
```

## Problem 4 — parsing is allowed to change what comes out

Edit `ex4/solution.ts`. Export `signupSchema`: `email` is trimmed, lowercased
and *then* checked as an address; `joinedAt` is an ISO string that comes out as
a real `Date` (and an unparseable one is rejected); `tags` is a comma-separated
string that comes out as a trimmed, de-duplicated array, defaulting to `[]`.

```
uv run dojo test node d22_validation_zod ex4
```

## Problem 5 — a key the schema never mentioned

Edit `ex5/solution.ts`. `createApp()` serves the same body — `{ title, pages }`
— on three routes, one per decision. `POST /strip` uses the default and answers
201 with the extras gone. `POST /strict` answers 400
`{ error: "unknown_fields", keys }`, naming them. `POST /passthrough` answers
201 with everything kept. An ordinary schema failure on `/strict` is
`{ error: "validation_failed" }`, not an unknown-key report.

```
uv run dojo test node d22_validation_zod ex5
```

## Problem 6 — three places one request can be wrong

Edit `ex6/solution.ts`. `validate({ params, query, body })` returns one
middleware that parses each part it was given, puts the results on `req.valid`,
and on failure answers 400 `{ error: "validation_failed", issues }` with paths
namespaced by part — `body.title`, `query.dryRun`, `params.id`. Every part is
checked before it answers. `createApp()` mounts it on
`PATCH /projects/:id/tasks` (`id` matches `proj-<digits>`, `dryRun` is
`true`/`false` defaulting to `false`, the body is `{ title }`) and answers with
`req.valid`.

```
uv run dojo test node d22_validation_zod ex6
```

## Problem 7 — a ZodError is not a response

Edit `ex7/solution.ts`. `toProblem(error)` returns
`{ error: "validation_failed", issues: [{ path, code, message }] }`. Paths
render as `items[0].qty` — array indices in brackets, keys after dots, no
leading dot — and an empty path renders as `(root)`. Zod's own issue order is
kept.

```
uv run dojo test node d22_validation_zod ex7
```

## Problem 8 — a schema that contains itself

Edit `ex8/solution.ts`. `categorySchema` describes a category — a non-empty
`name` and `children`, an array of categories defaulting to `[]` — to any depth,
with a rule that the tree may be at most `MAX_DEPTH` (3) levels deep counting
the root as 1. The offending node is reported at its own path, ending in
`name`. `createApp()` serves `POST /categories`: 201 `{ depth }`, or 400
`{ error: "invalid_category", issues: [{ path, message }] }` with paths rendered
like `children[1].children[0].children[0].name`.

```
uv run dojo test node d22_validation_zod ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d22_validation_zod. Quoted verbatim in README.md.
//
// Every app is built fresh from the learner's factory and driven with
// supertest, which listens on a port the OS picks - nothing binds a fixed
// port and no state survives from one test to the next. The schema-only
// exercises are parsed directly, and the ZodError in ex7 is built by the gate
// so that exercise depends on nobody else's schema.
import request from "supertest";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { createApp as createArticles } from "./ex1/solution";
import { createApp as createEvents } from "./ex2/solution";
import { bookingSchema } from "./ex3/solution";
import { signupSchema } from "./ex4/solution";
import { createApp as createKeys } from "./ex5/solution";
import { createApp as createParts } from "./ex6/solution";
import { toProblem } from "./ex7/solution";
import { createApp as createCategories } from "./ex8/solution";

/** The paths a failed parse complained about, sorted so order is not graded. */
function paths(issues: { path: string }[]): string[] {
  return issues.map((issue) => issue.path).sort();
}

describe("d22_validation_zod", () => {
  test("ex1 - the query string arrives as strings and leaves as values", async () => {
    const app = createArticles();

    const typed = await request(app).get("/articles?limit=5&order=desc");
    expect(typed.status, "a query that satisfies the schema is a 200").toBe(200);
    expect(
      typed.body,
      "limit came in as the string 5 and has to come out as the number 5. " +
        "z.coerce.number() is the difference between a schema that describes " +
        "the query and one that rejects every query",
    ).toEqual({ limit: 5, page: 1, order: "desc" });
    expect(
      typeof typed.body.limit,
      "and it is really a number, not a string that happens to compare equal",
    ).toBe("number");

    const defaulted = await request(app).get("/articles");
    expect(
      defaulted.body,
      "an absent parameter is not an error - .default() answers it, which is " +
        "why the handler below never needs a ?? in it",
    ).toEqual({ limit: 10, page: 1, order: "asc" });

    const nonsense = await request(app).get("/articles?limit=abc");
    expect(nonsense.status, "a limit that is not a number is a 400").toBe(400);
    expect(nonsense.body.error, "with a stable machine-readable code").toBe("invalid_query");
    expect(
      nonsense.body.issues,
      "one issue, naming the parameter and what was wrong with it. Coercion " +
        "turns abc into NaN, and NaN is what the schema rejects",
    ).toEqual([
      { path: "limit", code: "invalid_type", message: "Expected number, received nan" },
    ]);

    const negative = await request(app).get("/articles?limit=-1");
    expect(negative.status, "a negative limit is a 400 too").toBe(400);
    expect(
      negative.body.issues[0].code,
      "coercion succeeded here - it is the positive() constraint that failed, " +
        "and the code says so",
    ).toBe("too_small");

    const capped = await request(app).get("/articles?limit=999");
    expect(
      capped.status,
      "and a limit above the cap is refused rather than clamped: an unbounded " +
        "page size is how one client downloads your whole database",
    ).toBe(400);
    expect(capped.body.issues[0].code, "the other end of the same range").toBe("too_big");

    const both = await request(app).get("/articles?limit=abc&order=sideways");
    expect(
      paths(both.body.issues),
      "two bad parameters are two issues in ONE response. Stopping at the " +
        "first one means the client fixes its query one parameter per round trip",
    ).toEqual(["limit", "order"]);
  });

  test("ex2 - the discriminator picks the branch before the fields are judged", async () => {
    const app = createEvents();

    const click = await request(app)
      .post("/events")
      .set("content-type", "application/json")
      .send({ type: "click", x: 3, y: 4 });
    expect(click.status, "a valid event is accepted with a 202").toBe(202);
    expect(
      click.body,
      "the summary proves which branch ran: only the click branch knows about " +
        "x and y",
    ).toEqual({ summary: "click at 3,4" });

    const key = await request(app)
      .post("/events")
      .set("content-type", "application/json")
      .send({ type: "keypress", key: "Enter" });
    expect(key.body, "a different tag, a different branch, a different shape").toEqual({
      summary: "key Enter",
    });

    const scroll = await request(app)
      .post("/events")
      .set("content-type", "application/json")
      .send({ type: "scroll", delta: -120 });
    expect(scroll.body, "and the third one").toEqual({ summary: "scroll by -120" });

    const unknown = await request(app)
      .post("/events")
      .set("content-type", "application/json")
      .send({ type: "hover", x: 1, y: 2 });
    expect(unknown.status, "an unknown tag is a 400").toBe(400);
    expect(
      unknown.body.error,
      "and it is a DIFFERENT failure from a malformed event: nothing in the " +
        "union could even be attempted",
    ).toBe("unknown_event_type");
    expect(
      unknown.body.discriminator,
      "the response names the field that decides, so the client knows which " +
        "one to fix",
    ).toBe("type");
    expect(
      unknown.body.issues,
      "zod says exactly this: the discriminator did not match any branch. A " +
        "plain z.union() would instead have handed you every branch failure at " +
        "once, which is the whole reason discriminatedUnion exists",
    ).toEqual([
      {
        path: "type",
        code: "invalid_union_discriminator",
        message: "Invalid discriminator value. Expected 'click' | 'keypress' | 'scroll'",
      },
    ]);

    const mismatched = await request(app)
      .post("/events")
      .set("content-type", "application/json")
      .send({ type: "keypress", x: 1, y: 2 });
    expect(mismatched.status, "a known tag with the wrong fields is a 400").toBe(400);
    expect(
      mismatched.body.error,
      "...but not the same 400. The tag was recognised, so this is a malformed " +
        "keypress, not an unknown event",
    ).toBe("invalid_event");
    expect(
      paths(mismatched.body.issues),
      "and the complaint is about the field the keypress branch wanted - the " +
        "union narrowed to one branch and judged it alone",
    ).toEqual(["key"]);
  });

  test("ex3 - the rules that need two fields to check", () => {
    const good = bookingSchema.safeParse({
      startsAt: "2026-05-04T09:00:00.000Z",
      endsAt: "2026-05-04T17:00:00.000Z",
      seats: 4,
      email: "ada@example.com",
    });
    expect(good.success, "a booking that satisfies every rule parses").toBe(true);

    const backwards = bookingSchema.safeParse({
      startsAt: "2026-05-04T17:00:00.000Z",
      endsAt: "2026-05-04T09:00:00.000Z",
      seats: 4,
      phone: "555-0100",
    });
    expect(backwards.success, "an end before its start is rejected").toBe(false);
    expect(
      backwards.success ? [] : backwards.error.issues.map((issue) => issue.path.join(".")),
      "one issue, and it is attached to endsAt - not to the object. An issue " +
        "with an empty path cannot be shown next to the field the user has to " +
        "change",
    ).toEqual(["endsAt"]);

    const unreachable = bookingSchema.safeParse({
      startsAt: "2026-05-04T09:00:00.000Z",
      endsAt: "2026-05-04T17:00:00.000Z",
      seats: 4,
    });
    expect(unreachable.success, "a booking with no way to contact anybody is rejected").toBe(
      false,
    );
    expect(
      unreachable.success ? [] : unreachable.error.issues.map((issue) => issue.path.join(".")),
      "neither field is required on its own, so the rule cannot live on either " +
        "of them - it lives on the object and points at one",
    ).toEqual(["email"]);

    const everything = bookingSchema.safeParse({
      startsAt: "2026-05-04T17:00:00.000Z",
      endsAt: "2026-05-04T09:00:00.000Z",
      seats: 0,
    });
    expect(
      everything.success
        ? []
        : everything.error.issues.map((issue) => issue.path.join(".")).sort(),
      "a plain field rule and BOTH cross-field rules report together. " +
        "superRefine still runs when the fields underneath it already failed, " +
        "which is what lets one round trip carry every problem",
    ).toEqual(["email", "endsAt", "seats"]);
  });

  test("ex4 - parsing is allowed to change what comes out", () => {
    const parsed = signupSchema.safeParse({
      email: "   ADA@Example.COM  ",
      joinedAt: "2026-05-04T00:00:00.000Z",
      tags: "news, beta ,news,  ",
    });
    expect(parsed.success, "a signup with tidy-able input still parses").toBe(true);
    if (!parsed.success) return;

    expect(
      parsed.data.email,
      "trimmed and lowercased on the way through. Normalising in the schema " +
        "means every handler downstream sees one spelling of an address",
    ).toBe("ada@example.com");

    expect(
      parsed.data.joinedAt instanceof Date,
      "the input was a string and the output is a Date. This is the difference " +
        "between validation and parsing, and it is why the return value is not " +
        "just a boolean",
    ).toBe(true);
    expect(
      (parsed.data.joinedAt as Date).toISOString(),
      "and it is the right instant",
    ).toBe("2026-05-04T00:00:00.000Z");

    expect(
      parsed.data.tags,
      "one comma-separated string in, a trimmed and de-duplicated array out, " +
        "with the empty piece after the last comma dropped",
    ).toEqual(["news", "beta"]);

    const bare = signupSchema.safeParse({
      email: "grace@example.com",
      joinedAt: "2026-05-04T00:00:00.000Z",
    });
    expect(
      bare.success ? bare.data.tags : null,
      "no tags at all is an empty array, not undefined - the default is applied " +
        "before the transform, not after it",
    ).toEqual([]);

    const badEmail = signupSchema.safeParse({
      email: "  NOT-an-email  ",
      joinedAt: "2026-05-04T00:00:00.000Z",
    });
    expect(
      badEmail.success ? [] : badEmail.error.issues.map((issue) => issue.code),
      "the check runs on the TRANSFORMED value, which is what .pipe() is for: " +
        "trim first, then judge what is left",
    ).toEqual(["invalid_string"]);

    const badDate = signupSchema.safeParse({
      email: "grace@example.com",
      joinedAt: "the fourth of May",
    });
    expect(
      badDate.success ? [] : badDate.error.issues.map((issue) => issue.code),
      "new Date() never throws - it returns an Invalid Date, and without a " +
        "z.date() after the transform that Invalid Date sails straight into " +
        "your database",
    ).toEqual(["invalid_date"]);
  });

  test("ex5 - three answers to a key the schema never mentioned", async () => {
    const app = createKeys();
    const body = { title: "Dune", pages: 412, colour: "orange", size: "big" };

    const stripped = await request(app)
      .post("/strip")
      .set("content-type", "application/json")
      .send(body);
    expect(stripped.status, "the default behaviour accepts the request").toBe(201);
    expect(
      stripped.body,
      "...and silently drops what it was not asked about. This is the safe " +
        "default: a client that sends isAdmin true cannot make it into your " +
        "handler",
    ).toEqual({ title: "Dune", pages: 412 });

    const rejected = await request(app)
      .post("/strict")
      .set("content-type", "application/json")
      .send(body);
    expect(
      rejected.status,
      "strict() turns the same body into a 400 - useful when a typo in a key " +
        "should be a loud error rather than a silently ignored setting",
    ).toBe(400);
    expect(rejected.body.error, "with a stable code").toBe("unknown_fields");
    expect(
      rejected.body.keys,
      "and the offending keys, in the order zod found them. They come off the " +
        "unrecognized_keys issue, which carries them for exactly this purpose",
    ).toEqual(["colour", "size"]);

    const kept = await request(app)
      .post("/passthrough")
      .set("content-type", "application/json")
      .send(body);
    expect(kept.status, "passthrough() accepts it as well").toBe(201);
    expect(
      kept.body,
      "...and keeps everything, validated fields and unknown ones alike - the " +
        "choice you make when you are a proxy and the extra keys are not yours " +
        "to throw away",
    ).toEqual(body);

    const invalid = await request(app)
      .post("/strict")
      .set("content-type", "application/json")
      .send({ title: "Dune" });
    expect(
      invalid.status,
      "an ordinary missing field is still an ordinary 400 on a strict schema",
    ).toBe(400);
    expect(
      invalid.body.error,
      "and it is not reported as an unknown key - there was not one",
    ).toBe("validation_failed");
  });

  test("ex6 - one request has three places a client can get wrong", async () => {
    const app = createParts();

    const ok = await request(app)
      .patch("/projects/proj-7/tasks?dryRun=true")
      .set("content-type", "application/json")
      .send({ title: "Ship the drills" });
    expect(ok.status, "a request that is valid in all three places is a 200").toBe(200);
    expect(
      ok.body,
      "and the handler reads the PARSED values off req.valid - params, query " +
        "and body each in their own place",
    ).toEqual({
      params: { id: "proj-7" },
      query: { dryRun: "true" },
      body: { title: "Ship the drills" },
    });

    const defaulted = await request(app)
      .patch("/projects/proj-7/tasks")
      .set("content-type", "application/json")
      .send({ title: "Ship the drills" });
    expect(
      defaulted.body.query,
      "defaults apply to the query part like any other schema. Note where the " +
        "parsed value lands: in express 5 req.query is a getter and assigning " +
        "to it throws, so the parsed request has to live somewhere new",
    ).toEqual({ dryRun: "false" });

    const badBody = await request(app)
      .patch("/projects/proj-7/tasks")
      .set("content-type", "application/json")
      .send({ title: "" });
    expect(badBody.status, "an empty title is a 400").toBe(400);
    expect(
      badBody.body.issues,
      "and the path says which PART of the request the problem is in. Bare " +
        "title is ambiguous the moment two parts have a field of the same name",
    ).toEqual([{ path: "body.title", message: "String must contain at least 1 character(s)" }]);

    const allBad = await request(app)
      .patch("/projects/nope/tasks?dryRun=maybe")
      .set("content-type", "application/json")
      .send({ title: "" });
    expect(allBad.status, "three broken parts is still one 400").toBe(400);
    expect(
      paths(allBad.body.issues),
      "with all three reported. Returning as soon as the params fail hides the " +
        "other two, and the client fixes its request one part at a time",
    ).toEqual(["body.title", "params.id", "query.dryRun"]);
  });

  test("ex7 - a ZodError is not an API response until you make it one", () => {
    const schema = z
      .object({
        items: z.array(z.object({ qty: z.number().int().positive() })),
        meta: z.object({ owner: z.string().min(1) }),
        mode: z.union([z.string(), z.number()]),
      })
      .strict();

    const result = schema.safeParse({
      items: [{ qty: 0 }, { qty: "x" }],
      meta: { owner: "" },
      mode: true,
      colour: "orange",
    });
    expect(result.success, "the gate needs this parse to fail").toBe(false);
    if (result.success) return;

    expect(
      toProblem(result.error),
      "every issue rendered once, in the order zod produced them, with array " +
        "indices in brackets and object keys after dots. A path of " +
        "items,0,qty is a join(.) away from items.0.qty, which no client can " +
        "map back to a form field - and the root issue has no path at all, so " +
        "it needs a name rather than an empty string",
    ).toEqual({
      error: "validation_failed",
      issues: [
        {
          path: "items[0].qty",
          code: "too_small",
          message: "Number must be greater than 0",
        },
        {
          path: "items[1].qty",
          code: "invalid_type",
          message: "Expected number, received string",
        },
        {
          path: "meta.owner",
          code: "too_small",
          message: "String must contain at least 1 character(s)",
        },
        {
          path: "mode",
          code: "invalid_union",
          message: "Invalid input",
        },
        {
          path: "(root)",
          code: "unrecognized_keys",
          message: "Unrecognized key(s) in object: 'colour'",
        },
      ],
    });

    const single = z.object({ name: z.string() }).safeParse({ name: 42 });
    expect(single.success, "the gate needs this one to fail too").toBe(false);
    if (single.success) return;
    expect(
      toProblem(single.error).issues,
      "a one-level path is just the key, with no leading dot",
    ).toEqual([
      { path: "name", code: "invalid_type", message: "Expected string, received number" },
    ]);

    const deep = z
      .object({ rows: z.array(z.array(z.number())) })
      .safeParse({ rows: [[1, "two"]] });
    expect(deep.success, "and this one").toBe(false);
    if (deep.success) return;
    expect(
      toProblem(deep.error).issues[0].path,
      "two indices in a row stay next to each other - there is no dot between " +
        "an array and its index",
    ).toBe("rows[0][1]");
  });

  test("ex8 - a schema that contains itself, and a limit on how far", async () => {
    const app = createCategories();

    const flat = await request(app)
      .post("/categories")
      .set("content-type", "application/json")
      .send({ name: "root" });
    expect(flat.status, "a single node with no children is a valid tree").toBe(201);
    expect(
      flat.body,
      "children is optional on the way in and an array on the way out, which " +
        "is what .default([]) buys the handler",
    ).toEqual({ depth: 1 });

    const nested = await request(app)
      .post("/categories")
      .set("content-type", "application/json")
      .send({
        name: "root",
        children: [{ name: "fiction", children: [{ name: "scifi" }] }],
      });
    expect(nested.status, "a tree at exactly the limit is accepted").toBe(201);
    expect(nested.body, "and the depth is reported").toEqual({ depth: 3 });

    const tooDeep = await request(app)
      .post("/categories")
      .set("content-type", "application/json")
      .send({
        name: "root",
        children: [
          { name: "poetry" },
          { name: "fiction", children: [{ name: "scifi", children: [{ name: "space opera" }] }] },
        ],
      });
    expect(tooDeep.status, "one level further is a 400").toBe(400);
    expect(tooDeep.body.error, "with a stable code").toBe("invalid_category");
    expect(
      tooDeep.body.issues,
      "and the path walks to the node that went too far - the SECOND child, " +
        "not the first. An issue that just says too deep leaves the client " +
        "searching a tree by hand",
    ).toEqual([
      {
        path: "children[1].children[0].children[0].name",
        message: "a category tree may be at most 3 levels deep",
      },
    ]);

    const empty = await request(app)
      .post("/categories")
      .set("content-type", "application/json")
      .send({ name: "root", children: [{ name: "" }] });
    expect(empty.status, "the ordinary field rules still apply at every level").toBe(400);
    expect(
      empty.body.issues,
      "and they are reported with the same path notation, however deep the " +
        "recursion went to find them",
    ).toEqual([
      {
        path: "children[0].name",
        message: "String must contain at least 1 character(s)",
      },
    ]);
  });
});
```

In plain English:

- **ex1** sends a good query, an empty one, three bad ones and one with two
  faults, and checks the coerced value is really a number.
- **ex2** posts all three event shapes, then an unknown tag, then a known tag
  with another branch's fields — and checks those last two are different 400s.
- **ex3** breaks each cross-field rule alone, then breaks a plain field rule and
  both cross-field rules at once.
- **ex4** parses a scruffy signup and checks the output types, then omits the
  tags, then breaks the email and the date.
- **ex5** posts one body with two extra keys to all three routes, then a plain
  invalid body to the strict one.
- **ex6** sends a request that is valid everywhere, one that leans on a default,
  one with a bad body, and one broken in all three parts.
- **ex7** renders a ZodError with nested objects, array indices, a union and a
  root-level issue, then a one-level path and a doubly-indexed one.
- **ex8** posts a leaf, a tree at exactly the limit, one a level too deep, and
  one with an empty name two levels down.

Next: **d23_rest_patterns**, where the schemas get out of the way and the status
codes take over.
