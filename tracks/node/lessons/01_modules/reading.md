# Reading - node/01_modules

Modules are the part of Node that people learn by accident, from error
messages, over years. Reading the model once — deliberately — is much cheaper.

## Notes

**Two loaders, one process.** CommonJS resolves and evaluates in a single
synchronous pass: `require("./x")` finds the file, wraps its source in a
function `(exports, require, module, __filename, __dirname) => {...}`, runs
it, and returns `module.exports`. That wrapper is why `__dirname` exists and
why the top level of a CommonJS file is not really the top level. ESM works in
three phases instead — construction (find and parse every module reachable
from the entry, building a graph), instantiation (link the imports and exports
so each binding points at the right slot), evaluation (run the bodies, deepest
first). Static analysis of the graph before any code runs is exactly what
makes tree-shaking and top-level `await` possible, and exactly what makes
`import x from someVariable` impossible.

**Live bindings, not copies.** An ESM named import is a *view* of the
exporting module's variable, so if the exporter reassigns it, the importer
sees the new value. A CommonJS `require` gives you the value of
`module.exports` at the moment you asked; if the exporter later reassigns
`module.exports`, you keep the old object. The difference shows up in circular
imports: ESM can survive a cycle where CommonJS hands you a half-built
`exports` object. Do not build architectures on either behaviour — but do
recognise the symptom, because "the value was there a second ago" is what a
cycle looks like from inside.

**Resolution, briefly.** For a bare specifier (`"express"`), Node walks up
from the importing file through every `node_modules` directory until it finds
a match, then consults that package's `package.json` — `exports` first
(which can map, and can *block*, subpaths), then `main`, then index files.
For a relative specifier, ESM requires the extension (`./util.js`, not
`./util`), because guessing extensions requires filesystem probing that the
spec deliberately excludes. In this course a bundler-style resolver is
configured for you, which is why the gates import `./ex1/solution` with no
suffix; plain Node would want the extension.

**`.mjs`, `.cjs`, and `"type"`.** A `.mjs` file is always ESM and a `.cjs`
file is always CommonJS, whatever anything says. A plain `.js` file is ESM if
the nearest `package.json` says `"type": "module"` and CommonJS otherwise —
which is why adding one line to a `package.json` can break a whole directory
of files, and why library authors reach for the explicit extensions.

**Everything is cached.** CommonJS keeps `require.cache`, keyed by resolved
absolute filename; ESM keeps an internal module registry keyed by resolved
URL. Either way the body runs once. You can delete a `require.cache` entry to
force a re-evaluation (test frameworks used to do this constantly); there is
no supported way to do it in ESM, which is why vitest gives each *test file*
its own module registry rather than trying to unload modules. That isolation
is also why the ex3 counter starts at 1 every time you run the gate, no
matter how many times you have run it before.

## ex1 — a URL is not a path

The exercise looks like string manipulation and is really about a category
error. `import.meta.url` is a URL: a percent-encoded, forward-slashed,
scheme-prefixed identifier that is legal to hand to `fetch` and illegal to
hand to `fs.readFile`. A filesystem path is platform-specific bytes with a
separator that is `\` on Windows. `fileURLToPath` is the only correct bridge,
and `pathToFileURL` is the way back.

The three checks in the gate correspond to the three ways the string-surgery
version fails. Slicing off `"file://"` leaves `/C:/app/...` on Windows, which
is not absolute in the way Windows means it. Forgetting to decode leaves
`%20` where a space belongs, so the path does not exist. And taking the wrong
level of the path — `basename` instead of `dirname` — gives you a plausible
string that points at nothing.

The interview version of this question is "how do you get `__dirname` in
ESM?", and the answer worth memorising is one line:

```ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

The classic follow-up is "and why did they not just keep `__dirname`?" —
because ESM modules are specified in terms of URLs, and a module might not
have come from a filesystem at all. Recent Node versions do add
`import.meta.dirname` and `import.meta.filename` as conveniences, which is
worth mentioning as the modern shortcut; know the `fileURLToPath` form anyway,
because it is what every codebase written before that shortcut uses.

## ex2 — the bridge to CommonJS

`createRequire(url)` builds a real CommonJS `require` whose resolution base is
the URL you pass. That is the whole trick, and the reason the argument is
usually `import.meta.url`: you want relative specifiers to mean "relative to
this file". Pass something else and `./legacy-pricing.cjs` resolves somewhere
else — which is occasionally what you want, and usually a bug.

Three things `createRequire` is genuinely used for in production. Loading a
CommonJS-only dependency whose named exports Node cannot statically detect.
Reading a JSON file synchronously at start-up (`require("./config.json")`)
without waiting for import attributes to be everywhere. And getting a
package's own `package.json` — `require("some-pkg/package.json")` — which
several tools do to read a version number.

