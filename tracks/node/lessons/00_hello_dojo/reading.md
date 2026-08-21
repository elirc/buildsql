# Reading - node/00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole course.
This page is the other half of every lesson: the *why* behind the problems you
just solved. Read it **after** you attempt a problem, whether the gate went
green or red. Failing first and reading second is not a consolation prize; it
is the version of studying that sticks.

## Notes

**What Node actually is.** Node.js is V8 (Chrome's JavaScript engine) bolted
to libuv (a cross-platform asynchronous I/O library) with a standard library
in between. V8 runs your JavaScript on exactly one thread. libuv owns a small
pool of background threads and, more importantly, the operating system's
readiness notification machinery — `epoll` on Linux, `kqueue` on macOS, IOCP
on Windows. When you ask Node to read a file, your one thread does not sit in
a `read()` syscall waiting for the disk; it hands the request to libuv and
goes back to the event loop, and libuv arranges for your callback to be
queued when the bytes are ready. Everything else in this track is a
consequence of that sentence.

**One thread means one thing at a time.** There is no preemption in your
JavaScript. A function you call runs to completion before any callback,
promise or timer gets a turn — the loop cannot interrupt you, it can only
wait for you to return. That is a gift, because you never need a mutex around
your own data structures, and it is a loaded gun, because a `JSON.parse` of a
90 MB payload or a triple-nested loop over a million rows blocks *every*
connected client for as long as it runs. "Node is fast" is really "Node is
fast at waiting"; it is no faster than anything else at computing, and it has
fewer places to hide when you make it compute.

**Why the runtime is worth a whole course.** JavaScript the language is
mostly portable — a `map` is a `map` in a browser and on a server. The
runtime is not. Browsers have no filesystem, no processes, no `Buffer`, no
streams-with-backpressure, no ports to bind. Node has all of those and no DOM.
Nearly every interview question that separates "writes JavaScript" from
"builds services" lives in this gap: the event loop, streams, error handling
in a process that must not die, module resolution, and what to do about CPU
work. That is exactly the ground lessons 01–11 cover, and the interview part
at the end (`i1`, `i2`, `i3`) is built out of the same material in the shape
an interviewer will hand it to you.

**On TypeScript in this track.** The files are `.ts` and vitest compiles them
for you; nothing here is type-checked as part of grading, and no exercise asks
you to invent a type. Treat the annotations as documentation of what goes in
and what comes out. If a signature is unfamiliar (`Promise<number>[]` in ex3,
say), read it right to left: an array of promises, each resolving to a number.

## ex1 — the process is an object

`process` is a global in the literal sense — it is not imported, it is
installed on `globalThis` before your first line runs — and it is your
program's window onto everything outside its own code: the argument vector,
the environment, the working directory, the streams `stdin`/`stdout`/`stderr`,
the exit code, and the signals the OS is sending you. Later in this course you
will use `process.on("SIGTERM", ...)` to shut an HTTP server down gracefully,
and `process.exitCode` to fail a script honestly.

The exercise made you read two values rather than hard-code them, which is a
smaller lesson than it looks. `process.platform` in particular is a value
people love to guess: it is `"win32"` on 64-bit Windows (a historical wart,
not a bug), `"darwin"` on macOS, and `"linux"` on Linux. If you ever branch on
it, branch on the value, not on a prettified version of it — and prefer not to
branch at all, which is what `node:path` exists for and what lesson 05 is
about.

The classic interview follow-up here is "how do you know which Node version a
production box is running, and why do you care?" The answer worth having is
that `process.version` tells you at run time, `engines` in `package.json`
declares what you require, and you care because the platform's async features
arrived in specific versions — `fetch` in 18, stable `node:test` in 20, and so
on — and because the LTS line is the only one getting security fixes.

## ex2 — argv, and the two entries nobody asks for

`process.argv` is an array of strings assembled by the runtime: element 0 is
the path to the Node executable, element 1 is the absolute path of the script
that was run, and everything after that is what the user typed. It is not
parsed, not unquoted beyond what the shell already did, and not converted:
`node sum.js 3 4` gives you the *strings* `"3"` and `"4"`.

Both halves of that fact caused the two failure modes the gate probes for.
Forgetting the `.slice(2)` sums the executable path as `NaN` and the whole
answer collapses to `NaN` — a value that is famously not equal to itself,
which is why the gate's diff shows `NaN` against a number instead of the
"nearly right" answer beginners expect. Forgetting the conversion gives you
string concatenation, because `+` is overloaded and JavaScript resolves the
ambiguity in favour of strings the moment either operand is one.

Two footnotes worth carrying. `Number("")` is `0`, not `NaN`, so an empty
argument quietly counts as zero — real CLIs validate rather than trust.
And in production you will use a parser (`node:util`'s `parseArgs`, or a
library) rather than indexing by hand, but every one of them is a `.slice(2)`
underneath.

## ex3 — async is the normal case

An `async` function returns a promise. Not "returns a value wrapped in a
promise if you use await" — always, unconditionally, even if the body is
`return 7`. That is the single most useful sentence about async/await, because
it explains the mistakes that follow from not believing it: calling an async
function without awaiting it gives you a promise object, and `if (promise)` is
always true; returning a promise from an async function does not double-wrap
it, because promises flatten; and a `throw` inside an async function does not
throw at the call site, it produces a rejected promise, which is why a
`try`/`catch` *around a non-awaited call* catches nothing.

The exercise's real content was error propagation. `Promise.all` rejects as
soon as any input rejects — it does not wait for the rest, and it does not
tell you which ones succeeded. That is usually what you want ("if any of these
three services is down, this request has failed"), and when it is not, the
combinator you want is `Promise.allSettled`, which waits for everything and
hands you an array of `{status, value}` / `{status, reason}` records. Lesson
03 makes you use both, along with `race` and `any`, and makes the difference
between them a thing you can say out loud in an interview.

The subtle trap in this exercise is the loop people write instead:

```ts
let total = 0;
for (const p of promises) total += await p;   // sequential, and it works here
```

With promises that are already created, this gives the right answer, because
the work started before you looped. With *functions* that start work when
called — which is what you will actually have in real code — the same shape is
the classic performance bug: three requests that could have taken 100 ms
together take 300 ms one after another. Keep the shape in mind; lesson 03
turns it into an exercise with a stopwatch on it.

## Further reading

- [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) — the official orientation, including the V8/libuv split. Fifteen minutes.
- [`process` — Node.js API docs](https://nodejs.org/api/process.html) — the whole surface: `argv`, `env`, `platform`, signals, exit codes. Skim it once now so you know what is in there.
- [MDN: `async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — the language half of ex3, with the "always returns a promise" rule stated plainly.
- [MDN: `Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) — including the fail-fast rejection semantics the gate checks.
- [Vitest: `expect`](https://vitest.dev/api/expect) — the assertion API every gate in this track is written in, including the message argument you keep reading.
