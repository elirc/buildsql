# Reading - typescript/04_unions_narrowing

Unions are the feature that makes TypeScript feel like a different language
from the one whose syntax it borrows. This page is the theory, the interview
answers, and the traps.

## Notes

**A union is a set, and the members you can touch are the intersection.** For
`string | number`, the available members are the ones both types have — which
is why `toString()` works and `toUpperCase()` does not. This surprises people
who expect a union to behave like a base class. It is the opposite: a union
gets *narrower* in capability as it gets *wider* in possible values, and an
intersection (`A & B`) gets wider in capability as it gets narrower in values.
Saying that sentence out loud in an interview does you no harm at all.

**Control flow analysis is the machinery behind narrowing.** TypeScript
simulates the paths through your function and tracks what each check told it. A
`typeof` guard, an `instanceof`, an `in`, a `===` against a literal, a
truthiness check, an early `return` or `throw` — all of them refine the type
for the code that follows. It is not magic and it does have limits: narrowing
is lost when a value is captured in a closure that might run later, and it is
lost for a mutable property that could have changed between the check and the
use (narrow into a `const` local first if you hit that). It also does not track
across a function boundary — which is exactly the gap that user-defined type
guards, in lesson 10, exist to fill.

**Discriminated unions are the single most useful pattern in this language.**
The recipe: every member is an object type, every member has the same property
name, and each pins that property to a distinct literal type. The compiler can
then treat a comparison on that property as proof. It scales to dozens of
variants, works with `switch` and with `if`, and it is how Redux actions, React
`useReducer` state, API responses, parser results, and every `Result` type in
the wild are modelled. If you take one habit from this course, take this one.

**`never` closes the loop.** Narrowing removes members; when all of them are
removed, what is left is `never`. That is why a `default` branch of an
exhaustive switch can call `assertNever(value: never)`, and why adding a
variant later turns that call into a compile error listing exactly what you
forgot. Note the difference between this and a runtime check: `assertNever`
also throws, because a value smuggled past the compiler with a cast (or arriving
from JSON) really can reach that line. It is both a compile-time to-do list and
a runtime alarm.

**`null` and `undefined` are just union members.** With `strictNullChecks` on —
and it is on — `string | null` is an ordinary union, and `if (x)` or
`x != null` narrows it. `x != null` with the loose `!=` is the one place the
style guides forgive you, because it excludes both `null` and `undefined` in a
single check. Optional chaining `?.` and `??` are the ergonomic shorthands, and
`!` (the non-null assertion) is the escape hatch you should be able to justify
each time you write one.

## ex1 — one parameter, three types

Widening the parameter and then fixing the errors is the correct order to work
in, and it is worth noticing what the errors *were*: every method you wanted
belonged to one member, and the compiler offered you only the intersection.
That refusal is the entire value proposition. In plain JavaScript,
`value.toFixed(1)` on a string is `undefined is not a function` — at runtime, in
production, on a Friday.

The `false` case is there deliberately. A tempting implementation returns
`value ? "yes" : "no"` at the top and never checks anything, which is right for
booleans and disastrously wrong for `""` and `0`. Narrowing and truthiness are
different tools: the first asks *what type is this*, the second asks *is this
value falsy*, and confusing them is the most common bug in this lesson's
territory.

One more thing to file away: `typeof null === "object"` is a famous JavaScript
wart, and `typeof` narrowing inherits it. `typeof x === "object"` does not
exclude `null`, which is why the honest check for "a real object" is
`typeof x === "object" && x !== null`.

## ex2 — a discriminated union

The exercise is really about writing the *type*, because once the type is right
the function writes itself. That is the shape of most good TypeScript: the time
goes into modelling, and the implementation falls out.

The literal type is what makes it work. `{ kind: string }` in every member
would compile fine and narrow nothing, because comparing a `string` to
`"pass"` tells the compiler nothing about which member you have. Pinning
`kind: "pass"` makes the property a set with one element, and comparison
becomes proof. This is why lesson 05's literal types matter more than they look
like they should.

