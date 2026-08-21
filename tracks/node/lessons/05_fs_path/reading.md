# Reading - node/05_fs_path

The filesystem is where a Node program meets the operating system, and where
"it works on my machine" is born.

## Notes

**Three APIs, one filesystem.** `node:fs` exposes callbacks
(`fs.readFile(path, cb)`), promises (`fs/promises`), and synchronous
(`fs.readFileSync`). They do the same work through the same libuv machinery;
what differs is who waits. The promise API is the default for new code. The
sync API is legitimate in exactly two places: a CLI that has nothing else to
do, and a server's start-up path before it accepts connections. Anywhere else
it blocks the event loop for the whole duration of a disk operation — which on
a cold cache or a network filesystem can be tens of milliseconds, during which
your server answers nobody.

**libuv uses a thread pool for file I/O.** Sockets get real asynchronous
notification from the OS (epoll/kqueue/IOCP), but file operations do not have
a portable async interface, so libuv runs them on a pool of four threads by
default (`UV_THREADPOOL_SIZE`). This is why a burst of file reads can queue
behind each other while HTTP requests keep flowing, and why the answer to
"should I raise the thread pool size?" is "measure first". `crypto.pbkdf2`,
`zlib` and DNS lookups share that pool, which is a genuinely surprising
interaction and a good interview aside.

**Paths are not strings, and `..` is the enemy.** Path traversal — a
user-supplied name containing `../` that escapes the directory you meant —
remains one of the most commonly exploited web vulnerabilities. The defence is
always the same shape: resolve the candidate to an absolute path, then prove
it is inside the base directory before touching it. Never compare with
`startsWith` on the raw strings (`/uploads-secret` starts with `/uploads`),
and remember that on Windows a path can also escape by changing drive.

**Encoding matters more than it looks.** `readFile(file)` without an encoding
returns a `Buffer`; with `"utf8"` it returns a string, decoded. That decode is
not free and it is not always safe: a multi-byte character split across two
reads decodes to a replacement character, which is why streaming text needs
`StringDecoder` (next lesson). For binary — images, archives, hashes — stay in
`Buffer` and never let a string near it.

**Atomic-ish writes.** `writeFile` truncates the target and then writes; a
crash halfway leaves a truncated file. The standard trick is to write to a
temp file in the same directory and `rename` it over the target, because
`rename` within a filesystem is atomic. Worth knowing when a config file
matters, and a good answer to "how would you make sure a reader never sees a
half-written file?".

**Watch out for `existsSync` before an operation.** The classic
`if (existsSync(f)) readFileSync(f)` is a TOCTOU race: the file can vanish
between the two calls. The correct pattern is to attempt the operation and
handle `ENOENT`, which is exactly what ex4 makes you write.

## ex1 — the six functions worth memorising

`join`, `resolve`, `dirname`, `basename`, `extname`, `parse`, `relative`. That
is most of `node:path`, and knowing them cold removes the temptation to do
string surgery.

Two subtleties in this exercise. `extname` takes the **last** dot onwards, so
`archive.tar.gz` has extension `.gz` and `.gitignore` — a dotfile — has
extension `""` with a name of `.gitignore`, which surprises people. And
`path.relative` answers a question people do not realise they are asking: it
returns the route from A to B, so a route that never goes up means B is
underneath A. That is a much better containment test than any string
comparison, and it handles normalisation (`a/b/../b/c`) for free.

The path-traversal check is worth remembering as a snippet, because you will
need it whenever a filename comes from outside:

```ts
const target = path.resolve(baseDir, userSuppliedName);
const relative = path.relative(baseDir, target);
if (relative.startsWith("..") || path.isAbsolute(relative)) throw new ForbiddenError();
```

The follow-up an interviewer asks: "and what about symlinks?" A symlink inside
the base can point outside it, and the resolution above will not notice.
`fs.realpath` resolves links; whether you need it depends on whether the
directory is user-writable.

## ex2 — the round trip, and the two-space indent

The interesting part is `mkdir(dir, { recursive: true })`, which is both "make
the whole chain of directories" and "do not complain if it is already there".
Before it existed, every codebase had a `mkdirp` dependency and a subtly wrong
`existsSync` check; it is one of the clearest examples of the standard library
absorbing a lesson from the ecosystem.

The formatting details are not fussiness. Two-space indentation means a config
file produces a readable diff when someone changes one field, rather than one
enormous line. The trailing newline means `cat` does not leave your prompt
mid-line, `git` does not report "\ No newline at end of file" forever, and
line-oriented tools count the last line. Both are conventions, both are free,
and both are noticed when missing.

