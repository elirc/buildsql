# d18 — HTTP without a framework

Eight problems on `node:http`, drawn from lesson **08_http_core**. That lesson
taught you to route, read a query string, bound a body and answer a conditional
GET. This set is the layer underneath all of it: the parts of HTTP that a
framework normally hides, and that you end up implementing anyway the first time
a client asks for something the framework did not anticipate.

No express here — `http.createServer`, `IncomingMessage`, `ServerResponse` and
`URL`, nothing else. Every problem exports a factory so the gate gets a fresh
handler with fresh state, and supertest is handed that handler directly, so
nothing binds a port.

## Problem 1 — the same resource, in the type the client can read

Edit `ex1/solution.ts`. `createHandler()` serves `GET /report` as
`application/json` or `text/plain`, chosen from `Accept` — including `*/*`,
`text/*` and `q=` weights, where `q=0` is a refusal. Every response carries
`Vary: Accept`; nothing acceptable is a 406 naming what was offered.

```
uv run dojo test node d18_http_raw ex1
```

## Problem 2 — a GET with the body left off

Edit `ex2/solution.ts`. `createHandler()` answers `GET /status` with a JSON
document and `HEAD /status` with the same status and the same headers —
including an accurate `content-length` — and no body. An unknown path is a 404
on both, with a content-length too.

```
uv run dojo test node d18_http_raw ex2
```

## Problem 3 — cookies, by hand

Edit `ex3/solution.ts`. `createHandler()` parses the `Cookie` header on
`GET /session` into `{ cookies: {...} }` (percent-decoded values, split at the
first `=`, malformed pairs dropped), and on `POST /session` sets **two** cookies
on one response: `sid=s-N; Path=/; HttpOnly; Max-Age=3600` and
`theme=dark; Path=/; Max-Age=86400`. Ids count from `s-1`.

```
uv run dojo test node d18_http_raw ex3
```

## Problem 4 — send the bytes that were asked for

Edit `ex4/solution.ts`. `createHandler()` serves the ten bytes `0123456789` at
`/clip.txt` with `Accept-Ranges: bytes`, and honours `Range`: 206 with an
inclusive `Content-Range` for `bytes=2-5`, `bytes=-4` and `bytes=6-`; an end
past the last byte is clamped; a start past the end is 416 with
`Content-Range: bytes */10`; an unrecognised unit is ignored.

```
uv run dojo test node d18_http_raw ex4
```

## Problem 5 — moving a client without losing what it carried

Edit `ex5/solution.ts`. `createHandler()` sends 301 for `/old-report`, 308 for
the trailing-slash spelling `/reports/quarterly/`, and 302 for the alias
`/latest` — all to `/reports/quarterly`, all keeping the query string, all with
a `Location` built using `URL`. The canonical path answers 200 and does not
redirect to itself.

```
uv run dojo test node d18_http_raw ex5
```

## Problem 6 — the write that refuses to lose an update

Edit `ex6/solution.ts`. `createHandler()` returns an ETag from `GET /config`.
`PUT /config` requires `If-Match`: a matching one (or `*`) writes and issues a
new ETag, a stale one is **412** and changes nothing, a missing one is **428**,
and a body that will not parse is 400.

```
uv run dojo test node d18_http_raw ex6
```

## Problem 7 — serving a directory, and only that directory

Edit `ex7/solution.ts`. `createStaticServer(root)` serves files from `root`:
content-type from the extension, `application/octet-stream` for one you do not
know, 404 for a missing file **or a directory**, 405 with `Allow: GET, HEAD` for
any other method, and 403 for a path that resolves outside `root` — including
the percent-encoded `..%2f` form that the client never gets a chance to
normalise away.

```
uv run dojo test node d18_http_raw ex7
```

## Problem 8 — a response that is still being written

