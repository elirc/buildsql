# 01 — Modules: two systems, one runtime

Node shipped in 2009 with a module system it invented, because JavaScript did
not have one: `require()`, `module.exports`, and a resolution algorithm that
walks up the directory tree looking for `node_modules`. That system is
CommonJS, and for a decade it *was* server-side JavaScript. Then the language
itself grew modules — `import`/`export`, standardised in ES2015, designed
around static analysis and asynchronous loading — and Node had to support
both, in the same process, forever.

That is why this is lesson 01 and not an appendix. Every real Node codebase
you touch sits somewhere on the migration: an ESM application depending on a
CommonJS library, a CommonJS test runner loading an ESM helper, a package
publishing both from one `package.json`. When something goes wrong the error
messages are unusually bad — `require is not defined`,
`Cannot use import statement outside a module`,
`[ERR_REQUIRE_ESM]` — and they are only decodable if you know which system was
trying to load what.

The two systems differ in ways that matter more than syntax. CommonJS loads
*synchronously*: `require()` reads the file, runs it and hands you the value
right there, which is why you can `require` inside an `if`. ESM loads in two
phases: the runtime parses every module first, links the import graph, and
only then evaluates anything — which is why an ESM import has to sit at the
top level with a literal specifier, and why `import()` (the function form)
exists for the cases where you genuinely need to decide at run time. CommonJS
gives you `__dirname` and `__filename` for free; ESM gives you `import.meta`,
and you build the rest from it. And exactly one thing is the same in both:
**a module is evaluated once per process and cached**, which turns every
module into a singleton whether you meant it to be one or not.

## Concept — what each system hands you

This track runs as ESM. Files end in `.ts`, are treated as modules, and the
following is what you have:

```ts
import path from "node:path";                 // static: hoisted, resolved before anything runs
import { readFile } from "node:fs/promises";  // named import
export const NAME = "01_modules";             // a named export
export default function main() {}             // the default export

import.meta.url;      // "file:///C:/Users/Owner/Desktop/buildsql/tracks/node/lessons/01_modules/gate.test.ts"
```

`import.meta.url` is the ESM replacement for `__filename`, and note that it is
a **URL string**, not a path. On Windows the difference is not cosmetic:
`file:///C:/app/my%20dir/index.js` has a leading slash before the drive letter
and a `%20` where the space is. Converting it by hand — `.replace("file://", "")`
— produces a path that looks right in a demo and fails on the first user whose
name has a space in it. `node:url` exports `fileURLToPath` for this, and its
inverse `pathToFileURL`, and between them they are the only correct answer.

For CommonJS, the shape is:

```js
const path = require("node:path");            // synchronous, returns the exports object
module.exports = { RATES, priceWithTax };     // one object is "the exports"
exports.helper = () => {};                    // sugar for module.exports.helper
__dirname;                                    // the directory, already a path
```

From ESM you can `import` a CommonJS module and Node will give you its
`module.exports` as the **default** export. Named imports from CommonJS work
only when Node's static scan can spot the assignments, which it usually can
and sometimes cannot — a genuinely annoying failure mode. The escape hatch,
and the tool this lesson makes you use, is:

```ts
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const legacy = require("./some-legacy-thing.cjs");   // the real CommonJS require
```

`createRequire` builds a `require` function anchored at a URL you give it, so
relative specifiers resolve the way they would from that file. It is the
supported bridge, not a hack, and it is how you read a JSON file, load a
native addon, or call a package that never made the jump.

The last piece is the module cache. Both systems keep one:

```ts
// counter.ts
let n = 0;
export const bump = () => ++n;

// a.ts:  import { bump } from "./counter";   bump();  // 1
// b.ts:  import { bump } from "./counter";   bump();  // 2  <- same module, same n
```

The module body ran once. Every importer got a reference to the *same*
evaluated module, so `n` is shared process-wide. This is how a database pool
or a config object ends up a singleton without anybody writing a singleton
pattern — and it is also why a module with side effects in its body is a
liability, because you cannot control when, or how often, they happen.

## Exercise 1 — where am I?

