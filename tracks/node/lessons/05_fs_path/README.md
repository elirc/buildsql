# 05 — Files and paths

This is the lesson where Node stops being a language runtime and starts being
an operating-system client. Everything you write from here — reading config,
serving static files, processing uploads, writing logs — goes through two
modules: `node:fs`, which does the I/O, and `node:path`, which does the
arithmetic on the strings that name the files.

Two things make this harder than it looks. The first is that a path is not
really a string: it has a separator that differs between platforms, an
extension whose definition has an edge case, and a normalisation step that
turns `a/b/../c` into `a/c`. Code that treats paths as strings works
perfectly on the machine it was written on. Your Windows box and a Linux
container disagree about `\` versus `/`, and the resulting bug is always
discovered in production.

The second is that the filesystem is a shared, hostile, stateful thing. The
file might not exist. It might exist and be a directory. It might disappear
between your check and your read. Someone else might be writing it right now.
The `fs` API's job is to hand you those failures precisely — through
`error.code` — and yours is to decide, per code, which are expected and which
are not. That is the operational/programmer distinction from lesson 04, now
with real error codes attached.

## Concept — `node:path` first, `node:fs/promises` second

`node:path` is pure string arithmetic; it never touches the disk, so nothing
in it can fail because a file is missing:

```ts
import path from "node:path";

path.join("data", "reports", "q1.json");   // "data\reports\q1.json" on Windows
path.resolve("data", "q1.json");           // absolute, based on process.cwd()
path.dirname("/srv/app/index.js");         // "/srv/app"
path.basename("/srv/app/index.js");        // "index.js"
path.basename("/srv/app/index.js", ".js"); // "index"
path.extname("archive.tar.gz");            // ".gz"  <- the LAST dot onwards
path.parse("/srv/app/index.js");
// { root: "/", dir: "/srv/app", base: "index.js", name: "index", ext: ".js" }
path.relative("/srv/app", "/srv/app/logs/today.log");  // "logs/today.log"
path.sep;                                  // "\" on Windows, "/" elsewhere
```

`join` versus `resolve` is the distinction to keep: `join` glues segments
together and normalises; `resolve` builds an *absolute* path, walking right to
left until it has one, so `path.resolve("/a", "/b")` is `/b`. Use `join` for
"a file inside this directory" and `resolve` for "make this absolute".

Then the filesystem, in its promise flavour:

```ts
import { readFile, writeFile, mkdir, readdir, rm, stat } from "node:fs/promises";

