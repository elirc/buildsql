# Reading - node/d13_path_portability

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **knowing which kind of path you are holding**. There
are only two, and every bug in this set is a confusion between them: a
*filesystem* path, whose separator is `path.sep` and whose meaning depends on
the platform and the working directory, and a *portable* path — the forward
-slash string you put in a URL, a manifest, a glob or a log line. `node:path`
converts between them and nothing else does. Four of the eight answers are the
same three lines — resolve, take the relative path, look at its first segment —
because "is this path inside that one" is the question underneath containment,
relocation and traversal defence alike. The other four are about the difference
between a string operation that usually works and a segment operation that
always does.

## ex1 — path.sep is not a slash

**What it tested:** that you convert on purpose at the boundary, rather than
hoping the platform separator is the one the consumer wants.

**The classic mistake:** `path.relative(...).replace(/\\/g, "/")`, which is
correct and also unfalsifiable — on Linux it is a no-op, so a mistake in it
survives every CI run and surfaces only when a colleague on Windows opens the
generated site and every link is dead. Splitting on `path.sep` and joining with
`/` says what you mean on both platforms.

**Model answer:** one `path.relative`, one split-join, and a named case for the
empty string, because "the same directory" is a real answer and `href=""` is not.

## ex2 — parse and format are inverses, with one trap

**What it tested:** that the extension rule (last dot onwards, and a leading dot
is not an extension) belongs to `node:path`, not to your regular expression.

**The classic mistake:** `path.format({ ...path.parse(file), ext: ".md" })`.
`format` prefers `base` over `name` + `ext`, so the spread quietly wins and the
function returns its input unchanged — a bug that looks like the build cache
misbehaving. The other one is `file.replace(/\.[^.]+$/, ext)`, which mangles a
directory called `v1.2` on a file with no extension.

**Model answer:** parse, rebuild from `dir` + `name` + `ext` explicitly, and
normalise the caller's dot before formatting rather than during.

## ex3 — the traversal defence, in the constructive direction

**What it tested:** the one security-relevant function in the set. Lesson 05
asked you to *judge* whether a path was inside a base; this asks you to *build*
one that is, from segments a client controls.

**The classic mistake:** filtering the segments — rejecting anything containing
`..` — instead of resolving and then judging. Encodings, doubled dots and
absolute segments all get past a filter, and `path.resolve` throws away
everything to the left of an absolute argument, so a single `/etc/passwd`
segment defeats it entirely. The subtler one is `relative.startsWith("..")`,
which also rejects the perfectly ordinary directory `..config`.

**Model answer:** resolve to one normalised absolute path, then ask
`path.relative` where it landed and look at its **first segment** — never at its
first two characters.

## ex4 — segments, not characters

**What it tested:** longest common prefix, on the right alphabet.

**The classic mistake:** comparing the strings character by character. It gives
`/var/log` as the common ancestor of `/var/log` and `/var/logging`, which is not
an ancestor of the second one at all — and the caller then chdirs into it, or
watches it, or deletes it.

**Model answer:** `path.resolve` everything first, because two relative paths
have no relationship until they do; split on `path.sep`; fold the running prefix
down; and remember that an absolute POSIX path's first segment is the empty
string, so the join needs a fallback for the root.

## ex5 — a link is not a path

**What it tested:** the boundary in the other direction. The document is a file
and the link is a URL, and the two obey different rules for separators,
escaping, and what "absolute" means.

**The classic mistake:** `path.resolve(fromFile, link)` — resolving against the
file rather than its directory, so every link lands one level too deep. Close
behind: forgetting that `#anchor` and `?raw=1` are not part of the filename, and
treating `/downloads/report.pdf` as a local path when it is relative to a web
root this function has never heard of.

**Model answer:** reject by prefix first (scheme, `//`, `/`, `#`), then strip
the fragment and query, then `decodeURIComponent`, then resolve against
`path.dirname(fromFile)` with the segments split on `/`.

## ex6 — relative first, always

**What it tested:** the ex3 containment test and the ex2 extension swap in the
same function, which is exactly how a build tool uses them.

**The classic mistake:** `path.join(outRoot, file)`. It runs, it produces a
path, and the output tree ends up containing a copy of the absolute source path
— `dist/home/ada/work/site/pages/index.html`. Also common: treating `ext: ""`
and a missing `ext` as the same request, when one removes the extension and the
other keeps it.

**Model answer:** relative, containment check, join, and only then the optional
format — with `options.ext === undefined` as the test, because `??` cannot tell
"absent" from "deliberately empty".

## ex7 — one star and two stars are different languages

**What it tested:** that `**` is not "a `*` that also matches slashes". It
consumes whole segments, an unknown number of them, which makes matching a
backtracking search rather than a scan.

**The classic mistake:** compiling the whole pattern into one regular expression
with `*` → `.*`. That makes `*.md` match `docs/readme.md`, so an ignore rule
meant for the repository root swallows the tree. The second mistake is writing
`**` as one-or-more segments, which stops `**/*.test.ts` from finding the test
file at the top level — and nobody notices, because the suite still passes with
fewer files in it.

**Model answer:** recurse over `(patternIndex, fileIndex)`; at a `**`, try every
number of segments starting at **zero**; and compile a single segment to a
regular expression whose wildcard is `[^/]*`.

## ex8 — the tab-title problem

**What it tested:** independence. Each path's label is decided against the whole
list, and two paths in one list routinely need different lengths.

**The classic mistake:** picking one length for everybody — the length the worst
case needs — which turns a readable list into `src/api/index.ts` and
`src/web/index.ts` when `api/index.ts` and `web/index.ts` would have done. The
other is comparing a suffix against *all* paths including the path itself, so
nothing is ever unique and every label is the whole path.

**Model answer:** grow the suffix one segment at a time, stop at the first
length no **other** path can produce, and let a path shorter than the current
length compare as its whole self.

## Further reading

- [Node.js: `node:path`](https://nodejs.org/api/path.html) — `sep`, `relative`, `resolve`, `parse`, `format`, and the `path.posix` / `path.win32` variants for when you need the other platform's rules on purpose.
- [Node.js: `path.relative()`](https://nodejs.org/api/path.html#pathrelativefrom-to) — the function four of these answers are built on, including what it returns when the two paths are equal.
- [MDN: `decodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) — percent-decoding for ex5, and the `URIError` it throws on a malformed escape.
- [MDN: Relative references](https://developer.mozilla.org/en-US/docs/Web/URI/Reference) — what "absolute", "protocol-relative" and "fragment" mean before they reach your resolver.
- [Node.js: `fileURLToPath()`](https://nodejs.org/api/url.html#urlfileurltopathurl-options) — the conversion this set deliberately does not use, and the only correct way to turn a `file:` URL into a path.
