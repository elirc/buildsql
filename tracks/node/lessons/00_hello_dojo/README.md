# 00 — Hello, Dojo (Node.js)

Welcome to the Node track. This course teaches you the Node.js *runtime* — not
JavaScript the language, which you are assumed to know, but the thing that
runs it on a server: one thread, one event loop, an I/O layer built out of
callbacks and streams, and an HTTP server you will write from scratch before
you are allowed near a framework.

Node's whole design follows from one decision. A web server spends almost all
of its life waiting — for a disk, a database, another service — and a thread
that waits is a thread doing nothing while holding a stack, a scheduler slot
and a few hundred kilobytes of memory. Node refuses to wait. It hands the I/O
to the operating system, returns to the loop, and picks your callback back up
when the answer arrives. That is why a single Node process can hold tens of
thousands of open connections, and also why one accidental `while` loop over a
large array freezes every single one of them. Everything you find delightful
about Node and everything you find infuriating about it comes out of that
same trade.

You learn it here the way you learn anything: by writing code that a gate
grades. You edit one file, run one command, and a test tells you whether you
were right — and when you were not, it prints the evidence and names the
section you should reread.

## The loop

Every lesson is a directory under `tracks/node/lessons/`. Inside:

- `README.md` — this file. Read it top to bottom before you write anything.
- `reading.md` — the theory. Read it *after* you attempt the exercises.
- `ex1/`, `ex2/`, … — one directory per exercise. You edit `exN/solution.ts`
  and nothing else.
- `gate.test.ts` — the gate. It imports your file, calls your function and
  asserts on what comes back. It is quoted verbatim at the bottom of this
  README, and always will be: you are never graded by a program you have not
  been shown.

The commands you will live in:

```
uv run dojo test node 00_hello_dojo        # grade the whole lesson
uv run dojo test node 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint node 00_hello_dojo ex2    # stuck? reveal the next tier
uv run dojo read node 00_hello_dojo ex2    # the theory behind it
uv run dojo status node                    # the progress dashboard
uv run dojo next node                      # what should I do now?
```

The files are TypeScript, because that is what you will be handed on any Node
codebase written after about 2020, but this is not the TypeScript track: every
signature you need is already written for you. If you want the type system
itself, that course is next door (`uv run dojo status typescript`).

Before you write a single line, run the gate and watch it fail:

```
uv run dojo test node 00_hello_dojo
```

Three red tests, each one an `Error: exN: ... is not implemented yet`. That is
the correct state of a fresh checkout. Reading a failure you *expected* is the
cheapest way to learn to read the ones you do not.

## Concept — the process is an object you can ask questions

Node hands every program a global called `process`: the running program's view
of itself. It is not a library you import, it is just there.

```ts
process.version;    // "v22.16.0"  - the Node build running this code
process.platform;   // "win32" | "darwin" | "linux" | ...
process.pid;        // 24680       - the OS process id
process.argv;       // ["C:\\Program Files\\nodejs\\node.exe", "C:\\app\\sum.js", "3", "4"]
process.env.PATH;   // strings from the environment, or undefined
```

`process.argv` is the one with a trap in it. It is not "the arguments the user
typed" — it is the *whole* command line as the OS delivered it, so index 0 is
the Node executable, index 1 is the script being run, and the user's arguments
start at index 2. Every CLI you will ever write starts with a `.slice(2)`, and
every CLI written by someone who forgot starts by trying to parse
`C:\Program Files\nodejs\node.exe` as a number.

The second thing to have in your hands from minute one is the shape of async
code. A function marked `async` always returns a promise, whatever you write
inside it:

```ts
async function loadCount(): Promise<number> {
  return 7;                  // the caller gets Promise<number>, not 7
}
```

`await` unwraps a promise, and — this is the part people forget — if the
promise rejects, `await` *throws* at that line. So the two error worlds are
one world: a rejection inside an async function behaves exactly like an
exception, and an exception inside an async function comes back to the caller
as a rejection.

```ts
async function total(): Promise<number> {
  const [a, b] = await Promise.all([loadCount(), loadCount()]);
  return a + b;
}
```

`Promise.all` takes an array of promises and gives you one promise of an array
of results, in the order you passed them in — *not* the order they finished.
If any of them rejects, the promise it returned rejects with that same error,
immediately. Lesson 03 takes this apart properly; today you just need to be
able to use it.

## Exercise 1 — read the runtime you are standing in

Edit `ex1/solution.ts`. Implement `describeRuntime()` so it returns a single
line describing the running process:

- on this machine, `"Node.js v22.16.0 on win32"`
- on a colleague's laptop, `"Node.js v20.11.1 on darwin"`

Same shape, different values — which is the point. The values must be read
from `process` at call time, not typed in as a literal, because the gate
builds the string it expects the same way and compares character for
character. Mind the `v`: `process.version` already has one.

```
uv run dojo test node 00_hello_dojo ex1
```

## Exercise 2 — the two arguments you did not pass

Edit `ex2/solution.ts`. Implement `sumOfArgs(argv)`, which takes an array
shaped like `process.argv` and returns the sum of the *user's* arguments:

- `sumOfArgs(["/usr/bin/node", "/app/sum.js", "3", "4"])` → `7`
- `sumOfArgs(["/usr/bin/node", "/app/sum.js"])` → `0`
- `sumOfArgs(["node", "sum.js", "10", "-4", "0.5"])` → `6.5`

Two things decide whether this is right, and they fail differently. Drop the
first two entries, or you will be summing file paths. Convert each remaining
entry from a string to a number, or `"10" + "-4"` gives you the string
`"10-4"` and the gate shows you a diff that looks like nonsense until you
notice the quotes.

Take the array as given — do not mutate it. The caller usually owns
`process.argv` itself.

```
uv run dojo test node 00_hello_dojo ex2
```

## Exercise 3 — your first async function

Edit `ex3/solution.ts`. Implement `totalOf(promises)`, which takes an array of
promises of numbers and resolves to their sum:

- `totalOf([Promise.resolve(1), Promise.resolve(2)])` resolves to `3`
- `totalOf([])` resolves to `0`
- if any input promise rejects, `totalOf` rejects **with that same error**

That last line is the actual exercise. The natural first attempt is a loop
that `await`s each promise in turn, and it produces the right answers — but
read the second half of the Concept section again and ask what a rejected
input does to the loop, and what a `try`/`catch` you add to "make it safe"
would do to the error the caller needs to see.

```
uv run dojo test node 00_hello_dojo ex3
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { describeRuntime } from "./ex1/solution";
import { sumOfArgs } from "./ex2/solution";
import { totalOf } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - describeRuntime() reads the process it is running in", () => {
    expect(
      describeRuntime(),
      "the string must be built from process.version and process.platform at " +
        "run time, in the exact shape given in README ex1",
    ).toBe(`Node.js ${process.version} on ${process.platform}`);
    expect(
      describeRuntime().startsWith("Node.js v"),
      "process.version already begins with a v - do not add a second one, and " +
        "do not strip the one that is there",
    ).toBe(true);
  });

  test("ex2 - sumOfArgs() skips the two entries Node puts in front", () => {
    expect(
      sumOfArgs(["/usr/bin/node", "/app/sum.js", "3", "4"]),
      "argv[0] is the node binary and argv[1] is the script - only the entries " +
        "after those two are user arguments (reread README ex2)",
    ).toBe(7);
    expect(
      sumOfArgs(["/usr/bin/node", "/app/sum.js"]),
      "no user arguments means an empty sum, which is 0 - not NaN and not undefined",
    ).toBe(0);
    expect(
      sumOfArgs(["node", "sum.js", "10", "-4", "0.5"]),
      "argv entries are always strings: Number(\"0.5\") is 0.5, but \"10\" + \"-4\" " +
        "is string concatenation, so convert before you add",
    ).toBe(6.5);
  });

  test("ex3 - totalOf() awaits every promise and adds the results", async () => {
    await expect(
      totalOf([Promise.resolve(1), Promise.resolve(2)]),
      "totalOf() must resolve to the sum of the resolved values, not to an " +
        "array and not to a promise of a promise",
    ).resolves.toBe(3);
    await expect(
      totalOf([]),
      "the sum of nothing is 0 - an empty input is a case, not an accident",
    ).resolves.toBe(0);
    // The gate keeps its own handler on this one so that an unfinished stub
    // cannot turn it into an unhandled rejection and crash the whole run.
    const failing = Promise.reject(new Error("boom"));
    failing.catch(() => {});
    await expect(
      totalOf([Promise.resolve(1), failing, Promise.resolve(3)]),
      "one rejected input must reject the whole thing with that same error - " +
        "do not swallow it and do not replace it with an error of your own",
    ).rejects.toThrow("boom");
  });
});
```

In plain English:

- **ex1** calls your function and compares it against a string the gate builds
  from the same two `process` properties, so a hard-coded version number
  passes on your machine today and fails on any other machine, forever. The
  second check catches the most common typo, a doubled `v`.
- **ex2** calls `sumOfArgs` three times: a normal case, an empty case, and one
  with a decimal and a negative so that an integer-only or string-flavoured
  addition shows up as a wrong number rather than a near miss.
- **ex3** checks the resolved value twice and then checks that a rejection
  travels *through* your function unchanged. `rejects.toThrow("boom")` means:
  the promise you returned must reject, and the error it rejects with must
  carry that message.

Note the second argument to every `expect(...)` call. That string is the first
line vitest prints when the assertion fails, and in this course it always
names the mistake rather than restating the assertion. Read it before you read
the diff.

## The teaching point

The habit this lesson builds is *predicting the failure*. You ran the gate
before writing anything, so you know what red looks like; from here on, every
red run is a comparison against something rather than a surprise.

The habit underneath that one is treating async as the default. In most
languages, reading a file is a function call that returns a value, and doing
it asynchronously is an advanced topic. In Node it is the reverse: the async
form is the normal form, the synchronous form exists mainly for start-up
scripts, and a library that only offers you the synchronous version is a
library that can stall your entire server. You spent ex3 writing three lines
of that world. The next eleven lessons are about what happens underneath it.

Next: **01_modules**, where you find out why `require` and `import` are two
different systems, and why that is still, in 2026, a thing you have to know.
