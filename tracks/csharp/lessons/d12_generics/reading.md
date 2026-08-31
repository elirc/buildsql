# Reading - csharp/d12_generics

## Notes

Generics let you write an algorithm once and have the compiler check it for
every type it will ever be used with. The mechanism is simple and the skill is
entirely in the **constraints**: a type parameter with no constraint is almost
useless (you may store it, pass it, and compare it with null), and every
constraint you add buys you exactly one more thing you may do.

That is the pattern running through all eight problems. `IComparable<T>` buys
`CompareTo`. `new()` buys `new T()`. `notnull` buys the right to be a
dictionary key. `class` and `struct` decide what `T?` even means. The design
question is always the same: what is the *smallest* promise this code needs?
Ask for more and you shut out callers; ask for less and you cannot write the
body.

The second thread is that .NET generics are real at run time, not erased.
`List<int>` is a distinct type with no boxing, `typeof(T)` works, and a
constraint is enforced by the runtime as well as the compiler. That is why
generic code in C# is fast rather than merely convenient - and why
`EqualityComparer<T>.Default` can find your `IEquatable<T>` implementation and
skip the boxing entirely.

## ex1

Really testing: that an unconstrained `T` is enough for anything that only
moves values around. Neither method inspects a `T` at all, so neither needs a
constraint - and adding one "just in case" would narrow the method for no
benefit. `Interleave` is the interesting half: it needs two enumerators
advanced independently, which `foreach` cannot express, so it drops to
`GetEnumerator` and `MoveNext`. The `using` on each enumerator is not optional
politeness - `IEnumerator<T>` is `IDisposable`, `foreach` disposes it for you,
and hand-written iteration has to do it itself.

## ex2

Really testing: a generic type with two parameters, and what happens when a
member reorders them. `Swapped()` returning `Pair<TSecond, TFirst>` looks
exotic and is ordinary substitution. The thing worth internalising is that
`Pair<int, string>` and `Pair<string, int>` are genuinely different types at run
time, with different static fields and no conversion between them - unlike
Java, where erasure makes them the same class. The naming convention (`TFirst`,
`TKey`, `TResult`) is a real readability tool once a signature has three of
them.

## ex3

Really testing: that `class`, `struct` and `notnull` are three different
promises. The one that catches people is that `T?` means different things under
each: an annotation on a reference type under `class`, `Nullable<T>` under
`struct`, and nothing at all without one. The other lesson is structural -
constraints do **not** participate in overload resolution, so two methods
differing only by constraint will not compile, which is why the two fallback
methods here have different names. `notnull` is worth knowing precisely: it is
a nullability constraint enforced by the compiler's flow analysis, not a
runtime check, and it exists because `Dictionary<TKey, TValue>` demands it.

## ex4

Really testing: building an entire type out of one constrained member.
Everything in `Range<T>` is `CompareTo`, because `<` and `>` are not available
on a `T` the compiler knows nothing about. The classic mistake is getting a
comparison the wrong way round - it compiles perfectly and inverts the answer -
which is why reading each line out loud as a sentence is worth the ten seconds.
`Overlaps` rewards thinking about the negation: "they do not overlap when one
ends before the other begins", negated, is shorter and easier to check than
enumerating the overlapping cases.

## ex5

Really testing: the `new()` constraint, and one ordering decision. `new T()` is
only legal because of the constraint, and it compiles to an
`Activator.CreateInstance`-shaped call rather than a direct `newobj` - which is
why `new()` has a small but real cost and why a `Func<T>` factory parameter is
often the better design. The ordering matters: check the free list before the
limit, or a pool sitting at its maximum refuses to hand back an object it
already owns. `InvalidOperationException` is the right type for the same reason
as d05 ex8 - the arguments were fine, the object's state was not.

## ex6

Really testing: several type parameters at once, and delegates as parameters.
Every parameter here is inferred from the arguments, so callers never write
angle brackets - which is exactly how LINQ reads. The decision worth being
deliberate about is the duplicate key: this specification says the later value
wins (`dictionary[key] = value`), while LINQ's own `ToDictionary` throws. Both
are defensible and the surprise is expensive, so a method like this should say
which it does in its documentation - and this one does.

## ex7

Really testing: memoisation, which is d09 ex8's caching decorator generalised
to any key and value. The two details that separate a correct implementation
from a plausible one: the factory is called *outside* the dictionary write, so
a throwing factory leaves the memo unchanged and the next call retries; and
`FactoryCalls` counts real invocations, so the gate can prove the second lookup
did not recompute. The honest limitation is worth stating in an interview: a
memo with no eviction policy is a memory leak with a friendly name, and the
production versions add a size bound, an LRU policy or weak references.

## ex8

Really testing: counting, plus an ordering requirement a dictionary cannot
satisfy. `Dictionary<TKey, TValue>` promises no enumeration order at all, so
"ties broken by first seen" needs the insertion order recorded separately. The
elegant part is that LINQ's `OrderByDescending` is a **stable** sort - equal
elements keep their input order - so ordering the first-seen list by count
gives the tie-break for free. That stability is a documented guarantee of the
LINQ `OrderBy` family and explicitly *not* of `List<T>.Sort` or `Array.Sort`,
and knowing which sorts are stable is the kind of detail that separates a
correct report from one that changes between runs.

## Further reading

- [Generics](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics) - the feature, from the top.
- [Constraints on type parameters](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters) - every constraint and what it buys.
- [Generic methods](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generic-methods) - declaration and type inference.
- [Differences between C++ templates and C# generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/differences-between-cpp-templates-and-csharp-generics) - why .NET generics are real at run time.
- [`Func<T, TResult>`](https://learn.microsoft.com/en-us/dotnet/api/system.func-2) - the delegate ex6 and ex7 take.
- [Sorting data with LINQ](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/sorting-data) - including the stability guarantee.