const text = await readFile(file, "utf8");        // without "utf8": a Buffer
await writeFile(file, text, "utf8");              // truncates and replaces
await mkdir(dir, { recursive: true });            // no error if it exists
const entries = await readdir(dir, { withFileTypes: true });  // Dirent objects
```

`node:fs` has three APIs for everything: callbacks (`fs.readFile`), promises
(`fs/promises`), and synchronous (`fs.readFileSync`). Use the promise one.
The sync one blocks the entire event loop for the duration of the disk I/O,
which is acceptable exactly once — at start-up, before you accept traffic —
and a self-inflicted outage anywhere else.

And the failures, which arrive as an `Error` with a `code`:

| code | meaning |
|---|---|
| `ENOENT` | no such file or directory |
| `EACCES` / `EPERM` | you are not allowed |
| `EEXIST` | it is already there |
| `EISDIR` / `ENOTDIR` | you asked for the wrong kind of thing |
| `EMFILE` | too many open file descriptors |

Branch on `error.code`, never on `error.message`. The codes are API; the
messages are prose and they change.

## Exercise 1 — path arithmetic

Edit `ex1/solution.ts`. Three small functions, no disk access at all:

- `reportPath(root, slug, file)` joins the three segments into one path, using
  the platform separator and collapsing a doubled separator if `root` already
  ends with one.
- `splitName(file)` returns `{ name, ext }` for a filename:
  `"report.2026.json"` → `{ name: "report.2026", ext: ".json" }`,
  `"LICENSE"` → `{ name: "LICENSE", ext: "" }`.
- `isInside(parent, child)` returns whether `child` is strictly below
  `parent`: `true` for a file in a subdirectory, `false` for anything reached
  by going up, and `false` when the two are the same path.

`isInside` is not a toy. It is the check that stops
`GET /files/../../etc/passwd` from serving your password file, and "the
attacker sent `..` in a filename" is one of the oldest live vulnerabilities on
the web. The naive version — does the string start with the base directory? —
passes `/uploads-secret` when the base is `/uploads`, which is why the right
answer resolves both paths first and asks which direction the journey goes.

```
uv run dojo test node 05_fs_path ex1
```

## Exercise 2 — write it, read it back

Edit `ex2/solution.ts`. Implement:

- `writeJson(file, data)` — writes `data` as JSON, **creating any missing
  parent directories**, indented with two spaces, ending with a newline.
- `readJson(file)` — reads it back and parses it.

The gate writes to `<temp>/reports/2026/q1.json` where neither `reports` nor
`2026` exists yet, then inspects the raw text on disk before parsing it.

```
uv run dojo test node 05_fs_path ex2
```

## Exercise 3 — walk the tree

Edit `ex3/solution.ts`. Implement `listJsonFiles(dir)`: every `.json` file at
any depth below `dir`, as paths **relative to `dir`**, with **forward
slashes**, sorted.

Given this tree:

```
a.json
notes.txt
nested/b.json
nested/deep/c.json
nested/deep/skip.md
```

…the answer is `["a.json", "nested/b.json", "nested/deep/c.json"]`.

Two portability details are deliberate. Relative paths keep the output stable
no matter where the temp directory is; forward slashes keep it stable no
matter which platform you are on. Normalising to POSIX separators at the edge
of your program — and joining with `path.join` again on the way back in — is a
common and sane convention, and it is exactly what the challenge does with the
result.

```
uv run dojo test node 05_fs_path ex3
```

## Exercise 4 — missing is not broken

Edit `ex4/solution.ts`. Implement `readJsonOr(file, fallback)`:

- if the file does not exist (`ENOENT`), resolve with `fallback`;
- if it exists, parse and resolve with its contents;
- if anything else goes wrong — a permission error, a corrupt file — let the
  error through.

The temptation is one `try` around everything with `return fallback` in the
`catch`. That code passes two of the three cases and quietly turns a corrupted
settings file into a silent reset to defaults, which is the kind of bug that
gets reported as "the app randomly forgets my settings". Keep the `try` around
the operation whose failure you actually understand.

```
uv run dojo test node 05_fs_path ex4
```

## Challenge — a small pipeline

Edit `challenge/solution.ts`. Implement `buildIndex(dir)`:

1. find every `.json` file under `dir` (skipping `index.json` itself);
2. read and parse each one, taking `{ id, title }` from it;
3. sort the entries by `id`;
4. write them to `<dir>/index.json` in the same format as `writeJson`;
5. return the array.

If any file fails to parse, reject — and the error message must contain the
**relative path of the offending file**, with the original error kept as
`cause`. Nothing partial gets written.

Copy your ex3 walker into this file rather than importing it; exercises in
this course are deliberately isolated so that one broken file cannot fail two
gates.

Honest difficulty note: nothing here is individually hard, and assembling four
things you have just written is exactly the point. The two places people lose
time are forgetting to skip `index.json` (so the second run indexes its own
output) and reporting the error without the filename.

```
uv run dojo test node 05_fs_path challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement
`ensureUniqueName(dir, name)`: return `name` if nothing in `dir` is called
that, otherwise `name-1`, `name-2`, … until you find a free one — with the
suffix **before** the extension (`report-1.json`, never `report.json-1`), and
working for files with no extension at all.

