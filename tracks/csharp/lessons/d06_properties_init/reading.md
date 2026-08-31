# Reading - csharp/d06_properties_init

## Notes

A property is a pair of methods pretending to be a field, and the whole point
of the pretence is that **you can change the rule without changing every caller
who reads the value**. These eight problems walk the ways that pays off: a
private setter so only the class can change state; a computed property so a
derived value can never go stale; a guarded setter so an invalid value cannot
be stored; an `init` accessor so an immutable type can still refuse bad input.

The second thread is *where truth lives*. `Total` computed from `Subtotal` and
`TaxRate` has one source of truth; `Total` stored alongside them has two, and
two sources of truth eventually disagree. The only good reason to store a
derived value is cost, and the moment you do, you owe the codebase an
invalidation - which is exactly what ex5 is about.

The rule of thumb worth carrying out of this set: a property should be cheap,
should have no side effects a caller could be surprised by, and should be
readable twice in a row with the same answer. Anything else is a method.

## ex1

Really testing: `{ get; private set; }` as an encapsulation tool. Because the
setter is private, `Charge` and `Drain` are the *only* routes to changing the
charge, so their clamping cannot be bypassed - which is the entire argument for
the pattern. The classic mistake is `Percent` computed as
`ChargeMah * 100 / CapacityMah` in `int`, which truncates and reports 66% for
two thirds. The model answer moves to `double` before dividing and rounds away
from zero, which is d01 ex2's lesson arriving in a class.

## ex2

Really testing: `init` and the discipline of computed values. `init` gives you
immutability with object-initialiser ergonomics - no five-parameter
constructor, and no setter to worry about afterwards. The classic mistake is
`Total => Subtotal + Subtotal * TaxRate`, recomputing the tax instead of
reading the rounded `Tax` property, which produces an invoice whose lines do
not add up to its own total. That bug is real, common, and found by accountants
rather than by tests. The other detail is that formatting (`"0.00"`) and
rounding (`Math.Round`) are different jobs; presenting two decimals does not
make the arithmetic right.

## ex3

Really testing: `required`, and what it does and does not promise. It turns
"you forgot to set this" from a null reference at 3am into a compile error with
the property named. It is enforced by the compiler, which means it protects C#
callers and does nothing about reflection, deserialisers, or code compiled
against an older version. The classic misconception is treating it as
validation: `required string To` guarantees somebody assigned it, not that they
assigned an email address. Pair it with `init`-accessor checks (ex7) when the
value itself has rules.

## ex4

Really testing: a property body as the place a rule lives, and the judgement
call between clamping and throwing. Clamping is right here because a volume
control has no invalid request - 300 obviously means "as loud as possible" -
and wrong in ex7, where a table for zero people is meaningless. The second
teaching point is keeping "what you asked for" and "what you get" as separate
members: zeroing the level on mute would destroy information the class is
supposed to remember, and `Effective` derived from `Muted` and `Level` keeps
both answers available with no extra state.

## ex5

Really testing: cache invalidation, which is the half of caching that is
actually hard. The easy half - remember the value in a nullable field - takes
one line. The hard half is that every mutator now has an obligation, and
forgetting it in one place produces a bug that only appears after a specific
sequence of calls. The classic mistake is exactly that: `Add` updates the list
and not the cache, so the basket quietly under-charges. The gate's
add-then-read sequence is there to catch it. `??=` is the idiomatic form when
you do not need to count computations; knowing why it does not fit here is
worth as much as knowing the operator.

## ex6

Really testing: validate-then-assign inside a setter, and the fact that a
computed property automatically follows whatever the setter allowed through.
The classic mistake is assigning first and validating afterwards, which throws
*and* corrupts - the gate checks the previous value survives a rejected
assignment. `nameof(value)` is the correct parameter name in a setter, which
surprises people the first time. And `Strength` reading the field rather than
caching a score means it can never disagree with the password it describes -
the same single-source-of-truth argument as ex2, with the cost small enough
that nobody should be tempted.

## ex7

Really testing: that `init` is a real accessor with a body, which is what lets
an object-initialiser type keep an invariant. Without it you would need a
constructor, and then you lose the initialiser syntax that made the type
pleasant. Two details reward attention: an `init` accessor may assign a
`readonly` field (the compiler treats it like a constructor for that purpose),
and `WithGuests` gets its validation for free by going through the same
accessor. That last point is exactly what a `record`'s `with` expression does
under the hood - writing one by hand once demystifies the feature permanently.

## ex8

Really testing: an indexer, plus a small piece of design judgement. Indexers
are the right shape when the type *is* a lookup; they are the wrong shape when
the argument is really an option, because `thing[true]` tells a reader nothing.
The override-clearing rule is the interesting part: storing an override equal
to the default would leave a settings screen reporting a change that is not a
change, so the setter compares first. The classic mistake is using
`Dictionary<,>` enumeration order for `ModifiedKeys` - it is unspecified, it
looks stable in testing, and it changes the day someone adds a key. Sort
explicitly, and sort ordinally, so the answer does not depend on the machine's
locale.

## Further reading

- [Properties](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties) - accessors, accessibility, expression bodies.
- [`init`-only setters](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/init) - what "initialisation-only" means exactly.
- [`required` members](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required) - the compile-time contract and its limits.
- [Object and collection initialisers](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/object-and-collection-initializers) - the syntax `init` exists to serve.
- [Indexers](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/) - declaring them, and when they are the wrong idea.
- [Choosing between properties and methods](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-properties-and-methods) - the design guideline this whole set leans on.