A design note interviewers like to probe: why not one interface with optional
members — `{ kind: string; attempts?: number; message?: string }`? Because it
makes illegal states representable. That shape permits a pass with a message,
a fail with neither, and a hint with an `attempts` count, and every consumer
has to defend against combinations that cannot happen. A discriminated union
makes those states unsayable, which is the whole game: *make illegal states
unrepresentable*.

## ex3 — narrowing without a discriminant

Real unions are not always yours to design. Errors arrive as `Error` instances,
API responses arrive as plain objects, a timeout arrives as whatever the
library decided. `instanceof` and `in` are the tools for unions you inherited.

`instanceof` checks the prototype chain at runtime, so it works for classes and
not for interfaces — an interface has no runtime existence to check against.
It also has a famous failure mode: across realms (iframes, worker threads, or
Node's `vm` module) there are two different `Error` constructors, and
`instanceof` returns `false` for a perfectly good error from the other side.
That is why library code often checks `error instanceof Error ||
(typeof error === "object" && error !== null && "message" in error)`.

The `in` operator narrows on property presence, and it is the pragmatic choice
for plain object unions. Its weakness is that it is only as good as your
shapes: if two members both have `code`, `in` cannot separate them. Ordering
matters too — the checks run top to bottom, so put the specific ones first.

## ex4 — make the compiler check your cases

`assertNever` is the highest-value five lines in this course. The trick is that
`never` is the empty type, so nothing can be passed to a function expecting it;
inside an exhaustive `switch`'s `default`, the value has been narrowed to
`never` and the call is legal. Miss a case and the value is
`{ kind: "triangle"; ... }`, which is not assignable to `never`, and you get an
error that names the variant.

Two details people get wrong. First, `return assertNever(shape)` rather than a
bare call, because the `return` is what convinces TypeScript that the function
always produces a number — a call alone leaves a path where control falls out
of the switch. Second, `assertNever` must throw, not return, because the type
system is erased: a triangle really can arrive from `JSON.parse`, from an `as`
cast, or from a JavaScript caller who never saw your types at all. The gate
smuggles one in with a cast precisely to make that point.

Compare with what the SQL track teaches about `CHECK` constraints: the type
system is your compile-time guard and the throw is your runtime constraint, and
serious systems want both.

## challenge — Result, by hand

The `Result` type is the "errors as values" pattern, and TypeScript models it
beautifully because a discriminated union is exactly the right shape. What it
buys you over `throw` is that the failure is in the *type* — a caller cannot
forget it exists, because they cannot read `.value` without first proving
`ok` is true. What it costs you is ceremony at every call site, and no stack
trace unless you put one in the error member.

The instructive failure is writing `{ ok: boolean; value?: string; error?:
string }`. It compiles, it looks nearly the same, and it narrows nothing:
`if (result.ok)` leaves `value` as `string | undefined`, so you are back to
defending against states that cannot happen. Literal `true` and literal `false`
in the two variants is what makes the boolean a discriminant.

Worth knowing: `partition` written with two `filter` passes loses the narrowing
— `results.filter((r) => r.ok)` gives you back `Result[]`, not the success
member, because `filter`'s signature has no way to express "the predicate
proves something". The fix is a type guard, which is lesson 10, and modern
TypeScript (5.5+) can sometimes infer one for you from a simple predicate.

## review1 — describePayment

Same pattern, third time: three variants, one literal discriminant, one
`switch`. What is worth noticing here is the `{ method: "cash" }` member, which
carries no data at all. A union member is allowed to be nothing but its tag —
and that is often exactly right, because "cash" genuinely has no extra
information. The temptation to give every variant the same members "for
symmetry" is how you end up back at optional properties and defensive code.

If you added an `assertNever` default without being asked, good. That is the
habit this lesson exists to install.

## Further reading

- [Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — `typeof`, `instanceof`, `in`, truthiness, discriminated unions and exhaustiveness checking, in the order that builds them up.
- [Handbook: Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) — the basics, and why only shared members are available.
- [Handbook: `never` and exhaustiveness](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) — the official `assertNever` recipe.
- [MDN: `instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) — including the cross-realm caveat that bites in Node and iframes.
- [TypeScript Deep Dive: discriminated unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions) — the pattern with more worked examples, including the Redux-style reducer.