The type-level footnote: `readJson<T>` returns `Promise<T>` while `JSON.parse`
returns `any`. That cast is a promise you are making without evidence. It is
acceptable in a course exercise and it is how a surprising amount of
production code reads external data — until the day the shape changes. The
grown-up answer is a runtime schema check, which is what zod does in lesson
10, and the reason people describe it as "the type you can actually trust".

## ex3 — recursion, and the separator question

`readdir` with `withFileTypes: true` is the efficient shape: one syscall gives
you names *and* types, where the alternative is a `stat` per entry. (Node also
offers `readdir(dir, { recursive: true })` now, which does the walk for you —
write it by hand once, then use the built-in.)

The separator normalisation is a real convention, not a test artefact.
Anything that leaves your process — a JSON manifest, a URL, a log line, a
cache key — is better off with forward slashes, because that string may be
read on a different platform than the one that wrote it. Anything that goes
back into `fs` should be reassembled with `path.join`. Normalise at the
boundary, keep the inside consistent.

Two production notes. Directory trees can be deep, and a recursive walk uses
the JavaScript stack — for pathological trees an explicit stack or queue is
safer. And walking a big tree with `await` per entry is slow; a real
implementation batches with a concurrency limit, which is exactly
`mapWithLimit` from lesson 03 doing its second job.

## ex4 — the narrow try block

This exercise is a single design rule dressed as a function: **catch only the
failure you understand, around only the operation that can produce it**.

The wide version — one `try` around read-and-parse with `return fallback` —
merges "the file is absent" with "the file is corrupt", and the second one
matters. A settings file that fails to parse means something wrote garbage
into it: a crash mid-write, a disk error, a bad migration. Silently replacing
it with defaults destroys the evidence and the user's data in the same move.

`NodeJS.ErrnoException` is the type Node ships for these errors:
`{ code?, errno?, syscall?, path? }` on top of `Error`. The `path` property is
particularly useful in logs, because it tells you *which* file was missing
without you having to interpolate it yourself.

The interview version of this is "how do you check whether a file exists?" The
strong answer: you usually should not — you attempt the operation and handle
`ENOENT`, because any check is stale by the time you act on it. If you truly
need a check (a validation step in a CLI, say), `fs.access` is the honest one
and `existsSync` is fine at start-up.

## challenge — the pipeline shape

Read everything, transform in memory, write once. That ordering is worth
naming because the alternative — write as you go — is what produces half-built
artefacts when input 400 is broken. For a directory of blog posts it is a
nuisance; for a deployment manifest it is an outage.

Skipping `index.json` is the small lesson with the big name: your output lives
in your input's directory, so the operation is not idempotent unless you
exclude it. Build tools hit this constantly, which is why they insist on a
separate output directory.

The error-with-filename requirement is about the 3am experience. "Unexpected
token } in JSON at position 42" tells you nothing when there are nine hundred
files. `posts/nested/bad.json is not valid JSON` plus a `cause` carrying the
original parse error tells you where to look and what the parser thought.
Adding context on the way up the stack, without discarding the original, is
exactly what lesson 04's `cause` chain was for.

## review1 — collisions, and a race you cannot win

Uniquifying a filename is the everyday version of "do not destroy data you
were not asked to destroy". Every browser download folder implements it;
`report(1).pdf` is the same algorithm with different punctuation.

The `path.parse` step is what makes it correct rather than nearly correct:
inserting the suffix before the extension keeps the file openable by whatever
was going to open it. Splitting on the last dot by hand gets `LICENSE` wrong
and `archive.tar.gz` debatable.

And then the honest caveat: the whole approach is a time-of-check to
time-of-use race. Between reading the directory and writing the file, another
process can take the name you chose. In a single-process CLI nobody cares; in
a service handling concurrent uploads it is a real bug, and the fix is to let
the filesystem arbitrate — open with the `"wx"` flag, which fails with
`EEXIST` if the file exists, and retry. Knowing that the naive version has a
name and a fix is the point; you will meet TOCTOU again in every system that
has both a check and an action.

## Further reading

- [`node:path`](https://nodejs.org/api/path.html) — the whole module; short enough to read once, end to end.
- [`node:fs` — Promises API](https://nodejs.org/api/fs.html#promises-api) — `readFile`, `writeFile`, `mkdir`, `readdir`, `open` and the flags table.
- [Node.js file system errors](https://nodejs.org/api/errors.html#common-system-errors) — the `code` values, which is the vocabulary ex4 is written in.
- [Working with folders in Node.js](https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs) — the official tour of directory operations.
- [MDN: `JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — the replacer and space arguments used in ex2.
