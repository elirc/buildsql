# Reading - csharp/d05_classes_construction

## Notes

The skill drilled here is **making invalid states unrepresentable**, and every
problem is one tactic for it. A constructor that throws means no caller ever
holds a half-built object. Chaining means the validation exists once. A private
constructor with named factories means the caller cannot express an ambiguous
request. A private collection with a read-only view means nobody edits your
state behind your back. A copy on the way in and on the way out means nobody
edits it by accident either.

The pattern that unites them: **decide where each rule lives, and put it there
exactly once.** Duplicated validation drifts apart; validation spread across
callers is validation you cannot audit; validation that runs after the fields
are assigned leaves a corpse in memory for a debugger to find.

The last two exercises are about the object's life *after* construction - an
invariant that four methods have to maintain between them, and a builder that
accumulates state until someone asks for the result. Both are places where
"which method is allowed to break this rule?" has to have the answer "none".

## ex1

Really testing: guard-then-assign, and picking the right exception type. The
classic mistake is validating after assigning, which throws but leaves the
object partially initialised - harmless for a local, dangerous when the
constructor also registered the object somewhere. The type distinction is worth
memorising: `ArgumentException` for structurally wrong input, and its derived
`ArgumentOutOfRangeException` for a value outside its range - and note the
constructor argument order flips between them, which is a genuine trap. The
normalisation is a design point rather than a rule: doing `Trim().ToUpperInvariant()`
once, in the constructor, means every later reader gets the canonical form.

## ex2

Really testing: `: this(...)`. The classic mistake is copying the three
assignments into the cube constructor, which compiles, works for good input,
and silently skips the validation - which is why the gate asserts `new Box(0)`
throws. Constructor chaining runs the target constructor *first*, then the
delegating constructor's own body, so the fields are already valid by the time
your extra code runs. The computed properties are the second half: `Volume` is
derived from state that cannot change, so storing it would create a second
source of truth for no benefit.

## ex3

Really testing: the named-constructor pattern. Constructors can only be
distinguished by their parameter *types*, so two ways of building a
`Temperature` from one `double` is impossible with constructors alone - and
`new Temperature(20)` would be ambiguous to a reader even if it compiled. Static
factories have names, can return a cached instance or a subclass, and can fail
by returning null or a `TryCreate` bool. The classic mistake here is repeating
the absolute-zero check in both factories; having `FromFahrenheit` convert and
then call `FromCelsius` keeps the rule in one place, and the gate's -500 F case
passes for free.

## ex4

Really testing: encapsulating a collection. Two leaks are possible - storing
the caller's collection rather than copying it, and handing the internal list
straight out - and this exercise closes the first. `IReadOnlyList<T>` is the
usual return type, and it is worth knowing exactly what it promises: the
*interface* has no mutators, but the object behind it is still your `List<T>`,
so a determined caller can cast back. `AsReadOnly()` returns a genuine wrapper
that cannot be cast back, at the cost of an allocation. The `index <= 0` test
in `MoveUp` folding "missing" and "already first" into one branch is a nice
trick and a comment-worthy one.

## ex5

Really testing: that `readonly` constrains the field, not the object. This is
the same distinction as lesson 01's value-versus-reference semantics, arriving
as a security problem: a `readonly string[]` can be rewritten element by element
by anyone who has a reference to it. Both directions matter, and the classic
mistake is closing only one - copying on the way in and then returning the
field, or vice versa. For `string` elements a shallow copy suffices because
strings are immutable; if the elements were mutable, you would have the same
question one level down. The alternative design - return `IReadOnlyList<T>` and
skip the copies - is cheaper and equally defensible, and knowing when to choose
each is the actual skill.

## ex6

Really testing: that `Deconstruct` is a convention, not an interface. Any void
method called `Deconstruct` whose parameters are all `out` enables tuple
assignment on the type, overload-resolved by the number of variables the caller
writes. The classic mistake is returning a tuple instead - `(double, double)
Deconstruct()` compiles but does nothing for `var (a, b) = x`. The second
detail worth noticing is that the bounds are inclusive: `new Coordinate(90,
180)` must succeed, and off-by-one at a boundary is the single most common
validation bug there is.

## ex7

Really testing: keeping a derived value in step with the data it summarises.
State the invariant first - `AvailableCount` equals the number of free seats -
and then every method has one obligation. The classic mistake is decrementing
the counter before checking whether the seat was already taken, so a
double-booking silently corrupts the count; the gate's repeated `Reserve` and
repeated `Release` exist to catch exactly that. The second classic mistake is
the index arithmetic: `(row - 1) * SeatsPerRow + (seat - 1)` multiplies by the
row *length*, and using `Rows` instead is the bug the `Reserve(2,3)` /
`IsReserved(1,3)` pair is designed to find. Putting the bounds checks in one
private helper is the other half of the lesson: validation written three times
eventually disagrees with itself.

## ex8

Really testing: the builder pattern, and the difference between an argument
error and a state error. `return this;` is the whole mechanism, and it means
the chain mutates one object rather than producing copies - which is why the
gate checks `ReferenceEquals`. The query-parameter rule (insertion order,
replace in place) is a deliberate nudge away from `Dictionary<,>`, whose
enumeration order is unspecified. The exception distinction is the interview
point: `ArgumentException` says "you passed me something wrong",
`InvalidOperationException` says "everything you passed was fine, but the
object is not in a state where this makes sense". Confusing the two is common
and tells a reviewer a lot.

## Further reading

- [Constructors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constructors) - chaining, field initialisers, and the order they run in.
- [Using constructors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/using-constructors) - including private constructors and factories.
- [`readonly`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly) - exactly what it does and does not freeze.
- [Deconstructing tuples and other types](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/deconstruct) - the `Deconstruct` convention.
- [Choosing exception types](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/using-standard-exception-types) - `ArgumentException` versus `InvalidOperationException`.
- [`IReadOnlyList<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ireadonlylist-1) - what the read-only interfaces promise.