```
uv run dojo test node 05_fs_path review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { isInside, reportPath, splitName } from "./ex1/solution";
import { readJson, writeJson } from "./ex2/solution";
import { listJsonFiles } from "./ex3/solution";
import { readJsonOr } from "./ex4/solution";
import { buildIndex } from "./challenge/solution";
import { ensureUniqueName } from "./review1/solution";

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-fs-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function writeFileIn(dir: string, relative: string, contents: string): Promise<string> {
  const file = path.join(dir, ...relative.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, "utf8");
  return file;
}

describe("05_fs_path", () => {
  test("ex1 - paths are built and inspected with node:path, never with strings", () => {
    const root = path.join(tmpdir(), "srv");
    expect(
      reportPath(root, "01_modules", "README.md"),
      "join the segments with node:path so the separator is right for the " +
        "platform: on Windows that is a backslash, and a hard-coded / is a bug " +
        "that only shows up on someone else's machine",
    ).toBe([root, "01_modules", "README.md"].join(path.sep));

    expect(
      reportPath(root + path.sep, "01_modules", "README.md"),
      "a trailing separator on the root must not produce a doubled separator " +
        "- the right function normalises this for you",
    ).toBe([root, "01_modules", "README.md"].join(path.sep));

    expect(
      splitName("report.2026.json"),
      "the extension is the LAST dot onwards, and the name is everything " +
        "before it - node:path knows this rule, you should not reimplement it",
    ).toEqual({ name: "report.2026", ext: ".json" });
    expect(
      splitName("LICENSE"),
      "a file with no dot has an empty extension, not undefined",
    ).toEqual({ name: "LICENSE", ext: "" });

    const base = path.join(tmpdir(), "uploads");
    expect(
      isInside(base, path.join(base, "avatars", "1.png")),
      "a path below the base directory is inside it",
    ).toBe(true);
    expect(
      isInside(base, path.join(base, "..", "etc", "passwd")),
      "this is the path traversal attack in one line: a user-supplied " +
        '"../.." must be rejected. Resolve first, then compare (README ex1)',
    ).toBe(false);
    expect(
      isInside(base, base),
      "the base directory is not inside itself",
    ).toBe(false);
  });

  test("ex2 - writeJson()/readJson() round-trip through a directory that did not exist", async () => {
    await withTempDir(async (dir) => {
      const file = path.join(dir, "reports", "2026", "q1.json");
      await writeJson(file, { revenue: 12, currency: "EUR" });

      const raw = await readFile(file, "utf8");
      expect(
        raw.endsWith("\n"),
        "end the file with a newline: every other unix tool assumes it, and " +
          "git will tell you off forever if you do not",
      ).toBe(true);
      expect(
        raw,
        "write it indented with two spaces (JSON.stringify takes that as its " +
          "third argument) so a human can read the diff",
      ).toContain('\n  "revenue": 12');

      expect(
        await readJson(file),
        "readJson() gives back exactly what writeJson() put in",
      ).toEqual({ revenue: 12, currency: "EUR" });
    });
  });

  test("ex3 - listJsonFiles() walks the tree and reports portable relative paths", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "a.json", "{}");
      await writeFileIn(dir, "notes.txt", "not json");
      await writeFileIn(dir, "nested/b.json", "{}");
      await writeFileIn(dir, "nested/deep/c.json", "{}");
      await writeFileIn(dir, "nested/deep/skip.md", "# no");

      expect(
        await listJsonFiles(dir),
        "recurse into every subdirectory, keep only .json files, return the " +
          "paths RELATIVE to the directory you were given, with forward " +
          "slashes, sorted",
      ).toEqual(["a.json", "nested/b.json", "nested/deep/c.json"]);

      expect(
        await listJsonFiles(path.join(dir, "nested", "deep")),
        "the same call one level down returns paths relative to THAT directory",
      ).toEqual(["c.json"]);
    });
  });

  test("ex4 - readJsonOr() knows the difference between missing and broken", async () => {
    await withTempDir(async (dir) => {
      const missing = path.join(dir, "settings.json");
      expect(
        await readJsonOr(missing, { theme: "dark" }),
        "a file that is not there is not an error here - that is what the " +
          "fallback is for",
      ).toEqual({ theme: "dark" });

      await writeFileIn(dir, "settings.json", '{"theme":"light"}');
      expect(
        await readJsonOr(missing, { theme: "dark" }),
        "once the file exists, its contents win over the fallback",
      ).toEqual({ theme: "light" });

      const broken = await writeFileIn(dir, "broken.json", "{ not json");
      await expect(
        readJsonOr(broken, { theme: "dark" }),
        "a corrupt file is NOT a missing file. Returning the fallback here " +
          "would hide real damage - only ENOENT gets the fallback treatment",
      ).rejects.toThrow();
    });
  });

  test("challenge - buildIndex() reads a tree, writes a summary and reports the damage", async () => {
    await withTempDir(async (dir) => {
      await writeFileIn(dir, "posts/b.json", '{"id":"b","title":"Backpressure"}');
      await writeFileIn(dir, "posts/a.json", '{"id":"a","title":"Async"}');
      await writeFileIn(dir, "posts/deep/c.json", '{"id":"c","title":"Cause"}');
      await writeFileIn(dir, "posts/readme.md", "ignored");

      const index = await buildIndex(path.join(dir, "posts"));
      expect(
        index,
        "one entry per .json file, sorted by id - and index.json itself must " +
          "not appear (you write it after you read, or you skip it)",
      ).toEqual([
        { id: "a", title: "Async" },
        { id: "b", title: "Backpressure" },
        { id: "c", title: "Cause" },
      ]);

      const written = JSON.parse(
        await readFile(path.join(dir, "posts", "index.json"), "utf8"),
      );
      expect(
        written,
        "index.json holds the same array you returned",
      ).toEqual(index);
    });

    await withTempDir(async (dir) => {
      await writeFileIn(dir, "ok.json", '{"id":"a","title":"Fine"}');
      await writeFileIn(dir, "nested/bad.json", "{ oops");

      const failure = await buildIndex(dir).then(
        () => undefined,
        (error: unknown) => error as Error,
      );
      expect(
        failure,
        "one malformed file must fail the whole build - a half-written index " +
          "is worse than no index",
      ).toBeInstanceOf(Error);
      expect(
        failure?.message,
        "and the message has to name the file, or whoever gets paged at 3am " +
          "has to guess which of 900 files it was",
      ).toContain("nested/bad.json");
    });
  });

  test("review1 - ensureUniqueName() never overwrites what is already there", async () => {
    await withTempDir(async (dir) => {
      expect(
        await ensureUniqueName(dir, "report.json"),
        "nothing is in the way, so the name is returned unchanged",
      ).toBe("report.json");

      await writeFileIn(dir, "report.json", "{}");
      expect(
        await ensureUniqueName(dir, "report.json"),
        "the suffix goes before the extension, not after it: report-1.json, " +
          "never report.json-1",
      ).toBe("report-1.json");

      await writeFileIn(dir, "report-1.json", "{}");
      await writeFileIn(dir, "report-2.json", "{}");
      expect(
        await ensureUniqueName(dir, "report.json"),
        "keep counting until you find a free name",
      ).toBe("report-3.json");

      await writeFileIn(dir, "LICENSE", "");
      expect(
        await ensureUniqueName(dir, "LICENSE"),
        "a file with no extension still gets a suffix",
      ).toBe("LICENSE-1");
    });
  });
});
```

