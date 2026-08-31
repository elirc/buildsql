# Reading - typescript/d04_interfaces_aliases

The debrief. Per problem: what the declaration was really being marked on, the
mistake that shows up in review, and one sentence on the model answer.

## Notes

**The skill this set drills is choosing a declaration form.** `interface` and
`type` overlap for about eighty percent of what you write, and the interesting
questions live in the other twenty: only an interface merges across
declarations and can be `implements`-ed idiomatically; only a `type` can name a
union, a tuple, a conditional or a mapped type. Everything else - optional
members, `readonly`, index signatures, call signatures, extension - both can do,
with different syntax.

**Extending and duplicating produce the same type.** TypeScript is structural,
so `interface Player extends Person { rating: number }` and
`interface Player { name: string; rating: number }` are indistinguishable to the
checker. `extends` is for humans and for keeping one source of truth; the
compiler will not thank you either way. The same is true of `A & B` versus
writing out the members - which is why ex1 and ex2 grade the resulting *shape*
rather than the syntax you used to reach it.

**An interface can describe things that are not plain objects.** A call
signature (`(a: number): string`) makes it callable; a construct signature
(`new (a: number): T`) makes it newable; an index signature makes its key set
open. A "hybrid" interface with a call signature *and* members is how jQuery,
Express and every `debug`-style logger are typed, and it is the shape ex3
drills.

**An index signature has to cover every named member.** `{ total: number;
[opening: string]: number }` compiles because `number` is assignable to
`number`; add `name: string` and it stops compiling, because the index
signature promised every string key yields a number. That constraint is the
reason real code so often ends up with a nested `counts` object instead.

**And `implements` is a check, not a contract.** It tells the compiler to verify
this class against that interface and changes nothing about the class's own
type, which keeps its extra members and stays structurally usable elsewhere. A
class that satisfies an interface without saying `implements` is still
assignable to it - `implements` just moves the error from the call site to the
declaration, which is where you want it.

## ex1 - one interface built on another

What this was testing: that `extends` gives you the union of both member sets,
that an optional member is `T | undefined` inside the body, and that `unknown`
is never an acceptable placeholder for a type you know.

The classic mistake is `federation !== undefined` for the bracket decision,
which renders `"Grace (), 1500"` for a federation that is present and empty. The
gate includes that case.

The model answer builds the bracketed fragment as its own `const` from a
truthiness check, so the return stays a single template literal and the two
output shapes differ by one interpolation rather than by two branches.

## ex2 - an intersection of two aliases

What this was testing: `A & B` as a way to compose types you do not own, and the
fact that an intersection requires *both* halves - it is not a union and it is
not optional.

The classic mistake is `Object.assign(game, { createdAt })`, which returns the
right type and mutates the caller's object on the way. The gate checks the
game's own key list afterwards for exactly that reason.

The model answer is one spread into a fresh literal, which is also the answer
that keeps working when `Game` grows a member next month.

## ex3 - an interface you can call

What this was testing: a call signature inside an interface, and the fact that
functions are objects and can carry properties. This is the shape of every
"callable with configuration" API you will ever type.

The classic mistake is returning a plain arrow function and assigning the
properties afterwards without telling the type system - which either needs a
cast anyway or leaves the properties invisible. The second-classic is storing
the counter in a variable outside the returned function *and* outside
`makeScorer`, which makes all scorers share one count.

The model answer builds the function, attaches the members with
`Object.assign`, and lets the closure over that same object provide the counter
- so `scorer.total` and the number the function increments are the same
storage, not two copies.

## ex4 - an index signature beside a named member

What this was testing: that a named member and an index signature can coexist
only when the named member's type fits the index signature, and that iteration
over such an object hands you the named member too.

The classic mistake is forgetting to skip `total`, which then wins every
comparison because it is the sum of the others. The gate's first case makes
that failure look like a plausible answer, which is the point.

The model answer walks `Object.entries`, skips the one known key by name, and
carries a `bestCount` seeded below zero so that an opening played zero times
still beats "nothing recorded" - a distinction the `{ total: 99, Caro: 0 }` case
exists to force.

## ex5 - declaration merging

What this was testing: the one capability an interface has and a `type` alias
does not. Two `interface Foo` declarations in the same scope merge into one
type with the union of their members; two `type Foo` declarations are a
duplicate-identifier error.

The classic mistake is reaching for `extends` and renaming - which works, and
misses the point of the exercise: merging is how you add members to a type you
do not own, which is how `declare global`, module augmentation and every
`@types` patch in the ecosystem work.

The model answer leaves the shipped declaration untouched and adds a second
block below it, because that is exactly the shape of a real augmentation: the
library's declaration stays where it is, yours sits next to it.

## ex6 - a class that implements an interface

What this was testing: writing a class against a declared contract, and the
ordinary bookkeeping of a scores table. `implements Ledger` is what turns a
missing method into an error on the class rather than an error at every call
site.

The classic mistake is a single sort key: sorting only by points leaves tied
players in whatever order the `Map` happened to produce, which is stable in
practice and unspecified in principle. The gate includes a tie for that reason.

The model answer keeps a `Map<string, number>`, adds `points` to white and
`1 - points` to black in one place, and sorts with a comparator that falls
through to the name when the points are equal.

## ex7 - a construct signature

What this was testing: the difference between the type of an instance and the
type of the class that makes one. `Clock` describes what you get; `new
(startedAt: number) => Clock` describes what you call `new` on, and the two are
never the same type.

The classic mistake is typing the parameter as `Clock`, which then refuses the
class itself - `StepClock` the value is a constructor, not an instance. The
second-classic is `typeof StepClock`, which works and forbids every other class,
defeating the reason the parameter exists.

The model answer declares `interface ClockConstructor { new (startedAt: number):
Clock }`, so `runClock` accepts any class whose instances are clocks -
including the one the gate defines inline, which is the whole demonstration.

## ex8 - the next round of a bracket

What this was testing: nested `readonly` interfaces and a pairing walk that has
to survive three degenerate inputs - an odd number of winners, a match nobody
won, and no winners at all.

The classic mistake is pairing by *match index* rather than by winner position:
it gives the right answer while every match has a winner and quietly pairs the
wrong players the moment one does not. Collect the winners first, then pair.

The model answer builds the winner list in one pass, then steps through it two
at a time; the odd leftover is detected by the second index being out of range,
which is also why the bye carries its `winner` already set - it has nobody to
play.

## Further reading

- [Handbook: Interfaces vs Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) - the short official list of what only one of them can do.
- [Handbook: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) - interface merging, module augmentation, and the rules for when it is allowed.
- [Handbook: Object Types - call and construct signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures) - the syntax behind ex3 and ex7, with the `new` form on the next page.
- [Handbook: Classes - implements clauses](https://www.typescriptlang.org/docs/handbook/2/classes.html#implements-clauses) - what `implements` checks, and the two things people expect it to do that it does not.
- [MDN: Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) - the mutation trap in ex2 and the useful case in ex3.