Edit `ex1/solution.ts`. Implement `moduleDirname(metaUrl)`, which takes an
`import.meta.url` string and returns the absolute path of the directory that
contains that module:

- `moduleDirname("file:///C:/app/my%20dir/index.js")` → `C:\app\my dir` on Windows
- the same call on Linux → `/C:/app/my dir` (URLs do not know about drive letters)

You do not need to handle the platform difference yourself — one standard
library function does it — but you do need to pick the right one. The gate
checks the path you return actually exists on disk, and separately feeds you a
URL with an encoded space in it.

```
uv run dojo test node 01_modules ex1
```

## Exercise 2 — call the old code

Edit `ex2/solution.ts`. Next to it sits `legacy-pricing.cjs`, a CommonJS
module written years ago that you are not allowed to modify. It exports:

```js
module.exports = { RATES, priceWithTax };
// RATES        = { us: 0.07, de: 0.19, jp: 0.1 }
// priceWithTax = (cents, region) => cents rounded up by that region's rate
```

Implement two functions on top of it:

- `checkout(cents, region)` returns the taxed price by **calling** the legacy
  function — `checkout(1000, "us")` → `1070`, `checkout(2500, "de")` → `2975`.
- `regions()` returns the region codes from `RATES`, sorted:
  `["de", "jp", "us"]`.

Reimplementing the arithmetic instead of calling across the boundary defeats
the exercise, and the gate cannot tell — but you can, and the next legacy
module you meet will have three hundred lines of rules in it rather than one.

```
uv run dojo test node 01_modules ex2
```

## Exercise 3 — one module, one instance

Edit `ex3/solution.ts`. Implement an id issuer:

- `nextId()` returns `"job-1"`, then `"job-2"`, then `"job-3"`, …
- `idsIssued()` returns how many ids have been issued so far.

The gate imports your module twice, under two different local names, and
expects the second import to continue the first one's numbering. Nothing in
your code makes that happen; the runtime makes it happen. Your job is to put
the state where the runtime can share it.

```
uv run dojo test node 01_modules ex3
```

## Exercise 4 — load it when you need it

Edit `ex4/solution.ts`. Two formatter modules live in `ex4/formatters/`, each
default-exporting a function that turns rows into a string. Implement:

```ts
loadFormatter(kind: "json" | "csv"): Promise<Formatter>
```

It must resolve to the module's default export, and it must throw for an
unknown kind with a message containing `unknown formatter: <kind>`.

The catch, and the reason this exercise exists: **a formatter module must not
be evaluated until it is asked for**. Each of those modules registers itself
in a shared registry when its body runs, and the gate checks the registry is
empty before your function is first called, then that it contains exactly the
formatters you loaded, in order. A pair of static imports at the top of your
file fails on the very first assertion.

```
uv run dojo test node 01_modules ex4
```

## Challenge — write the cache yourself

Edit `challenge/solution.ts`. Implement `createModuleCache(load)`, a
memoising loader with the semantics Node's own module cache has:

```ts
const cache = createModuleCache(async (key) => expensiveLoad(key));
cache.get("alpha");   // calls the loader
cache.get("alpha");   // does not
cache.size();         // how many keys are cached
```

Three rules, and the third is the interesting one:

1. Two `get`s for the same key that overlap *in time* must result in exactly
   one call to `load` — the second caller waits on the first caller's work.
2. Once a key has loaded, the loader is never called for it again.
3. If a load **rejects**, the key must not be cached: the next `get` tries
   again. Both callers of a failed load still see the rejection.

Rule 3 mirrors real `require` semantics — a module that throws while being
evaluated is removed from the cache, so the next `require` re-runs it — and it
is the rule people forget, which is how a single blip during start-up becomes
a permanently broken cache entry that only a restart fixes.

Honest difficulty note: rules 1 and 2 are five lines. Rule 3 is where you have
to think about *which* promise you are holding and *what* `.catch()` returns.

```
uv run dojo test node 01_modules challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule once the core
exercises are green; it is the same idea as ex3 in a different shape. Implement
`firstTimeSeeing(token)`, which returns `true` the first time it sees a given
string and `false` every time after, and `seenCount()`, which reports how many
*distinct* tokens the module has seen.

```
uv run dojo test node 01_modules review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

