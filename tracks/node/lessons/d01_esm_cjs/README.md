# d01 — ESM and CommonJS

Eight problems on the seam between the two module systems — lesson **01_modules**
is where this was taught, and if the first three feel like guessing, reread it
before you carry on. Nothing here is a trick question: every one of them is a
thing you will actually be asked to do the week you inherit a codebase that was
half-migrated in 2021.

## Problem 1 — a module URL is not a path

Edit `ex1/solution.ts`. `resolveSibling(metaUrl, ...segments)` returns the
absolute filesystem path of `segments` resolved against the directory the module
at `metaUrl` lives in. With no segments it returns that directory itself. It has
to survive a URL containing a percent-encoded space.

```
uv run dojo test node d01_esm_cjs ex1
```

## Problem 2 — a path is not a specifier

Edit `ex2/solution.ts`. `specifierFor(absolutePath)` returns a string that
`import()` will accept on every platform. A space must come back as `%20`, a `#`
as `%23`, and the result must round-trip through `fileURLToPath` to the exact
path you were given.

```
uv run dojo test node d01_esm_cjs ex2
```

## Problem 3 — call the CommonJS module you cannot rewrite

Edit `ex3/solution.ts`. `ex3/legacy-rules.cjs` exports `{ VERSION, RULES, apply }`
and you may not touch it. Export `legacyVersion()` (its `VERSION`), `ruleNames()`
(the keys of its `RULES`, sorted) and `applyRule(name, value)` (a call into its
`apply`, so an unknown rule fails with its message, `unknown rule: triple`).

```
uv run dojo test node d01_esm_cjs ex3
```

## Problem 4 — the require cache, and evicting from it

Edit `ex4/solution.ts`. `ex4/registry.cjs` keeps a list. `sharedRegistry()`
returns the cached instance — the same object on every call. `freshRegistry()`
evicts that module from the cache and loads it again, returning a brand-new
object with an empty list, without disturbing the object anybody already holds.

```
uv run dojo test node d01_esm_cjs ex4
```

## Problem 5 — live bindings versus copied values

Edit `ex5/solution.ts`. `ex5/tally.ts` and `ex5/tally.cjs` hold the same counter
in the two module systems. `readTwice()` reads the total three ways — through the
ESM import, through a name destructured out of the `require()`, and as a property
of the `require()`d object — then adds 5 through **both** modules and reads all
three again, returning `{ esm, cjsCopy, cjsProperty }` as `[before, after]` pairs.

```
uv run dojo test node d01_esm_cjs ex5
```

## Problem 6 — what order do module bodies run in

Edit `ex6/solution.ts`. Four fixtures sit next to it: `trace.ts` holds a shared
array, `alpha.ts` and `beta.ts` push a label as their bodies run, and `entry.ts`
imports them. The listings are in the file. `predictEvaluationOrder()` returns
the labels in the order they land in `trace`. The gate imports `entry` for real
and reports the first position you got wrong — never what belonged there.

```
uv run dojo test node d01_esm_cjs ex6
```

## Problem 7 — implement the CommonJS lookup

Edit `ex7/solution.ts`. `resolveSpecifier(dir, specifier)` resolves a relative
specifier inside one directory the way `require()` does: the path exactly as
written, then `.js`, `.json`, `.cjs`, then `index.js` and `index.json` inside it
if it names a directory. It returns the absolute path, or `null`. A file beats a
directory of the same name.

```
uv run dojo test node d01_esm_cjs ex7
```

## Problem 8 — implement the modern replacement

Edit `ex8/solution.ts`. `resolveExports(field, subpath)` resolves a subpath
against a `package.json` `exports` field. A bare string publishes only `.`. An
object may hold exact keys, `*` patterns (which match slashes), and `null`
targets meaning *blocked*. An exact key beats any pattern; among patterns, the
longest literal prefix wins. Anything unmatched is `null`.