In plain English:

- `withTempDir` creates a fresh directory under the OS temp directory, runs
  your code against it, and removes it in a `finally` — so no test can see
  another test's files and nothing is ever written inside the repo. Steal this
  helper for your own projects.
- **ex1** builds its expectations with `path.sep` and `path.join`, so the same
  assertions pass on Windows and Linux. The `isInside` cases are the two
  attacks and the one boundary condition.
- **ex2** looks at the raw bytes on disk before parsing them: the trailing
  newline and the two-space indent are checked as text.
- **ex3** builds a five-file tree, then calls your function twice — once at
  the root and once one level down — which is how it checks that "relative"
  really means relative to the argument.
- **ex4** runs the same missing file before and after creating it, then feeds
  you a corrupt one and requires a rejection.
- **challenge** checks the returned array, the file that was written, and then
  — in a second temp directory — that a malformed file fails the whole build
  with its name in the message.
- **review1** creates collisions one at a time and checks the names you pick,
  including a file with no extension.

## The teaching point

Two rules will save you more time than anything else in this lesson.

**Never do path arithmetic with string operators.** No `+ "/" +`, no
`.replace("\\", "/")`, no `.split("/")` on a path that came from the
filesystem. `join`, `resolve`, `dirname`, `basename`, `extname`, `parse` and
`relative` cover essentially everything, and they are correct on every
platform. The exception is deliberate normalisation at your program's
boundaries — POSIX separators in JSON output, URLs, and log lines — which is
exactly what ex3 does and why it does it explicitly.

**Handle errors by code, one code at a time.** `ENOENT` usually means "first
run, use the default". `EACCES` almost always means "stop, this is a
deployment problem". `EEXIST` means someone got there first. A `catch` that
treats all of them the same is a `catch` that hides one of them.

Next: **06_buffers_streams**, where files stop being strings you read all at
once and start being bytes that arrive over time.
