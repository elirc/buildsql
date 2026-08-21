# Reading - typescript/02_functions

The theory behind the five signatures you just wrote, and the four or five
questions an interviewer will ask about them.

## Notes

**Optional vs default is a real distinction, not a style choice.** `level?:
number` makes the parameter `number | undefined` inside the body, so every use
of it must handle the missing case; `level = 1` makes it `number` inside the
body and optional at the call site. Reach for the default whenever there is a
sensible fallback, because it puts the fallback in the signature — the first
place anyone reads — instead of burying it in a `??` three lines down. Reach
for `?` when "absent" is genuinely different from any value you could pick, and
then handle it explicitly. One trap worth knowing: passing `undefined`
explicitly (`heading("x", undefined)`) triggers the default, but passing `null`
does not, because defaults fire on `undefined` only.

**`void` means "ignore my result", not "return undefined".** This is the most
commonly failed question about function types. A function type whose return is
`void` accepts implementations returning anything at all — that is deliberate
special-casing in the assignability rules, and without it
`items.forEach((x) => list.push(x))` would not compile. The consequence to
remember: if you *declare* a variable of type `() => void` and call it, the
result you get back is typed `void`, so you cannot use it even when the
underlying function returned something real. Contrast with a function
*declaration* annotated `: void`, where returning a value is an error.

**`never` is the empty type, and it earns its keep in three places.** As a
return type it marks a function that never finishes normally — it throws or
loops forever — which lets the compiler treat a call to it as the end of a code
path. As a parameter type it makes a function uncallable, which is how the
exhaustiveness check in lesson 04 works. And as an element type, `never[]` is
what you get from `[]` with no context, which is why an unannotated empty array
sometimes refuses every `push` you try. Remember: `void` is "returns, but with
nothing useful"; `never` is "does not return".

**Overloads are a declaration, not a dispatch mechanism.** There is exactly one
function at runtime; the overload list is a compile-time menu, and resolution
picks the *first* signature that matches the arguments. The implementation
signature is not one of the choices, which surprises people — you cannot call
`unwrap(someStringOrNumber)` if the overloads only list `string` and `number`
separately, because no single overload accepts a union. That is the standard
argument for preferring a union parameter (or a generic) over overloads unless
the return type genuinely depends on the argument type. Overloads also do not
check that your implementation actually honours them, so `function f(x:
string): number; function f(x: any): any { return "oops"; }` compiles. They are
a promise you make, and you own it.

## ex1 — a default the caller can override

The runtime half is `Math.round`, and the reason the gate checks both `1/3` and
`2/3` is to separate rounding from truncation: `Math.floor` gives 33 and 66,
rounding gives 33 and 67. Formatting bugs of exactly this kind are what makes a
dashboard show "99%" forever.

The type half is what `expectTypeOf(progressLine).parameters` reports. With
`total = 12` the parameter list is `[done: number, total?: number]` — the
default made it optional at the call site while keeping it `number` inside the
body. That asymmetry is the feature. Writing `total: number = 12` produces the
same type and one redundant annotation; writing `total?: number` and then
`total ?? 12` in the body produces the same behaviour with the fallback moved
somewhere less visible.

The subtle thing to carry forward is that defaults are evaluated *per call*, at
call time, left to right, and may reference earlier parameters:
`function slice(text: string, end = text.length)` is legal and often exactly
what you want.

## ex2 — as many scores as you like

`bestOf(scores: number[])` and `bestOf(...scores: number[])` have identical
bodies and completely different call sites. Which one to write is a genuine API
decision: rest parameters read beautifully for two or three arguments
(`Math.max(a, b)`), and become awkward the moment a caller has an array and has
to remember to spread it — or, worse, has an array of 200,000 elements, where
`Math.max(...values)` overflows the call stack. Node's argument limit is in the
tens of thousands, and "why does this crash only in production" has been traced
to that spread more than once.

The seed value is the other quiet decision. Seeding at `0` makes `bestOf()`
return `0` for free, which the README chose deliberately. Seeding at
`-Infinity` is the mathematically honest answer for "the maximum of nothing",
and returning `undefined` is the honest *API* answer — but that changes the
return type to `number | undefined` and pushes a narrowing step onto every
caller. All three are defensible; what is not defensible is not deciding.

## ex3 — a function that takes a function