The performance footnote people ask about: doing the `require` once at module
scope, as the reference does, is not about the file read. It is about not
paying for the cache lookup and the resolution on every call, and about
failing loudly at import time rather than deep inside a request handler if the
module is missing. Start-up is the right place for start-up failures.

## ex3 — the accidental singleton

Every module is a singleton. That sentence explains a surprising amount of
real-world Node behaviour: why a `pool` exported from `db.ts` is shared by
every route file; why a module-level `let currentUser` is a security incident
waiting to happen in a server that handles more than one request; why two
copies of the same library at different versions in `node_modules` produce
"instanceof returns false for a thing that obviously is one".

The gate demonstrates it with two imports of one module, but the more useful
mental model is: the registry is keyed by *resolved URL*, so two specifiers
that resolve to the same file share state, and two that do not — a symlinked
copy, a differently-cased path on a case-insensitive filesystem, the same
package installed twice — do not.

Where this bites in interviews: "how would you implement a singleton in
Node?" The strong answer is that you rarely need a pattern for it, because
module semantics already give you one; you export the instance (or a factory
memoised at module scope) and the cache does the rest. The follow-up is "and
what is the risk?", and the answer is testability — module-level state
persists between tests in the same file, so anything stateful needs a reset
hook or per-test isolation, which is exactly why vitest isolates by file.

## ex4 — importing on purpose

`import()` — the function, not the statement — returns a promise for the
module namespace. It is the escape hatch from the static graph, and it exists
for three real reasons: loading something only under a condition (a plugin, a
platform-specific implementation), deferring an expensive module until it is
needed (start-up time), and loading a module whose specifier is only known at
run time.

The registry trick the gate uses is worth stealing. Side effects in a module
body are normally invisible — you cannot easily prove *when* a module was
evaluated — and the way to make it visible is to have the module record its
own evaluation. This is also how "why is my start-up 900 ms" investigations
go: instrument module bodies, discover that importing a CLI framework at the
top of a lambda handler costs 300 ms whether or not the CLI is used.

The most common mistake, and the one worth carrying into a code review: the
namespace object is not the default export. `const mod = await import("./x")`
then `mod.default` for a default-exported function, `mod.thing` for a named
one. People destructure `const { default: format } = await import(...)`, which
is the same thing with better ergonomics.

## challenge — cache the promise, not the value

This is a small exercise with a big idea in it: **in an async world, the unit
of caching is the promise**. Caching resolved values leaves a window — from
the first call until the first resolution — during which a second caller sees
an empty cache and starts a duplicate load. Under concurrency that window is
where your thundering herd lives: fifty requests arrive, the cache is cold,
fifty database queries go out for the same row. Storing the in-flight promise
closes the window because the promise exists immediately.

Rule 3 is the counterweight. If failures are cached, one transient error is
permanent until restart. Node's own `require` gets this right: a module that
throws during evaluation is deleted from the cache, so the next `require`
re-evaluates it — and if you have ever seen a module "work on the second try",
that is why. The implementation detail that catches people is that
`pending.catch(fn)` returns a *new* promise; the caller must still receive the
original, or the rejection is swallowed and the caller sees `undefined`. The
guard `if (entries.get(key) === pending)` matters for the same reason a
compare-and-swap does: by the time your handler runs, someone may already have
stored a newer attempt.

## review1 — the same rule, a different question

`firstTimeSeeing` is deduplication, which is the shape module state most often
takes in production: a `Set` of processed message ids so a retried webhook is
not applied twice, a `Map` of rate-limit counters, a memo of expensive lookups.
Writing it again from scratch is the point — the review ladder exists because
you remember what you re-derive, not what you recognise.

Two footnotes. A `Set` is the right structure because membership on an array
is a linear scan and gets slow exactly when the set gets big. And a
process-lifetime `Set` grows forever, which is fine for a test and a slow
memory leak in a server: real deduplication caches have a bound (an LRU) or a
TTL, and "how would you keep this from growing without limit?" is the natural
follow-up question in an interview.

## Further reading

- [Modules: Packages](https://nodejs.org/api/packages.html) — the official rules for `"type"`, `exports`, dual packages and interop. Dense, and the source of truth.
- [Modules: ECMAScript modules](https://nodejs.org/api/esm.html) — `import.meta`, resolution, and the CommonJS interop section you will come back to.
- [`module.createRequire()`](https://nodejs.org/api/module.html#modulecreaterequirefilename) — the bridge from ex2, in the API docs.
- [MDN: `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) — dynamic import, including what the namespace object contains.
- [MDN: `Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) — for review1, and for every deduplication you write from here on.
