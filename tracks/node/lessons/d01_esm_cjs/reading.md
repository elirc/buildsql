# Reading - node/d01_esm_cjs

What each of the eight problems was really asking, the mistake that costs
people the question, and one line of the model answer's reasoning.

## Notes

The skill this set drills is a single distinction with many faces: **a name, a
path and a URL are three different things, and Node uses all three at once.**
`import "./util"` is a specifier; what it resolves to is a path; what the ESM
loader actually fetches is a URL. Every problem here lives at one of those
conversion points, or at the older seam beside it — CommonJS, where the unit of
identity is a resolved filename in a cache and an export is a property on a
mutable object rather than a binding into a live module. Two systems, two
notions of identity, and the bugs all come from assuming one while standing in
the other. Answer these eight cold and you can walk into a half-migrated
codebase without flinching.

## ex1 — the URL you were handed is not the path you want

**What it tested:** whether you know that `import.meta.url` is a URL string and
that converting it is a library call, not string surgery.

**The classic mistake:** `metaUrl.replace("file://", "")`. It works on your
Linux laptop, produces `/C:/Users/...` on Windows, and turns `two words` into
`two%20words` on everybody's machine. The bug reaches production because the
happy path has no spaces in it.

**Model answer:** `fileURLToPath` decodes the percent-escapes and strips the
Windows drive prefix, so the whole exercise is that one call plus
`path.dirname`, and `path.join` handles the `..` in the third assertion for
free.

## ex2 — the path you have is not a specifier

**What it tested:** the reverse conversion, and the reason it exists. Dynamic
`import()` takes a *specifier*: a relative path, a bare package name, or a URL.
An absolute Windows path is none of those — `C:\plugins\x.mjs` starts with what
a URL parser reads as a scheme.

**The classic mistake:** `"file://" + absolutePath`. On Windows that yields
`file://C:/...`, where `C:` is parsed as the *host*, and the import fails with a
message about an unsupported URL. Everything after a `#` silently disappears
too.

**Model answer:** `pathToFileURL(p).href` — one call that adds the third slash,
percent-encodes the reserved characters, and gives back a string rather than a
`URL` object, which is what `import()` and the gate both want.

## ex3 — you cannot rewrite everything

**What it tested:** the `createRequire` escape hatch, and the discipline to
*call* the legacy module rather than copy what it does.

**The classic mistake:** two of them. Reimplementing the rules in TypeScript,
which passes today and drifts from the real module next quarter; and
maintaining `["double", "half", "negate"]` as a hand-written list, which is the
same drift in miniature. The gate checks both by asking for the version and the
sorted keys straight off the exports object.

**Model answer:** build the `require` once at module scope from
`import.meta.url`, require once, and delegate — `applyRule` calls the module's
`apply`, so the unknown-rule message belongs to the module that owns the rules.

## ex4 — the cache is the module system

**What it tested:** that `require()` is memoised on the *resolved filename*, so
"the module" and "the object require gives you" are the same thing, and that
the cache is an ordinary object you can delete from.

**The classic mistake:** believing the eviction rewrites what callers already
hold. It does not: `delete require.cache[id]` only changes what the *next*
require returns. A long-lived reference keeps pointing at the old instance, and
two halves of an app can end up talking to different copies of the same module
— which is why hot-reloading with cache busting is a development trick and
never an architecture.

**Model answer:** `require.resolve` produces the key, `require.cache` is the
object it keys, and the whole of `freshRegistry` is a delete followed by the
same require the shared version does.

## ex5 — bindings against photographs

**What it tested:** the deepest behavioural difference between the two systems.
An ESM import is a *live binding* to the exporting module's variable; a
CommonJS export is a property on an object, and destructuring reads that
property exactly once.

**The classic mistake:** assuming the two behave the same, and writing
`const { config } = require("./settings")` at the top of a file, then wondering
why a later `settings.reload()` never seems to take effect. Or the mirror
image: assuming an ESM `import { total }` gives you a snapshot and defensively
re-importing.

**Model answer:** take all three readings, mutate through both modules, read
again — and notice that the destructured local *cannot* be re-read, because
copying was the whole event. That is why its pair is the same number twice.

## ex6 — imports run before your first line does

**What it tested:** module evaluation order — hoisted imports, depth first, in
source order, and each body exactly once per graph.

**The classic mistake:** reading the file top to bottom and expecting the body
to interleave with the imports, or expecting `entry`'s second import of `alpha`
to re-run it. Both produce a plausible-looking wrong array, which is why the
gate reports the first divergent position and nothing else.

**Model answer:** `entry` pulls `beta`, `beta` pulls `alpha` first, so `alpha`'s
body is the first thing that ever runs; `beta`'s body then sees a fully
evaluated `alpha`; the repeats are no-ops; `entry`'s own body is last.

## ex7 — the algorithm behind a one-line import

**What it tested:** whether you can state the CommonJS resolution order
precisely, and whether you can express "does this exist *as a file*" correctly
in async code.

**The classic mistake:** using an existence check that cannot tell a file from a
directory, so `./lib` matches the directory `lib` and returns it — or letting
`stat()`'s rejection escape, which turns a normal miss into a thrown error. A
third, quieter one: alphabetising the extension list, which puts `.cjs` first
and quietly changes which file the whole program loads.

**Model answer:** one `isFile` helper that swallows the `stat` rejection, and
then the candidate list in the order the specification gives — exact, then
extensions, then index files — with the first hit returned.

## ex8 — the map that replaced the algorithm

**What it tested:** the modern `exports` field, which stopped resolution being
"look around the filesystem" and made it "consult a table the package
publishes". Encapsulation arrived with it: anything not listed is genuinely
unreachable, which is why `null` targets exist.

**The classic mistake:** treating patterns as globs that stop at a slash (they
do not — `*` swallows `deep/nested` whole), or checking patterns before exact
keys, which makes a catch-all silently shadow a specialised entry that was
written precisely to override it.

**Model answer:** exact key first, then the single best pattern chosen by
longest literal prefix, then substitute the captured text into the target — and
resolve `null` to `null` only after the winner is chosen, so a blocked path
does not fall through to a broader pattern.

## Further reading

- [Node.js: Modules — ECMAScript modules](https://nodejs.org/api/esm.html) — the loader, `import.meta`, and the file URL rules ex1 and ex2 live on.
- [Node.js: Modules — CommonJS](https://nodejs.org/api/modules.html#all-together) — the resolution algorithm ex7 reimplements, written out step by step.
- [Node.js: `module.createRequire()`](https://nodejs.org/api/module.html#modulecreaterequirefilename) — the escape hatch from ex3 and ex4, including what `require.cache` is.
- [Node.js: Packages — subpath exports](https://nodejs.org/api/packages.html#subpath-exports) — exact keys, patterns and `null` targets, exactly as ex8 models them.
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — the language-level picture behind ex5 and ex6, including live bindings.
