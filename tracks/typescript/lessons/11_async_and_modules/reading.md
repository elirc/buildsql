# Reading - typescript/11_async_and_modules

Promises as types, concurrency as a design decision, and what a declaration
file actually promises.

## Notes

**`Promise<T>` is an ordinary generic type, and `async` is sugar.** An `async`
function is a function that returns a promise; `await` is sugar over `.then`.
The type-level consequences are worth stating precisely: the declared return
type of an `async` function must be `Promise<something>` (TypeScript enforces
it), a `return x` inside is implicitly wrapped, and a `throw` becomes a
rejection. That last point is why `try { doAsyncThing() } catch {}` without an
`await` catches nothing at all — the rejection happens after the `try` block has
already finished — and why an unhandled rejection crashes a modern Node process.

**Forgetting `await` is the most common async type error, and annotations catch
it.** With an annotated return type, returning a `Promise<User>` where a `User`
was promised is a compile error. Without one, inference happily makes your
function return `Promise<Promise<User>>` — well, actually it flattens, which is
worse, because the mistake surfaces somewhere else entirely. The
`@typescript-eslint/no-floating-promises` rule exists because the type system
alone cannot see a promise nobody awaited.

**Concurrency helpers, and when each is right.** `Promise.all` fails fast — one
rejection rejects the whole thing, and the other tasks keep running unobserved.
`Promise.allSettled` never rejects and gives you `{status: "fulfilled", value}`
or `{status: "rejected", reason}` per item; it is the right default when partial
success is meaningful. `Promise.race` settles with the first result of any kind
(the timeout idiom). `Promise.any` settles with the first *success* and rejects
with an `AggregateError` if all fail. TypeScript models all four precisely,
including `all`'s tuple inference, which is the most impressive bit of typing in
the standard library.

**Unbounded concurrency is a real production failure mode.** `await
Promise.all(items.map(fetchOne))` with 10,000 items opens 10,000 sockets, and
every rate limiter, connection pool and file-descriptor table you own will
notice. That is why the capstone exists: a pool of `limit` workers is the
standard shape, and it is what `p-limit` and every job queue implement under the
hood.

**Modules: what makes a file a module.** Any file with a top-level `import` or
`export` is a module with its own scope; a file with neither is a *script*
whose declarations go into the global scope, which is a surprisingly common
cause of "duplicate identifier" errors. This course sets
`moduleDetection: "force"`, which treats every file as a module regardless.

**`import type` and `verbatimModuleSyntax`.** `import type { X } from "./x"`
states that the import is types-only and must vanish from the emitted
JavaScript. With `isolatedModules` on — as it is here, and as every bundler
requires — the compiler cannot always tell whether an imported name is a type or
a value, so being explicit avoids both accidental runtime imports and confusing
build errors.

**Declaration files are unverified promises.** A `.d.ts` describes shapes and
emits nothing. TypeScript finds a sibling `legacy.d.ts` for `./legacy.js`
automatically; for a package it looks at `types` in `package.json`, then at
`@types/<name>` from DefinitelyTyped. Nothing checks a declaration against the
implementation it describes, which is why a wrong `@types` package produces
errors that make no sense — and why `skipLibCheck: true` (on in this course) is
almost universal: it skips typechecking of `.d.ts` files, trading a class of
detection for a large amount of build time.

## ex1 — a promise in the signature

The change is small and the mental shift is not. `Lesson` and `Promise<Lesson>`
are unrelated types, and a caller who forgets `await` gets a promise where they
expected an object — usually surfacing as `undefined` when they read a property,
because a promise has no `.title`.

Rejecting rather than resolving with `null` is the design decision here, and it
has a real trade-off. Rejection keeps the happy-path type clean (`Promise<Lesson>`
rather than `Promise<Lesson | null>`) and moves the failure into `try`/`catch`,
where it is easy to forget. Resolving with `null` puts the failure in the type,
where the compiler will not let you forget, at the cost of a narrowing step at
every call site. Lesson 10's `Validated<T>` is the third option — a `Result` in a
promise — which is what most functional-leaning TypeScript codebases settle on.

The gate's `await expect(...).rejects.toThrow(...)` is worth noting as a testing
skill: without the leading `await`, the assertion returns a promise nobody
watches and the test passes whatever happens. Vitest warns about it; many test
suites contain one anyway.

## ex2 — two tasks, one wait

