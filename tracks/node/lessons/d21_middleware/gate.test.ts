// Gate for node/d21_middleware. Quoted verbatim in README.md.
//
// Everything time-shaped runs on a clock the gate owns, and everything
// concurrency-shaped is held open by a deferred the gate releases by hand - so
// no test sleeps, and every claim about "how many at once" is a count rather
// than a race. supertest gives each app an ephemeral port and takes it away
// again, so nothing binds a fixed one.
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { timing } from "./ex1/solution";
import { only } from "./ex2/solution";
import { compose } from "./ex3/solution";
import { createApp as createErrorApp } from "./ex4/solution";
import { finalErrorHandler } from "./ex4/solution";
import { createApp as createBodyApp } from "./ex5/solution";
import { bearerAuth, requireRole } from "./ex6/solution";
import { concurrencyLimit } from "./ex7/solution";
import { responseCache } from "./ex8/solution";

/** Hand a promise back plus the buttons that settle it. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Turn the event loop over until `check()` holds, or fail loudly. */
async function until(check: () => boolean, what: string): Promise<void> {
  for (let tick = 0; tick < 2_000; tick += 1) {
    if (check()) return;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  throw new Error(`the gate gave up waiting for: ${what}`);
}

describe("d21_middleware", () => {
  test("ex1 - timing() reports the clock it was given, on the response", async () => {
    let clock = 1_000;
    const app = express();
    app.use(timing({ now: () => clock }));
    app.get("/fast", (_req, res) => {
      clock += 7;
      res.json({ status: "ok" });
    });
    app.get("/slow", async (_req, res) => {
      clock += 250;
      res.json({ status: "ok" });
    });

    const fast = await request(app).get("/fast");
    expect(fast.status, "the middleware must not change the response itself").toBe(200);
    expect(fast.body, "or its body").toEqual({ status: "ok" });
    expect(
      fast.headers["x-response-time"],
      "the elapsed time on the injected clock, in milliseconds, as a plain " +
        "number - a real Date.now() here would make this test flaky forever",
    ).toBe("7");

    clock = 5_000;
    const slow = await request(app).get("/slow");
    expect(
      slow.headers["x-response-time"],
      "and it measures each request separately: the start time belongs to this " +
        "request, not to the middleware",
    ).toBe("250");

    const missing = await request(app).get("/nowhere");
    expect(missing.status, "an unmatched path is still a 404").toBe(404);
    expect(
      missing.headers["x-response-time"],
      "which the middleware still timed - it is registered above the routes, " +
        "so it sees requests no route answered",
    ).toBeDefined();
  }, 30_000);

  test("ex2 - only() runs the middleware where it belongs and gets out of the way elsewhere", async () => {
    const stamped: string[] = [];
    const stamp = (req: Request, res: Response, next: NextFunction) => {
      stamped.push(req.path);
      res.setHeader("x-stamped", "yes");
      next();
    };

    const app = express();
    app.use(only((req) => !req.path.startsWith("/public"), stamp));
    app.get("/private", (_req, res) => res.json({ area: "private" }));
    app.get("/public/logo", (_req, res) => res.json({ area: "public" }));

    const guarded = await request(app).get("/private");
    expect(
      guarded.headers["x-stamped"],
      "the predicate said yes, so the wrapped middleware ran",
    ).toBe("yes");

    const skipped = await request(app).get("/public/logo");
    expect(skipped.status, "the request still reaches its route").toBe(200);
    expect(skipped.body, "and is answered normally").toEqual({ area: "public" });
    expect(
      skipped.headers["x-stamped"],
      "but the wrapped middleware never ran. Skipping means calling next() " +
        "yourself, not returning - a middleware that returns without calling " +
        "next() hangs the request until the client times out",
    ).toBeUndefined();

    expect(stamped, "one path in, one path out").toEqual(["/private"]);

    const failing = (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error("the wrapped one exploded"));
    };
    const second = express();
    second.use(only(() => true, failing));
    second.get("/anything", (_req, res) => res.json({ reached: true }));
    second.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: error.message });
    });

    const propagated = await request(second).get("/anything");
    expect(
      propagated.body,
      "and a next(error) from inside the wrapped middleware has to reach the " +
        "error handler unchanged - the wrapper is a pass-through, not a catch",
    ).toEqual({ error: "the wrapped one exploded" });
  }, 30_000);

  test("ex3 - compose() folds a stack into one middleware that behaves like the stack", async () => {
    const trail: string[] = [];
    const note = (label: string) => (_req: Request, _res: Response, next: NextFunction) => {
      trail.push(label);
      next();
    };

    const app = express();
    app.use(compose(note("one"), note("two"), note("three")));
    app.get("/ok", (_req, res) => res.json({ trail }));

    const ordered = await request(app).get("/ok");
    expect(
      ordered.body.trail,
      "in the order they were given, each one waiting for the previous to call " +
        "next()",
    ).toEqual(["one", "two", "three"]);

    const stopper = express();
    const seen: string[] = [];
    stopper.use(
      compose(
        (_req, _res, next) => {
          seen.push("before");
          next();
        },
        (_req, res) => {
          seen.push("responder");
          res.status(202).json({ stopped: true });
        },
        (_req, _res, next) => {
          seen.push("after");
          next();
        },
      ),
    );
    stopper.get("/never", (_req, res) => res.json({ reached: true }));

    const stopped = await request(stopper).get("/never");
    expect(stopped.status, "a middleware that responds ends the request").toBe(202);
    expect(stopped.body, "with its own body").toEqual({ stopped: true });
    expect(
      seen,
      "and nothing after it runs, inside the composition or outside it - the " +
        "route was never reached either",
    ).toEqual(["before", "responder"]);

    const failing = express();
    const reached: string[] = [];
    failing.use(
      compose(
        (_req, _res, next) => {
          reached.push("first");
          next(new Error("stack failed"));
        },
        (_req, _res, next) => {
          reached.push("second");
          next();
        },
      ),
    );
    failing.get("/never", (_req, res) => res.json({ reached: true }));
    failing.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: error.message, reached });
    });

    const errored = await request(failing).get("/never");
    expect(
      errored.body,
      "next(error) skips the rest of the composition AND the routes below, " +
        "landing on the error handler - a compose that runs the next middleware " +
        "anyway has turned an error into a silent continue",
    ).toEqual({ error: "stack failed", reached: ["first"] });

    const empty = express();
    empty.use(compose());
    empty.get("/through", (_req, res) => res.json({ through: true }));
    expect(
      (await request(empty).get("/through")).body,
      "and composing nothing is a middleware that does nothing except carry on",
    ).toEqual({ through: true });
  }, 30_000);

  test("ex4 - two error handlers, and the one that knows when to give up", async () => {
    const logged: string[] = [];
    const app = createErrorApp({ log: (message) => logged.push(message) });

    const ok = await request(app).get("/ok");
    expect(ok.status, "the happy path never touches the error stack").toBe(200);
    expect(ok.body).toEqual({ status: "ok" });
    expect(logged, "and nothing is logged").toEqual([]);

    const handled = await request(app).get("/known");
    expect(
      handled.status,
      "the first error handler recognises this one and finishes the response " +
        "itself",
    ).toBe(422);
    expect(handled.body).toEqual({ error: "unprocessable", message: "known problem" });
    expect(
      logged,
      "the second handler never ran, so it never logged",
    ).toEqual([]);

    const delegated = await request(app).get("/unknown");
    expect(
      delegated.status,
      "an error the first handler does not recognise is passed on with " +
        "next(error) and the LAST handler answers",
    ).toBe(500);
    expect(
      delegated.body,
      "with nothing an attacker can use - no message, no stack",
    ).toEqual({ error: "internal_error", message: "internal server error", touched: false });
    expect(
      logged,
      "...but the real error is logged, once, by the handler that gave up on it",
    ).toEqual(["boom: the database is on fire"]);
    expect(
      delegated.headers["x-marker"],
      "and the ordinary middleware sitting BETWEEN the two error handlers was " +
        "skipped entirely: once a request is in the error path express jumps " +
        "from one four-argument handler straight to the next",
    ).toBeUndefined();

    const unmatched = await request(app).get("/nowhere");
    expect(unmatched.status, "an unmatched path is a 404").toBe(404);
    expect(
      unmatched.headers["x-marker"],
      "which proves that same middleware is genuinely in the stack - on the " +
        "normal path it runs, and it is the four-argument handlers that get " +
        "skipped instead",
    ).toBe("ran");

    // The headers-sent rule is graded directly, because a response that has
    // already begun cannot be re-answered over a real socket.
    const error = new Error("too late");
    let passedOn: unknown = "not called";
    finalErrorHandler(
      error,
      {} as Request,
      { headersSent: true } as Response,
      ((value: unknown) => {
        passedOn = value;
      }) as NextFunction,
    );
    expect(
      passedOn,
      "once the response has started there is no way to send a different " +
        "status, so the only correct move is next(error) - which hands it to " +
        "express, whose default handler destroys the connection rather than " +
        "sending a second answer",
    ).toBe(error);
  }, 30_000);

  test("ex5 - the body parser refuses what it should, and you translate what it says", async () => {
    const app = createBodyApp();

    const accepted = await request(app)
      .post("/notes")
      .set("content-type", "application/json")
      .send({ title: "buy milk" });
    expect(accepted.status, "a good body is accepted").toBe(201);
    expect(accepted.body, "and parsed").toEqual({ id: "n1", title: "buy milk" });

    const tooBig = await request(app)
      .post("/notes")
      .set("content-type", "application/json")
      .send({ title: "x".repeat(500) });
    expect(
      tooBig.status,
      "over the configured limit is 413. express.json({ limit }) raises the " +
        "error for you; turning it into your shape is your job",
    ).toBe(413);
    expect(tooBig.body).toEqual({ error: "payload_too_large" });

    const broken = await request(app)
      .post("/notes")
      .set("content-type", "application/json")
      .send("{ not json");
    expect(
      broken.status,
      "a body that will not parse is the client fault: 400, never a 500",
    ).toBe(400);
    expect(broken.body).toEqual({ error: "invalid_json" });

    const wrongType = await request(app)
      .post("/notes")
      .set("content-type", "text/plain")
      .send("buy milk");
    expect(
      wrongType.status,
      "express.json() does NOT raise anything for a content-type it was not " +
        "asked to parse - it skips silently and leaves req.body undefined. The " +
        "415 is entirely yours to write, and skipping it is how a handler ends " +
        "up reading properties off undefined",
    ).toBe(415);
    expect(wrongType.body).toEqual({ error: "unsupported_media_type" });

    const empty = await request(app)
      .post("/notes")
      .set("content-type", "application/json")
      .send("");
    expect(
      empty.status,
      "an empty body with the right content-type parses to an empty object, " +
        "which is not the same thing as a body and is not a 415 either",
    ).toBe(400);
    expect(empty.body).toEqual({ error: "empty_body" });
  }, 30_000);

  test("ex6 - bearerAuth() says who you are and requireRole() says whether that is enough", async () => {
    const principals: Record<string, { name: string; roles: string[] }> = {
      "ada-token": { name: "ada", roles: ["reader", "admin"] },
      "grace-token": { name: "grace", roles: ["reader"] },
    };
    const verify = vi.fn((token: string) => principals[token]);

    const app = express();
    app.use(bearerAuth({ verify }));
    app.get("/me", (req, res) => res.json({ principal: (req as { principal?: unknown }).principal }));
    app.get("/admin", requireRole("admin"), (_req, res) => res.json({ secret: "the cake is a lie" }));

    const anonymous = await request(app).get("/me");
    expect(anonymous.status, "no Authorization header at all is a 401").toBe(401);
    expect(
      anonymous.headers["www-authenticate"],
      "and a 401 without WWW-Authenticate does not tell the client HOW to " +
        "authenticate, which is the entire purpose of the code",
    ).toContain("Bearer");
    expect(anonymous.body).toEqual({ error: "unauthorized" });
    expect(verify, "a missing token is never handed to verify").not.toHaveBeenCalled();

    const wrongScheme = await request(app).get("/me").set("authorization", "Basic ada-token");
    expect(
      wrongScheme.status,
      "a header in a scheme you do not accept is the same as no credentials",
    ).toBe(401);

    const rejected = await request(app).get("/me").set("authorization", "Bearer nonsense");
    expect(
      rejected.status,
      "a token verify does not recognise is still 401: the client has not " +
        "proved who it is",
    ).toBe(401);

    const identified = await request(app).get("/me").set("authorization", "Bearer grace-token");
    expect(identified.status, "a good token gets through").toBe(200);
    expect(
      identified.body.principal,
      "and whatever verify returned is attached to the request for the " +
        "handlers below",
    ).toEqual({ name: "grace", roles: ["reader"] });

    const forbidden = await request(app).get("/admin").set("authorization", "Bearer grace-token");
    expect(
      forbidden.status,
      "grace is who she says she is and still may not do this: 403, not 401. " +
        "Answering 401 here tells a correctly authenticated client to try " +
        "logging in again, which will not help and will never stop",
    ).toBe(403);
    expect(forbidden.body).toEqual({ error: "forbidden" });
    expect(
      forbidden.headers["www-authenticate"],
      "and a 403 carries no challenge, because there is nothing to retry",
    ).toBeUndefined();

    const allowed = await request(app).get("/admin").set("authorization", "Bearer ada-token");
    expect(allowed.status, "ada has the role").toBe(200);
    expect(allowed.body).toEqual({ secret: "the cake is a lie" });
  }, 30_000);

  test("ex7 - concurrencyLimit() counts what is in flight and refuses the overflow", async () => {
    const started: string[] = [];
    const arrived: string[] = [];
    const gates = new Map<string, ReturnType<typeof deferred>>();

    const app = express();
    // Above the limiter, so the gate can tell that a request has REACHED it -
    // which is what makes the ordering below a fact rather than a hope.
    app.use((req, _res, next) => {
      arrived.push(req.path);
      next();
    });
    app.use(concurrencyLimit({ max: 2, queue: 1 }));
    app.get("/work/:id", async (req, res) => {
      const id = String(req.params.id);
      started.push(id);
      const gate = deferred();
      gates.set(id, gate);
      await gate.promise;
      res.json({ done: id });
    });
    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: error.message });
    });

    const first = request(app).get("/work/a");
    const second = request(app).get("/work/b");
    void first.then(() => {});
    void second.then(() => {});
    await until(() => started.length === 2, "the first two requests to reach the handler");

    expect(
      started,
      "max is 2, so exactly two get through to the handler and no more",
    ).toEqual(["a", "b"]);

    const queued = request(app).get("/work/c");
    void queued.then(() => {});
    await until(() => arrived.length === 3, "the third request to reach the limiter");
    const rejected = await request(app).get("/work/d");

    expect(
      started,
      "the third is held in the queue - it has not reached the handler, which " +
        "is the difference between queueing a request and running it",
    ).toEqual(["a", "b"]);
    expect(
      rejected.status,
      "and the fourth is past the queue limit, so it is refused immediately " +
        "rather than waiting for a slot that may never come",
    ).toBe(503);
    expect(rejected.body).toEqual({ error: "too_busy" });
    expect(
      rejected.headers["retry-after"],
      "with Retry-After, so the client backs off by a number you chose instead " +
        "of one it guessed",
    ).toBeDefined();

    gates.get("a")?.resolve();
    expect(await first, "the released request answers normally").toMatchObject({
      status: 200,
    });
    await until(() => started.length === 3, "the queued request to be let in");
    expect(
      started,
      "a finished request frees its slot and the longest waiter takes it",
    ).toEqual(["a", "b", "c"]);

    gates.get("b")?.resolve();
    gates.get("c")?.resolve();
    await second;
    await queued;

    const failing = express();
    const failStarted: string[] = [];
    failing.use(concurrencyLimit({ max: 1, queue: 5 }));
    failing.get("/boom", async () => {
      failStarted.push("boom");
      throw new Error("handler exploded");
    });
    failing.get("/after", (_req, res) => {
      failStarted.push("after");
      res.json({ ok: true });
    });
    failing.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: error.message });
    });

    expect((await request(failing).get("/boom")).status, "a failing handler still answers").toBe(
      500,
    );
    expect(
      (await request(failing).get("/after")).status,
      "and it gave its slot back on the way out. A slot released only on the " +
        "success path shrinks the limit by one with every error until the " +
        "service accepts nothing at all",
    ).toBe(200);
    expect(failStarted, "both handlers really ran").toEqual(["boom", "after"]);
  }, 30_000);

  test("ex8 - responseCache() replays a stored answer until the clock says otherwise", async () => {
    let clock = 1_000_000;
    let hits = 0;

    const app = express();
    app.use(express.json());
    app.use(responseCache({ ttl: 30_000, now: () => clock }));
    app.get("/notes", (_req, res) => {
      hits += 1;
      res.json({ notes: ["buy milk"], generation: hits });
    });
    app.get("/notes/missing", (_req, res) => {
      res.status(404).json({ error: "not_found" });
    });
    app.post("/notes", (_req, res) => {
      res.status(201).json({ created: true });
    });

    const first = await request(app).get("/notes");
    expect(first.status, "the first request is served by the route").toBe(200);
    expect(first.headers["x-cache"], "and reported as a miss").toBe("MISS");
    expect(first.body, "with the route body").toEqual({ notes: ["buy milk"], generation: 1 });

    const second = await request(app).get("/notes");
    expect(second.headers["x-cache"], "the second is served from the cache").toBe("HIT");
    expect(
      second.body,
      "byte for byte what the route produced the first time - including the " +
        "generation, which proves the handler did not run again",
    ).toEqual({ notes: ["buy milk"], generation: 1 });
    expect(hits, "the route ran exactly once").toBe(1);

    const noStore = await request(app).get("/notes").set("cache-control", "no-store");
    expect(
      noStore.headers["x-cache"],
      "a client that says no-store gets a fresh answer, whatever you have " +
        "stored - the header is an instruction, not a suggestion",
    ).toBe("MISS");
    expect(noStore.body.generation, "so the route ran again").toBe(2);

    const stillCached = await request(app).get("/notes");
    expect(
      stillCached.body.generation,
      "and that bypass did not disturb the stored entry",
    ).toBe(1);

    const missing = await request(app).get("/notes/missing");
    expect(missing.status, "a 404 is answered normally").toBe(404);
    const missingAgain = await request(app).get("/notes/missing");
    expect(
      missingAgain.headers["x-cache"],
      "but never cached: storing a failure means every client gets it until " +
        "the ttl runs out, long after the cause was fixed",
    ).toBe("MISS");

    clock += 30_001;
    const expired = await request(app).get("/notes");
    expect(
      expired.headers["x-cache"],
      "past the ttl on the injected clock the entry is gone",
    ).toBe("MISS");
    expect(expired.body.generation, "so the route runs again").toBe(3);

    const cachedAgain = await request(app).get("/notes");
    expect(cachedAgain.body.generation, "and the new answer is what is stored now").toBe(3);

    const created = await request(app)
      .post("/notes")
      .set("content-type", "application/json")
      .send({ title: "call ada" });
    expect(created.status, "a write is never served from the cache").toBe(201);
    expect(created.headers["x-cache"], "and is not labelled as one either").toBeUndefined();

    const afterWrite = await request(app).get("/notes");
    expect(
      afterWrite.headers["x-cache"],
      "a write to a path invalidates what was stored for it. Without this the " +
        "collection keeps serving the world as it was before the create, and " +
        "the client that just wrote cannot see its own work",
    ).toBe("MISS");
    expect(afterWrite.body.generation, "so the next read is genuinely fresh").toBe(4);
  });
});