```
uv run dojo test node d01_esm_cjs ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d01_esm_cjs. Quoted verbatim in README.md.
//
// Eight problems on the seam between the two module systems. Everything here
// is deterministic: paths are built with node:path so they hold on Windows and
// on Linux alike, the filesystem problem gets its own mkdtemp directory, and
// the module-evaluation problem reads a trace the fixtures wrote themselves
// rather than measuring anything.
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

import { resolveSibling } from "./ex1/solution";
import { specifierFor } from "./ex2/solution";
import { applyRule, legacyVersion, ruleNames } from "./ex3/solution";
import { freshRegistry, sharedRegistry } from "./ex4/solution";
import { readTwice } from "./ex5/solution";
import { predictEvaluationOrder } from "./ex6/solution";
import { trace } from "./ex6/trace";
import "./ex6/entry";
import { resolveSpecifier } from "./ex7/solution";
import { resolveExports } from "./ex8/solution";

const here = path.dirname(fileURLToPath(import.meta.url));

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-d01-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function touch(dir: string, relative: string): Promise<string> {
  const file = path.join(dir, ...relative.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, "// fixture\n", "utf8");
  return file;
}

describe("d01_esm_cjs", () => {
  test("ex1 - resolveSibling() turns a module URL into a real directory path", () => {
    expect(
      resolveSibling(import.meta.url, "ex1", "solution.ts"),
      "the gate module lives in the lesson directory, so a sibling of it is " +
        "that directory joined with the segments you were given",
    ).toBe(path.join(here, "ex1", "solution.ts"));

    expect(
      resolveSibling(import.meta.url),
      "with no segments the answer is the module directory itself, not the " +
        "module file",
    ).toBe(here);

    const spaced = pathToFileURL(path.join(tmpdir(), "two words", "app.js")).href;
    expect(
      resolveSibling(spaced, "..", "sibling.json"),
      "a file URL percent-encodes a space as %20 and prefixes a Windows drive " +
        "letter with a slash. Only fileURLToPath undoes both - slicing the " +
        "string yourself is the classic wrong answer",
    ).toBe(path.join(tmpdir(), "sibling.json"));
  });

  test("ex2 - specifierFor() makes a path importable", () => {
    const plain = path.join(tmpdir(), "plugins", "reporter.mjs");
    expect(
      fileURLToPath(specifierFor(plain)),
      "the specifier has to round-trip: converting it back must give the " +
        "exact path you were handed",
    ).toBe(plain);
    expect(
      specifierFor(plain).startsWith("file:///"),
      "a specifier for a filesystem path is a file URL, and a file URL has " +
        "three slashes: the empty host sits between the second and the third",
    ).toBe(true);

    const awkward = path.join(tmpdir(), "my plugins", "a#b", "index.mjs");
    const specifier = specifierFor(awkward);
    expect(
      specifier.includes("%20"),
      "a space is not legal in a URL. String concatenation leaves it there " +
        "and the import fails at runtime on somebody else machine",
    ).toBe(true);
    expect(
      specifier.includes("%23"),
      "a # in a path is a fragment marker in a URL: everything after it would " +
        "be silently dropped unless it is encoded",
    ).toBe(true);
    expect(
      fileURLToPath(specifier),
      "and it still has to round-trip after all that encoding",
    ).toBe(awkward);
  });

  test("ex3 - the legacy CommonJS rules are reached, not reimplemented", () => {
    expect(
      legacyVersion(),
      "read VERSION off the CommonJS module rather than typing the string here",
    ).toBe("1.4.0");
    expect(
      ruleNames(),
      "the names come from the RULES object the .cjs file exports, sorted - " +
        "not from a list you maintain in parallel",
    ).toEqual(["double", "half", "negate"]);

    expect(applyRule("double", 21), "double(21) is 42").toBe(42);
    expect(applyRule("half", 9), "half(9) is 4.5").toBe(4.5);
    expect(applyRule("negate", 7), "negate(7) is -7").toBe(-7);

    expect(
      () => applyRule("triple", 1),
      "delegate to the module apply(), so an unknown rule fails the way the " +
        "legacy module already decided it should",
    ).toThrow("unknown rule: triple");
  });

  test("ex4 - the require cache hands out one object until you evict it", () => {
    const first = sharedRegistry();
    expect(
      sharedRegistry(),
      "require() caches by resolved filename, so the second call gives back " +
        "the very same exports object - not a copy of it",
    ).toBe(first);

    first.add("alpha");
    expect(
      sharedRegistry().entries,
      "which means module state is shared: everyone who requires it sees the " +
        "entry that was just pushed",
    ).toEqual(["alpha"]);

    const fresh = freshRegistry();
    expect(
      fresh,
      "evicting the entry from require.cache and requiring again re-runs the " +
        "module body, so this must be a different object",
    ).not.toBe(first);
    expect(fresh.entries, "a re-run module starts from scratch").toEqual([]);
    expect(
      first.entries,
      "and the object handed out earlier is untouched - references already " +
        "given away do not follow the cache",
    ).toEqual(["alpha"]);

    expect(
      freshRegistry(),
      "every eviction produces another new instance, which is exactly why " +
        "cache busting is a debugging tool and not an architecture",
    ).not.toBe(fresh);
  });

  test("ex5 - an ESM binding is live and a destructured require is a photograph", () => {
    expect(
      readTwice(),
      "an ESM import is a live binding: reading total again after add(5) " +
        "gives 5. Pulling the same name out of a require() with destructuring " +
        "copies the value once and never looks again, so it stays 0 - while " +
        "reading it as a property of the exports object sees the update",
    ).toEqual({
      esm: [0, 5],
      cjsCopy: [0, 0],
      cjsProperty: [0, 5],
    });
  });

  test("ex6 - predictEvaluationOrder() knows imports run before the body", () => {
    const predicted = predictEvaluationOrder();
    expect(
      Array.isArray(predicted) && predicted.length === trace.length,
      `predictEvaluationOrder() returns one label per module body that ran; ` +
        `you returned ${Array.isArray(predicted) ? predicted.length : "not an array"}`,
    ).toBe(true);
    const at = trace.findIndex((label, i) => predicted[i] !== label);
    expect(
      at,
      `the first ${at} label(s) are right, then position ${at} diverges (you ` +
        `predicted "${predicted[at]}"). Import declarations are hoisted and ` +
        `evaluated depth first, in source order, and a module already ` +
        `evaluated is never evaluated again`,
    ).toBe(-1);
  });

  test("ex7 - resolveSpecifier() follows the CommonJS lookup order", async () => {
    await withTempDir(async (dir) => {
      await touch(dir, "util.js");
      expect(
        await resolveSpecifier(dir, "./util"),
        "the plain case: no extension in the specifier, util.js on disk",
      ).toBe(path.join(dir, "util.js"));

      await touch(dir, "data.json");
      await touch(dir, "data.js");
      expect(
        await resolveSpecifier(dir, "./data"),
        "the extension order is .js, .json, .cjs - the first hit wins, and it " +
          "is not the alphabetical one",
      ).toBe(path.join(dir, "data.js"));

      await touch(dir, "lib/index.js");
      expect(
        await resolveSpecifier(dir, "./lib"),
        "a directory falls back to its index file",
      ).toBe(path.join(dir, "lib", "index.js"));

      await touch(dir, "lib.js");
      expect(
        await resolveSpecifier(dir, "./lib"),
        "and a file beats a directory of the same name: lib.js wins over " +
          "lib/index.js, which is the rule people are surprised by",
      ).toBe(path.join(dir, "lib.js"));

      await touch(dir, "notes.md");
      expect(
        await resolveSpecifier(dir, "./notes.md"),
        "a specifier that already names an existing file resolves to it as it " +
          "is, whatever the extension",
      ).toBe(path.join(dir, "notes.md"));

      await mkdir(path.join(dir, "empty"), { recursive: true });
      expect(
        await resolveSpecifier(dir, "./empty"),
        "a directory with no index file resolves to nothing - null, not a throw",
      ).toBe(null);
      expect(
        await resolveSpecifier(dir, "./missing"),
        "and neither does a name with nothing behind it",
      ).toBe(null);
    });
  });

  test("ex8 - resolveExports() reads a package subpath map", () => {
    expect(
      resolveExports("./dist/index.js", "."),
      "the string form of exports is shorthand for the main entry point",
    ).toBe("./dist/index.js");
    expect(
      resolveExports("./dist/index.js", "./parser"),
      "...and it publishes nothing else, so every other subpath is blocked",
    ).toBe(null);

    const field = {
      ".": "./dist/index.js",
      "./parser": "./dist/parser.js",
      "./features/legacy": "./dist/legacy.js",
      "./features/*": "./dist/features/*.js",
      "./internal/*": null,
    };
    expect(resolveExports(field, "."), "the main entry, spelled out").toBe(
      "./dist/index.js",
    );
    expect(resolveExports(field, "./parser"), "an exact subpath").toBe(
      "./dist/parser.js",
    );
    expect(
      resolveExports(field, "./features/json"),
      "the star stands for whatever the caller asked for, substituted into " +
        "the target",
    ).toBe("./dist/features/json.js");
    expect(
      resolveExports(field, "./features/deep/nested"),
      "the star is not a path segment - it matches slashes too",
    ).toBe("./dist/features/deep/nested.js");
    expect(
      resolveExports(field, "./features/legacy"),
      "an exact key always beats a pattern that would also have matched",
    ).toBe("./dist/legacy.js");
    expect(
      resolveExports(field, "./internal/secret"),
      "a null target is how a package says this path exists and you may not " +
        "have it",
    ).toBe(null);
    expect(
      resolveExports(field, "./nope"),
      "and an unmatched subpath is simply not exported",
    ).toBe(null);

    const nested = { "./a/*": "./x/*.js", "./a/b/*": "./y/*.js" };
    expect(
      resolveExports(nested, "./a/b/c"),
      "when two patterns match, the one with the longer literal prefix wins - " +
        "otherwise a catch-all would swallow every specialisation below it",
    ).toBe("./y/c.js");
  });
});
```

In plain English:

- **ex1** checks a normal join, the no-segments case, and a URL with a space in
  it that only `fileURLToPath` decodes correctly.
- **ex2** round-trips the specifier back to a path and looks for `%20` and `%23`
  in the middle.
- **ex3** reads the version, the sorted rule names, three rule results, and the
  legacy module's own error message.
- **ex4** proves two calls share one object, mutates it, then evicts and checks
  the new instance is empty while the old reference is unchanged.
- **ex5** compares all three readings before and after the same `+5`.
- **ex6** imports the fixture graph for real and reports the first divergence.
- **ex7** builds a directory containing every ambiguous case in turn — extension
  order, index fallback, file-beats-directory, and two misses.
- **ex8** walks the string form, exact keys, wildcards over multiple segments,
  the exact-beats-pattern rule, a `null` target and the longest-prefix tie-break.

Next: **d02_module_patterns**, the same modules used to build things.