import { moduleDirname } from "./ex1/solution";
import { checkout, regions } from "./ex2/solution";
import * as first from "./ex3/solution";
import * as second from "./ex3/solution";
import { loadFormatter } from "./ex4/solution";
import { loadedFormatters } from "./ex4/formatters/registry";
import { createModuleCache } from "./challenge/solution";
import { firstTimeSeeing, seenCount } from "./review1/solution";

describe("01_modules", () => {
  test("ex1 - moduleDirname() turns a module URL into a real directory path", () => {
    const here = moduleDirname(import.meta.url);
    expect(
      path.isAbsolute(here),
      "the result must be an absolute filesystem path, not a file:// URL - " +
        "node:url has a function for exactly this conversion",
    ).toBe(true);
    expect(
      path.basename(here),
      "the gate module lives in lessons/01_modules, so the directory name is " +
        "01_modules - you returned the wrong level of the path",
    ).toBe("01_modules");
    expect(
      existsSync(here),
      "the path you returned does not exist on disk, so it is not the real " +
        "directory - a hand-rolled string edit of the URL is the usual cause",
    ).toBe(true);

    const spaced = pathToFileURL(path.join(tmpdir(), "my dojo", "app.js")).href;
    expect(
      moduleDirname(spaced),
      "a URL percent-encodes spaces (%20) and prefixes Windows drive letters " +
        "with a slash; only fileURLToPath undoes both - reread README ex1",
    ).toBe(path.join(tmpdir(), "my dojo"));
  });

  test("ex2 - checkout() reaches into a CommonJS module from ESM", () => {
    expect(
      checkout(1000, "us"),
      "1000 cents at the us rate of 0.07 is 1070 - call priceWithTax from " +
        "legacy-pricing.cjs rather than reimplementing it here",
    ).toBe(1070);
    expect(
      checkout(2500, "de"),
      "the German rate is 0.19, so 2500 becomes 2975 - if you got 2500 you " +
        "never reached the CommonJS module",
    ).toBe(2975);
    expect(
      regions(),
      "regions() must read the keys of the RATES object the CommonJS module " +
        "exports, sorted - not a list you typed out yourself",
    ).toEqual(["de", "jp", "us"]);
  });

  test("ex3 - a module is evaluated once and shared by every importer", () => {
    expect(
      first.nextId(),
      "the first id issued in this process must be job-1 - the counter starts " +
        "at 0 when the module body runs",
    ).toBe("job-1");
    expect(
      second.nextId(),
      "`first` and `second` are two imports of the same module, so they share " +
        "one counter: the second call must be job-2, not job-1 again",
    ).toBe("job-2");
    expect(
      first.idsIssued(),
      "idsIssued() reports module-level state, so after two calls it is 2",
    ).toBe(2);
  });

  test("ex4 - loadFormatter() imports the formatter only when it is asked for", async () => {
    expect(
      [...loadedFormatters()],
      "no formatter module may be evaluated before loadFormatter() is called - " +
        "a static import at the top of your file breaks this",
    ).toEqual([]);

    const csv = await loadFormatter("csv");
    expect(
      csv([{ id: 1, name: "widget" }]),
      "loadFormatter() must resolve to the module's *default* export - a " +
        "dynamic import gives you the namespace object, not the function",
    ).toBe("id,name\n1,widget");
    expect(
      [...loadedFormatters()],
      "only the csv module should have been evaluated so far",
    ).toEqual(["csv"]);

    const json = await loadFormatter("json");
    expect(
      json([{ id: 2 }]),
      "the json formatter stringifies the rows it is given",
    ).toBe('[{"id":2}]');
    expect(
      [...loadedFormatters()],
      "now both modules are loaded, in the order they were first requested",
    ).toEqual(["csv", "json"]);

    await expect(
      // @ts-expect-error - deliberately out of range, the way real input is
      loadFormatter("xml"),
      "an unknown kind must reject with an error naming the kind, e.g. " +
        '"unknown formatter: xml" - a silent undefined is worse than a throw',
    ).rejects.toThrow(/unknown formatter: xml/);
  });

  test("challenge - createModuleCache() loads once per key and forgets failures", async () => {
    const calls: string[] = [];
    let settle: (() => void) | undefined;
    const cache = createModuleCache((key: string) => {
      calls.push(key);
      if (key === "broken") return Promise.reject(new Error("load failed"));
      return new Promise<string>((resolve) => {
        settle = () => resolve(`module:${key}`);
      });
    });

    const a = cache.get("alpha");
    const b = cache.get("alpha");
    expect(
      calls,
      "two overlapping gets for the same key must share one in-flight load - " +
        "cache the promise, not just the finished value",
    ).toEqual(["alpha"]);
    settle?.();
    expect(
      [await a, await b],
      "both callers get the same resolved value",
    ).toEqual(["module:alpha", "module:alpha"]);

    await cache.get("alpha");
    expect(
      calls,
      "a resolved key is cached: the third get must not call the loader again",
    ).toEqual(["alpha"]);

    await expect(
      cache.get("broken"),
      "a failing load must reject rather than resolve to undefined",
    ).rejects.toThrow("load failed");
    await expect(
      cache.get("broken"),
      "a failure must NOT be cached - like require(), the entry is dropped so " +
        "the next call retries (README challenge)",
    ).rejects.toThrow("load failed");
    expect(
      calls.filter((key) => key === "broken").length,
      "the broken key should have been attempted twice, once per get",
    ).toBe(2);
    expect(
      cache.size(),
      "only successfully loaded keys stay in the cache, so size() is 1",
    ).toBe(1);
  });

  test("review1 - module state remembers what the process has already seen", () => {
    expect(
      firstTimeSeeing("order-1"),
      "the first sighting of a token is new, so the answer is true",
    ).toBe(true);
    expect(
      firstTimeSeeing("order-1"),
      "the module kept the token in its own state, so the second sighting is " +
        "false - this is the same singleton rule as ex3",
    ).toBe(false);
    expect(
      firstTimeSeeing("order-2"),
      "a different token is new again",
    ).toBe(true);
    expect(
      seenCount(),
      "two distinct tokens have been seen, so seenCount() is 2 - a duplicate " +
        "must not be counted twice",
    ).toBe(2);
  });
});
```

In plain English:

- **ex1** calls your function with the gate's own `import.meta.url` and checks
  three properties of the answer — absolute, named `01_modules`, and actually
  present on disk — then repeats with a URL built by `pathToFileURL` around a
  directory whose name contains a space, which is the case string surgery
  fails on.
- **ex2** checks two prices against the legacy module's rates and the sorted
  key list. If you see `2500` where `2975` was expected, your call never
  crossed into CommonJS.
- **ex3** imports your module twice and interleaves calls between the two
  bindings. `first` and `second` are the same object; the numbering proves it.
- **ex4** watches the shipped registry to see *when* each formatter module was
  evaluated. Empty before the first call, `["csv"]` after one load,
  `["csv","json"]` after two — that ordering is only possible with dynamic
  imports.
- **challenge** counts loader calls (`calls`) rather than inspecting your data
  structure, so any implementation with the right behaviour passes. The last
  two assertions are rule 3: two attempts for `broken`, and a `size()` of 1.
- **review1** is the same singleton rule as ex3, asked as a membership
  question.

## The teaching point

Two systems in one runtime sounds like a transitional embarrassment, and it is
— but the reason it has lasted is worth understanding. CommonJS is
synchronous, which makes it simple and makes it impossible to load over a
network or to tree-shake. ESM is static, which makes bundling and dead-code
elimination possible and makes conditional loading a separate feature. Node
could not drop either one without breaking millions of packages, so it does
what mature platforms do: keeps both, defines the interop rules, and gives you
`createRequire` for the seams.

What you should take into your next codebase is the diagnostic habit. When you
see `require is not defined`, you are in ESM and something wanted CommonJS.
When you see `Cannot use import statement outside a module`, you are in
CommonJS and something wanted ESM. When you see a config object mysteriously
shared between two parts of your app, you have found the module cache. Those
three sentences resolve most module-system bugs before you open a search
engine.

Next: **02_event_loop**, where you learn the order things actually run in —
and get graded on predicting it.