`Promise.all([a(), b()])` typed as `Promise<[A, B]>` is a genuinely clever piece
of the standard library's typing: the overload for a tuple preserves each
element's type positionally. Compare with `Promise.all(items.map(...))`, which
gives you `Promise<T[]>` because an array's element type is homogeneous. Both
are right; knowing which shape you passed explains the type you got back.

The concurrency test is the interesting half, and it is why the exercise takes
*thunks* (`() => Promise<A>`) rather than promises. A promise is already
running — creating it starts the work — so a function taking two promises cannot
sequence them even if it tries. Taking functions puts the decision inside your
implementation, which is exactly what real APIs do when they need to control
scheduling (retry helpers, queues, transaction wrappers).

This is a standard interview question in the form "what is wrong with this
code?", shown as two consecutive awaits of independent calls. The answer to
give: they are independent, so they should be started together with
`Promise.all`; the version as written doubles the latency for no reason.

## ex3 — async iteration

Async generators are the ergonomic way to model "a sequence that arrives over
time": paginated APIs, log tails, database cursors, message queues. The consumer
writes an ordinary `for await` loop and never sees the paging.

`collect(source: AsyncIterable<T>)` rather than `AsyncGenerator<T>` is the
"weakest thing you need" rule from lesson 01, one last time. `AsyncIterable<T>`
is satisfied by generators, by streams (Node's `Readable` is async-iterable), and
by anything with a `[Symbol.asyncIterator]` method. Asking for the generator
type would exclude all of those for no benefit.

The `size < 1` guard is the same degenerate case as lesson 01's `splitEvery`,
with a nastier failure mode: `i += 0` inside a generator is an infinite loop that
yields forever, so a consumer's `for await` never ends and the process hangs
rather than crashing. Infinite generators are a legitimate pattern — which is
exactly why nothing warns you.

## ex4 — describe an untyped module

Writing a `.d.ts` by hand is a rite of passage. The key insight is that it is
*only* a description: no bodies, no emit, no verification. Your
`export declare function slugify(title: string): string` is exactly as true as
you made it, and the compiler will happily let you describe a function that does
not exist, or give it parameters it never had.

That is what the hint's closing question is about. `slugify` in `legacy.js`
starts with `String(title)`, so it accepts numbers, booleans and `null` quite
happily. Declaring `title: string` is therefore *narrower* than the truth — and
that is usually the right call: a declaration file is where you get to impose
the contract you wish the module had, as long as you never make it *wider* than
reality. Widening (declaring a parameter `any`, or claiming a function returns
`User` when it can return `undefined`) is how a `.d.ts` becomes a lie that
crashes at runtime.

This is also the whole story of DefinitelyTyped: thousands of hand-written
descriptions of other people's JavaScript, unverified, kept honest by usage and
bug reports. When `@types/something` disagrees with reality, now you know
exactly what happened.

## challenge — the capstone

The worker-pool shape is the standard answer to bounded concurrency, and it is
worth being able to write from memory. Three properties fall out of it:
ordering, because each worker writes to `results[index]` rather than pushing;
the bound, because there are exactly `limit` workers; and full utilisation,
because a worker takes the next index the moment it is free rather than waiting
for a batch to complete. The naive "chunk the array into groups of `limit` and
`Promise.all` each chunk" alternative satisfies the bound but idles whenever one
task in a chunk is slower than the rest — a good thing to be able to compare in
an interview.

The error handling is lesson 02 and lesson 10 combined. `catch (error)` gives
you `unknown` under `useUnknownInCatchVariables`, and `error instanceof Error ?
error.message : String(error)` is the standard, honest narrowing —
because JavaScript really can `throw "just a string"`, and a library you depend
on eventually will.

Turning rejections into values rather than letting them propagate is the same
decision as lesson 04's `Result`, made at the scheduling layer. It means the
caller gets a complete picture of every task instead of the first failure, which
is what you want for a batch job and not what you want for a transaction. Say
which one you are building, and the design follows.

## Further reading

- [Handbook: Everyday Types — `Promise` and async](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — plus [TypeScript 3.6's async iteration notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html) for generators.
- [MDN: `Promise.all`, `allSettled`, `race`, `any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — the four combinators and exactly how each settles.
- [MDN: `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) — async iteration from the consumer's side.
- [Handbook: Declaration Files — Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) — how `.d.ts` files are found, written and published, including `@types` packages.
- [Handbook: Modules — module resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html) — what `moduleResolution: "bundler"` actually does, and why the `.js` extension appears in TypeScript imports.