Two lessons hide in one small function. The first is that function types are
ordinary types: they can be aliased, unioned, put in arrays, and inferred. When
you pass an inline arrow to `forEachTrack`, TypeScript *contextually types* its
parameters from the declared callback type, which is why you write `(name,
index) => ...` with no annotations and still get full checking inside. Delete
the callback's second parameter from the signature and that same arrow starts
reporting an implicit `any` — which is precisely the failure the stub produces.

The second is the `=> void` assignability rule, which the gate exercises with
`forEachTrack(["a"], (name) => seen.push(name))`. `push` returns a number; the
callback type says `void`; it compiles anyway. Interviewers like this one
because the wrong answer ("that should be an error") sounds so reasonable.

Also worth noticing: a callback may accept *fewer* parameters than the type
declares, never more. That is why `names.forEach(visit)` works when `visit`
takes one argument, and why passing a function that takes four parameters to
`forEach` is an error — the caller only ever supplies three.

## ex4 — one name, two signatures

The reason overloads exist is that `duplicate(value: string | number): string |
number` is a *worse* contract than it looks. Every caller who passes a string
gets back something they must narrow before using, even though you and they
both know it is a string. Overloads move that knowledge into the type system.

Three practical notes. First, order matters: resolution takes the first
matching overload, so put the more specific signature first when two could
match. Second, the implementation signature must be assignable to none of the
overloads' *callers* — it is invisible from outside — but TypeScript only
loosely checks that it is compatible, so a wrong implementation can slip
through. Third, modern TypeScript often has a better answer: generics with
conditional return types (lesson 09), or simply two functions with two names.
"Should this be an overload or two functions?" is a real code-review question,
and the honest default is two functions unless callers benefit from the shared
name.

## challenge — retry

Retry logic is a standard interview exercise because it exposes how carefully
someone reads a spec. Rethrowing the *last* error rather than a fresh one keeps
the stack and message that describe what actually went wrong; throwing
`new Error("all attempts failed")` destroys the evidence. Counting the total
attempts rather than the retries (three attempts means one call plus two
retries, not four calls) is the off-by-one everyone has to think about once.

The type-level detail is `useUnknownInCatchVariables`, on in this course and on
by default under `strict` since TypeScript 4.4. A caught value is `unknown`,
not `any`, because JavaScript can throw literally anything — `throw "nope"` and
`throw 42` are legal. That means `error.message` does not compile until you
narrow, which is exactly what lesson 10's guards are for. Storing it as
`unknown` and rethrowing it untouched is the correct move here and the one that
preserves the most information.

The `never` helper is optional but instructive: `function fail(msg: string):
never { throw new Error(msg); }` lets a guard clause be one call, and the
compiler still believes the surrounding function returns a `string`, because a
call to a `never`-returning function terminates the path. Try annotating `fail`
as `void` instead and watch the surrounding function suddenly claim it might
return `undefined`.

## review1 — padCell

Two defaults, one no-op case, and a `repeat` that throws on a negative count —
the same shape as ex1 with the failure mode moved. If you computed
`filler.repeat(width - text.length)` before checking whether the text was
already wide enough, `padCell("overlong", 4)` threw a `RangeError`, which is a
nice reminder that "the types are fine" and "the function is correct" are
different claims.

The design question worth sitting with: nothing in the signature stops a caller
passing a two-character filler and getting a cell wider than `width`. You could
fix that at runtime (slice the result), in the type system (lesson 05's literal
types can demand a single character, sort of), or in documentation. Knowing
which fixes are available — and that the type system is only one of them — is
most of what "typed thinking" actually means.

## Further reading

- [Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — optional and default parameters, rest parameters, overloads, `void` and `never`, in one authoritative page.
- [Handbook: Assignability of functions (`void` return)](https://www.typescriptlang.org/docs/handbook/2/functions.html#return-type-void) — the exact rule behind the `forEach`/`push` line in the type gate.
- [`tsconfig` reference: `useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables) — why the challenge's caught value is `unknown`.
- [MDN: rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) — the JavaScript half of ex2, including how rest differs from the old `arguments` object.
- [TypeScript Deep Dive: function overloading](https://basarat.gitbook.io/typescript/type-system/functions) — a blunt walkthrough of when overloads help and when they hide bugs.