Edit `ex8/solution.ts`. `createEventStream(source)` streams an injected
`AsyncIterable<SseEvent>` from `GET /events` as server-sent events:
`content-type: text/event-stream`, `cache-control: no-cache`, no
`content-length`, one `id:`/`event:`/`data:` block per event terminated by a
blank line, multi-line data split across several `data:` lines, and the response
ended when the source ends. A source that throws reports an `error` event and
ends.

```
uv run dojo test node d18_http_raw ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d18_http_raw. Quoted verbatim in README.md.
//
// supertest is handed your request listener directly. It wraps it in an
// http.Server, listens on a port the OS picks, makes the request and shuts the
// server down again - so nothing here binds a fixed port and two gates can
// never collide. Every handler comes from a factory, so no state survives a
// test. The one lesson that touches the disk builds its own directory under
// the OS temp dir and removes it afterwards.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createHandler as createNegotiated } from "./ex1/solution";
import { createHandler as createHeadable } from "./ex2/solution";
import { createHandler as createCookies } from "./ex3/solution";
import { createHandler as createRanged } from "./ex4/solution";
import { createHandler as createRedirects } from "./ex5/solution";
import { createHandler as createGuarded } from "./ex6/solution";
import { createStaticServer } from "./ex7/solution";
import { createEventStream, type SseEvent } from "./ex8/solution";

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-d18-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function writeFileIn(dir: string, relative: string, contents: string): Promise<void> {
  const file = path.join(dir, ...relative.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, "utf8");
}

describe("d18_http_raw", () => {
  test("ex1 - the handler answers in the type the client asked for", async () => {
    const handler = createNegotiated();

    const json = await request(handler).get("/report").set("accept", "application/json");
    expect(json.status, "a type you offer is a 200").toBe(200);
    expect(
      json.headers["content-type"],
      "and the response says which of the two it chose",
    ).toContain("application/json");
    expect(json.body, "the JSON representation").toEqual({
      id: "r-1",
      title: "Quarterly report",
      total: 42,
    });
    expect(
      json.headers.vary,
      "Vary: Accept is not optional here. Without it a cache stores the JSON " +
        "and then serves it to the next client that asked for text, and the " +
        "bug is unreproducible because it depends on who arrived first",
    ).toBe("Accept");

    const text = await request(handler).get("/report").set("accept", "text/plain");
    expect(text.headers["content-type"], "the other representation").toContain("text/plain");
    expect(
      text.text,
      "the same resource, rendered as the line a terminal wants",
    ).toBe("r-1 Quarterly report 42");

    const wildcard = await request(handler).get("/report").set("accept", "*/*");
    expect(
      wildcard.headers["content-type"],
      "a client that will take anything gets your first preference, not a " +
        "random one - the order you list what you offer is the tie-break",
    ).toContain("application/json");

    const group = await request(handler).get("/report").set("accept", "text/*");
    expect(
      group.headers["content-type"],
      "text/* matches text/plain and nothing else you offer",
    ).toContain("text/plain");

    const preferred = await request(handler)
      .get("/report")
      .set("accept", "text/plain;q=0.8, application/json;q=0.9");
    expect(
      preferred.headers["content-type"],
      "q is a weight, not decoration: 0.9 beats 0.8 even though text/plain was " +
        "written first",
    ).toContain("application/json");

    const reversed = await request(handler)
      .get("/report")
      .set("accept", "application/json;q=0.2, text/plain;q=0.9");
    expect(reversed.headers["content-type"], "and the other way round").toContain("text/plain");

    const refused = await request(handler)
      .get("/report")
      .set("accept", "application/json;q=0, text/plain");
    expect(
      refused.headers["content-type"],
      "q=0 means the client is refusing that type. Treating it as just another " +
        "number sends the one thing it said it could not read",
    ).toContain("text/plain");

    const impossible = await request(handler).get("/report").set("accept", "application/xml");
    expect(
      impossible.status,
      "nothing you offer is acceptable, so 406 - not a 200 with your favourite " +
        "format and a hope for the best",
    ).toBe(406);
    expect(impossible.body, "and the body says what was on the menu").toEqual({
      error: "not_acceptable",
      offered: ["application/json", "text/plain"],
    });

    const missing = await request(handler).get("/nope").set("accept", "application/json");
    expect(missing.status, "an unknown path is still a 404").toBe(404);
  });

  test("ex2 - a HEAD promises exactly what the GET would deliver", async () => {
    const handler = createHeadable();

    const get = await request(handler).get("/status");
    expect(get.status, "the GET is an ordinary 200").toBe(200);
    expect(get.body, "with the status document").toEqual({ service: "café-api", ready: true });

    const declared = Number(get.headers["content-length"]);
    expect(
      declared,
      "Content-Length is a count of BYTES. This payload has an é in it, so the " +
        "string is shorter than the encoding - and String.length is the wrong " +
        "function. Buffer.byteLength is the right one",
    ).toBe(Buffer.byteLength(get.text));
    expect(
      get.text.length,
      "...which is provable here: the character count is strictly smaller than " +
        "the byte count, so a solution that sent String.length would have sent " +
        "a number that is too low",
    ).toBeLessThan(declared);

    const head = await request(handler).head("/status");
    expect(head.status, "the HEAD gets the same status").toBe(200);
    expect(
      head.headers["content-type"],
      "and the same content-type - a HEAD is a GET with the body left off, not " +
        "a different endpoint",
    ).toBe(get.headers["content-type"]);
    expect(
      head.headers["content-length"],
      "and the same content-length. That header is the entire point of a HEAD: " +
        "a client asks how big the download is before it commits to it, and a " +
        "handler that omits it has answered nothing",
    ).toBe(get.headers["content-length"]);
    expect(head.text, "with no body at all").toBeFalsy();

    const missingGet = await request(handler).get("/nope");
    expect(missingGet.status, "an unknown path is a 404 for a GET").toBe(404);

    const missingHead = await request(handler).head("/nope");
    expect(
      missingHead.status,
      "...and a 404 for a HEAD too. Routing happens before the body does",
    ).toBe(404);
    expect(
      missingHead.headers["content-length"],
      "even the 404 declares the size of the body it is not sending",
    ).toBe(missingGet.headers["content-length"]);
    expect(missingHead.text, "and still sends none of it").toBeFalsy();
  });

  test("ex3 - cookies are a header format you have to parse yourself", async () => {
    const handler = createCookies();

    const read = await request(handler)
      .get("/session")
      .set("cookie", "sid=s-9; theme=dark; name=Ada%20Lovelace");
    expect(
      read.body,
      "one header, several cookies, split on semicolons and trimmed - and the " +
        "values are percent-decoded, because that is how a value with a space " +
        "in it survives the trip",
    ).toEqual({
      cookies: { sid: "s-9", theme: "dark", name: "Ada Lovelace" },
    });

    const awkward = await request(handler)
      .get("/session")
      .set("cookie", "token=abc=def; broken; empty=");
    expect(
      awkward.body.cookies,
      "split on the FIRST equals sign only: a base64 value ends in = signs and " +
        "splitting on all of them throws half the token away. A pair with no " +
        "equals at all is not a cookie",
    ).toEqual({ token: "abc=def", empty: "" });

    const none = await request(handler).get("/session");
    expect(none.body.cookies, "no Cookie header is an empty object, not a crash").toEqual({});

    const first = await request(handler).post("/session");
    const cookies = first.headers["set-cookie"];
    expect(
      Array.isArray(cookies) && cookies.length,
      "TWO cookies means two Set-Cookie headers. setHeader() called twice " +
        "REPLACES the first one, so the classic version of this bug logs " +
        "everybody in without a theme - pass an array, or append",
    ).toBe(2);
    expect(
      cookies[0],
      "the session cookie, with the attributes that make it a session cookie",
    ).toBe("sid=s-1; Path=/; HttpOnly; Max-Age=3600");
    expect(cookies[1], "and a preference cookie the browser is allowed to read").toBe(
      "theme=dark; Path=/; Max-Age=86400",
    );

    const second = await request(handler).post("/session");
    expect(
      second.headers["set-cookie"][0],
      "the id comes from the closure the factory returns, so the second " +
        "session is s-2",
    ).toBe("sid=s-2; Path=/; HttpOnly; Max-Age=3600");
  });

  test("ex4 - the handler serves the bytes that were asked for", async () => {
    const handler = createRanged();

    const whole = await request(handler).get("/clip.txt");
    expect(whole.status, "no Range header is an ordinary 200").toBe(200);
    expect(whole.text, "with the whole resource").toBe("0123456789");
    expect(
      whole.headers["accept-ranges"],
      "and an advertisement that ranges are supported. Without this header a " +
        "client will not even try, so the other five cases never happen",
    ).toBe("bytes");

    const middle = await request(handler).get("/clip.txt").set("range", "bytes=2-5");
    expect(
      middle.status,
      "a satisfiable range is 206 Partial Content, never 200 - a 200 tells the " +
        "client it is holding the whole file",
    ).toBe(206);
    expect(middle.text, "bytes 2 to 5, inclusive at both ends").toBe("2345");
    expect(
      middle.headers["content-range"],
      "the response says which bytes these are and how many there are in " +
        "total, in that exact shape",
    ).toBe("bytes 2-5/10");
    expect(middle.headers["content-length"], "and how many bytes are in THIS response").toBe("4");

    const suffix = await request(handler).get("/clip.txt").set("range", "bytes=-4");
    expect(
      suffix.text,
      "a range with no start is a suffix: the LAST four bytes, not the first " +
        "four and not an error",
    ).toBe("6789");
    expect(suffix.headers["content-range"], "reported as absolute offsets").toBe("bytes 6-9/10");

    const open = await request(handler).get("/clip.txt").set("range", "bytes=6-");
    expect(open.text, "a range with no end runs to the end of the resource").toBe("6789");
    expect(open.headers["content-range"]).toBe("bytes 6-9/10");

    const clamped = await request(handler).get("/clip.txt").set("range", "bytes=5-100");
    expect(
      clamped.text,
      "an end past the last byte is clamped, not rejected - the client asked " +
        "for more than exists and gets what exists",
    ).toBe("56789");
    expect(clamped.headers["content-range"]).toBe("bytes 5-9/10");

    const impossible = await request(handler).get("/clip.txt").set("range", "bytes=20-30");
    expect(
      impossible.status,
      "a range that starts past the end cannot be satisfied: 416, and the " +
        "client needs to be told the real size or it will ask again",
    ).toBe(416);
    expect(
      impossible.headers["content-range"],
      "which is what the star form is for",
    ).toBe("bytes */10");
    expect(impossible.text, "and there is nothing to send").toBeFalsy();

    const foreign = await request(handler).get("/clip.txt").set("range", "items=0-1");
    expect(
      foreign.status,
      "a unit you do not understand is IGNORED, not refused - the spec says so, " +
        "and answering 416 here breaks a client that was only being optimistic",
    ).toBe(200);
    expect(foreign.text, "so the whole resource comes back").toBe("0123456789");
  });

  test("ex5 - the handler moves clients without losing what they carried", async () => {
    const handler = createRedirects();

    // supertest follows redirects by default. redirects(0) is what lets these
    // assertions see the 3xx instead of the page at the other end.
    const moved = await request(handler).get("/old-report?year=2026").redirects(0);
    expect(moved.status, "the resource moved for good, so 301").toBe(301);
    expect(
      moved.headers.location,
      "and the query string comes with it. Dropping it is the classic version " +
        "of this bug: every bookmarked link keeps working and silently loses " +
        "its filters",
    ).toBe("/reports/quarterly?year=2026");

    const slashed = await request(handler).get("/reports/quarterly/?year=2026").redirects(0);
    expect(
      slashed.status,
      "a trailing slash is a different URL, so canonicalise it - with 308, " +
        "which is the permanent redirect that is not allowed to change the " +
        "method",
    ).toBe(308);
    expect(slashed.headers.location, "again keeping the query").toBe(
      "/reports/quarterly?year=2026",
    );

    const posted = await request(handler).post("/reports/quarterly/").redirects(0);
    expect(
      posted.status,
      "and that is why it matters: a POST redirected with 301 may arrive as a " +
        "GET with no body. 308 promises it will not",
    ).toBe(308);

    const alias = await request(handler).get("/latest").redirects(0);
    expect(
      alias.status,
      "an alias that will point somewhere else tomorrow is 302, not 301 - a " +
        "301 is cached by the browser forever and you cannot take it back",
    ).toBe(302);
    expect(alias.headers.location).toBe("/reports/quarterly");

    const arrived = await request(handler).get("/reports/quarterly?year=2026").redirects(0);
    expect(
      arrived.status,
      "the canonical URL answers, and does NOT redirect to itself. A " +
        "canonicaliser that cannot recognise its own output is an infinite loop",
    ).toBe(200);
    expect(arrived.headers.location, "so there is no Location at all").toBeUndefined();
    expect(arrived.body).toEqual({ id: "quarterly", year: "2026" });

    const unknown = await request(handler).get("/nowhere").redirects(0);
    expect(unknown.status, "and something with nowhere to go is a 404").toBe(404);
  });

  test("ex6 - a write that would overwrite somebody else is refused", async () => {
    const handler = createGuarded();

    const first = await request(handler).get("/config");
    expect(first.status, "the read is a 200").toBe(200);
    expect(first.body, "with the current value").toEqual({ id: "cfg-1", threshold: 10 });
    const version = first.headers.etag;
    expect(
      version,
      "and an ETag identifying this version. It is a quoted string in the " +
        "message - the quotes are part of the syntax, not decoration",
    ).toBe('"v1"');

    const accepted = await request(handler)
      .put("/config")
      .set("content-type", "application/json")
      .set("if-match", '"v1"')
      .send('{"threshold":25}');
    expect(accepted.status, "the version the client holds is current, so the write lands").toBe(
      200,
    );
    expect(accepted.body, "with the new value").toEqual({ id: "cfg-1", threshold: 25 });
    expect(
      accepted.headers.etag,
      "and a NEW ETag, because the resource changed. Returning the old one " +
        "means the next writer thinks it is up to date when it is not",
    ).toBe('"v2"');

    const stale = await request(handler)
      .put("/config")
      .set("content-type", "application/json")
      .set("if-match", '"v1"')
      .send('{"threshold":99}');
    expect(
      stale.status,
      "this is the lost update, caught: the client read v1, somebody else " +
        "wrote v2, and this write would have thrown that away. 412 Precondition " +
        "Failed",
    ).toBe(412);

    const unchanged = await request(handler).get("/config");
    expect(
      unchanged.body,
      "and it really did not happen - a 412 that still writes is worse than no " +
        "check at all, because now everybody trusts it",
    ).toEqual({ id: "cfg-1", threshold: 25 });

    const blind = await request(handler)
      .put("/config")
      .set("content-type", "application/json")
      .send('{"threshold":1}');
    expect(
      blind.status,
      "a write with no If-Match at all is not an accident to be forgiven: 428 " +
        "Precondition Required tells the client to go and read first",
    ).toBe(428);
    expect(blind.body).toEqual({ error: "precondition_required" });

    const any = await request(handler)
      .put("/config")
      .set("content-type", "application/json")
      .set("if-match", "*")
      .send('{"threshold":7}');
    expect(
      any.status,
      "a star means any current version will do - the client is saying it does " +
        "not care what is there, only that something is",
    ).toBe(200);
    expect(any.headers.etag, "and the version still moves on").toBe('"v3"');

    const broken = await request(handler)
      .put("/config")
      .set("content-type", "application/json")
      .set("if-match", '"v3"')
      .send("{ not json");
    expect(
      broken.status,
      "a body that will not parse is the client fault: 400, not a 500 from an " +
        "unguarded JSON.parse",
    ).toBe(400);
  });

  test("ex7 - the static server serves the tree and nothing above it", async () => {
    await withTempDir(async (parent) => {
      const root = path.join(parent, "public");
      await writeFileIn(root, "index.html", "<h1>Dojo</h1>");
      await writeFileIn(root, "notes.txt", "plain words");
      await writeFileIn(root, "data/app.json", '{"ok":true}');
      await writeFileIn(root, "assets/logo.svg", "<svg></svg>");
      await writeFileIn(root, "download.bin", "binary-ish");
      // One directory up from the root, which is exactly where an attacker
      // would like this handler to look.
      await writeFileIn(parent, "secret.txt", "the-private-key");

      const handler = createStaticServer(root);

      const page = await request(handler).get("/index.html");
      expect(page.status, "a file that is there is a 200").toBe(200);
      expect(page.text, "with its contents").toBe("<h1>Dojo</h1>");
      expect(
        page.headers["content-type"],
        "and a content-type taken from the extension - a browser handed HTML " +
          "without it renders your markup as text, or worse, guesses",
      ).toBe("text/html; charset=utf-8");

      const json = await request(handler).get("/data/app.json");
      expect(json.headers["content-type"], "nested files work at any depth").toBe(
        "application/json; charset=utf-8",
      );
      expect(json.text).toBe('{"ok":true}');

      const svg = await request(handler).get("/assets/logo.svg");
      expect(svg.headers["content-type"], "an image type carries no charset").toBe(
        "image/svg+xml",
      );

      const unknown = await request(handler).get("/download.bin");
      expect(
        unknown.headers["content-type"],
        "an extension you do not know is application/octet-stream, which means " +
          "download this, do not run it",
      ).toBe("application/octet-stream");

      const head = await request(handler).head("/notes.txt");
      expect(head.status, "HEAD works because you said it did").toBe(200);
      expect(head.text, "and sends no body").toBeFalsy();

      const missing = await request(handler).get("/nothing.txt");
      expect(missing.status, "a file that is not there is a 404").toBe(404);

      const directory = await request(handler).get("/data");
      expect(
        directory.status,
        "a directory is not a file: 404, because this server does not do " +
          "listings and inventing one leaks your filenames",
      ).toBe(404);

      const wrongMethod = await request(handler).post("/index.html");
      expect(wrongMethod.status, "the path exists but the method does not: 405").toBe(405);
      expect(
        wrongMethod.headers.allow,
        "and a 405 has to say what IS allowed - the Allow header is part of the " +
          "spec, not a nicety",
      ).toBe("GET, HEAD");

      const traversal = await request(handler).get("/..%2fsecret.txt");
      expect(
        traversal.status,
        "this is the attack. The client cannot send a literal ../ because the " +
          "URL is normalised on the way out - so it sends %2f and hopes you " +
          "decode first and check second. Resolve, then check containment",
      ).toBe(403);
      expect(
        traversal.text,
        "and above all, the file above the root must not appear in the response",
      ).not.toContain("the-private-key");

      const deeper = await request(handler).get("/data/..%2f..%2fsecret.txt");
      expect(deeper.status, "the same attack from further down the tree").toBe(403);

      const persistent = await request(handler).get("/..%2f..%2f..%2f..%2fetc%2fpasswd");
      expect(
        persistent.status,
        "and no number of them helps, because you are not counting dots - you " +
          "resolve to one absolute path and ask a single question about where " +
          "it landed",
      ).toBe(403);
    });
    // The only problem in this set that touches a real filesystem: a dozen
    // requests plus a temp tree that has to be created and removed. The extra
    // timeout is headroom for a slow disk, not for a slow solution.
  }, 30_000);

  test("ex8 - the event stream is a body that arrives in pieces", async () => {
    async function* three(): AsyncGenerator<SseEvent> {
      yield { id: "1", event: "tick", data: "one" };
      yield { data: "two\nstill two" };
      yield { id: "3", data: "three" };
    }

    const stream = await request(createEventStream(three())).get("/events");
    expect(stream.status, "the stream is a 200").toBe(200);
    expect(
      stream.headers["content-type"],
      "with the one content-type that tells a browser to hand this to " +
        "EventSource instead of buffering it",
    ).toBe("text/event-stream");
    expect(
      stream.headers["cache-control"],
      "and a promise nobody will store it",
    ).toBe("no-cache");
    expect(
      stream.headers["content-length"],
      "there is no Content-Length, because you do not know one - the response " +
        "is chunked, and setting a length here is how a stream ends up " +
        "truncated at the first event",
    ).toBeUndefined();

    expect(
      stream.text,
      "the wire format: id, then event, then one data line per line of data, " +
        "then a BLANK line. The blank line is what dispatches the event - " +
        "without it the browser waits forever holding a complete message",
    ).toBe(
      "id: 1\nevent: tick\ndata: one\n\n" +
        "data: two\ndata: still two\n\n" +
        "id: 3\ndata: three\n\n",
    );

    async function* nothing(): AsyncGenerator<SseEvent> {
      // no events at all
    }
    const empty = await request(createEventStream(nothing())).get("/events");
    expect(empty.status, "a source with nothing in it still opens the stream").toBe(200);
    expect(
      empty.text,
      "...and closes it again, rather than hanging on to the connection",
    ).toBe("");

    async function* breaks(): AsyncGenerator<SseEvent> {
      yield { data: "first" };
      throw new Error("the source failed");
    }
    const failed = await request(createEventStream(breaks())).get("/events");
    expect(
      failed.status,
      "the headers went out with the first event, so the status can no longer " +
        "be changed. A 500 is not available to you here, and pretending " +
        "otherwise throws ERR_HTTP_HEADERS_SENT into your logs",
    ).toBe(200);
    expect(
      failed.text,
      "so the failure is reported IN the stream, as an event, and then the " +
        "response is ended - a client that is left hanging will reconnect and " +
        "fail again",
    ).toBe("data: first\n\nevent: error\ndata: the source failed\n\n");

    const elsewhere = await request(createEventStream(three())).get("/nope");
    expect(elsewhere.status, "and only one path is a stream").toBe(404);
  });
});
```

In plain English:

- **ex1** asks for each type by name, by wildcard, by group and by weight, uses
  `q=0` to refuse one, and then asks for something you do not have.
- **ex2** compares the GET and the HEAD header for header, and proves the
  content-length was counted in bytes rather than characters.
- **ex3** parses three shapes of `Cookie` header, then checks that one response
  really carries two `Set-Cookie` headers and that the ids advance.
- **ex4** takes a middle range, a suffix range, an open-ended range, an
  over-long range, an impossible range and an unknown unit.
- **ex5** checks each redirect code, that the query survives, that a POST keeps
  its method through the 308, and that the canonical URL does not loop.
- **ex6** writes with a current ETag, then replays a stale one and checks the
  value did not move, then tries with no precondition at all.
- **ex7** serves four content types, refuses a directory and a wrong method, and
  then attacks its own root three ways with a real secret file one level up.
- **ex8** compares the whole stream body byte for byte, then runs an empty
  source and a source that throws half way through.

Next: **d19_http_routing**, the dispatch half of the same lesson.
