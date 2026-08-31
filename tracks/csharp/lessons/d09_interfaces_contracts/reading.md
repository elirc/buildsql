# Reading - csharp/d09_interfaces_contracts

## Notes

An interface is a promise with no implementation attached, and everything in
this set follows from one consequence of that: **the promise can be kept by
types that have nothing else in common, including types written later, in
another assembly, by somebody else.** A class hierarchy cannot do that; a
`struct` cannot join one at all.

The pattern that recurs is *narrowing*. `Document.Total` asks for
`IWordCount`, not for `Paragraph`. `Docs.LengthOf` asks for `IReadableDoc`, not
`MemoryDoc`. `Catalogue.Describe` asks for `IReadStore<T>`, not the store that
can also delete. Every one of those parameter types is a decision about how
little the method needs to know, and the payoff is that the method keeps
working when the world around it changes - and can be tested with a fake.

The second thread is that interfaces are where the framework meets your code.
`IComparer<T>` is how `List.Sort` learns your ordering; `IDisposable` is how
`using` knows what to unwind; `IEnumerable<T>` is how `foreach` works. Writing
those implementations correctly is not decoration - it is what makes your type
a first-class citizen of the BCL.

## ex1

Really testing: that an interface unifies unrelated types, including a struct.
The classic mistake is reaching for an abstract base class instead, which works
until you need a `struct` or a type you do not own to join in. `Largest`
starting at 0 handles the empty sequence without a branch, which is the same
"choose the identity value" trick from d01. The detail worth carrying away is
the cost: putting `ImageBlock` into an `IWordCount[]` **boxes** it, copying the
struct to the heap so a reference can point at it. That is why the guidance for
structs is to keep them small and to be wary of interface-typed collections of
them.

## ex2

Really testing: the difference between `IComparable<T>` - one natural order,
baked into the type - and `IComparer<T>`, an ordering that lives in its own
object so a type can be sorted several ways. The classic mistake is
`x.Seconds - y.Seconds`, which is right for small numbers and overflows for
large ones; `CompareTo` cannot. The second is omitting the tie-break:
`List<T>.Sort` is **unstable**, so equal elements can come back in any order
and that order can change between runs and framework versions. Any comparer
used for display needs a total order. And `Ordered` sorting a copy is not
politeness - a method that quietly reorders its argument is a bug generator.

## ex3

Really testing: that a class can implement many interfaces, and that the
interesting decision is in the *parameter* types. The classic mistake is
declaring `LengthOf(MemoryDoc doc)`, which compiles, works, and cannot be
called with a `FrozenDoc` or with a test fake. `CanWrite` shows the other half:
`is` asks about the object, so narrowing a variable to `IReadableDoc` loses
nothing. This is the interface-segregation principle in miniature - many small
contracts beat one big one, because a caller can then depend on exactly the
part it uses.

## ex4

Really testing: explicit interface implementation, which removes a member from
the class's own surface so it can only be reached through the interface. Three
legitimate reasons: keeping an infrastructure concern (`ToRow`) off a domain
type's API; disambiguating two interfaces that declare the same member; and
implementing an awkward legacy interface alongside its modern replacement. The
cost is real too - an explicit implementation on a struct is reachable only by
boxing, and a caller holding the concrete type has to know to cast. The gate
uses reflection because "does not appear on the class" is exactly the property
being bought.

## ex5

Really testing: default interface members, and the thing everyone gets wrong
about them. The body lives in the interface and is **not inherited into the
class**, so `new SalesReport(...).Summary()` does not compile - you must hold
the object as an `IReportable`. That is a feature, not an oversight: default
members exist so a library can add a member to a published interface without
breaking implementers, not as a way to share code (an abstract base class is
still the right tool for that). Note also that the default body calls the
interface's other members, which is what makes it useful at all.

## ex6

Really testing: the `IDisposable` contract, whose one hard rule is that
disposing twice must be harmless. A guard flag set *before* the work is the
whole implementation, and setting it first also protects against a child whose
`Dispose` re-enters the scope. The reverse order matters for the same reason
nested `using` blocks unwind backwards: a resource acquired later may depend on
one acquired earlier. The classic mistake is disposing in insertion order,
which usually works and fails exactly when a dependency exists. Worth having an
answer ready for "what if a child throws?" - you should still dispose the rest,
which is why real container code wraps the loop.

## ex7

Really testing: generic interfaces plus constraints, and splitting a contract
in two. `where T : class, IHasId` buys `Save` the right to read `item.Id` -
without it the compiler knows nothing about T. The split is the design point:
`Catalogue.Describe` takes `IReadStore<T>` so it *cannot* delete anything, and
a reader who sees the signature knows that without reading the body. The
classic mistake is one fat `IRepository<T>` with a dozen members, which forces
every consumer and every test double to care about operations it never uses.

## ex8

Really testing: the decorator pattern - a class that implements an interface
*and* wraps another implementation of it, so callers cannot tell the
difference. This is how caching, logging, retries, metrics and authorisation
get added in real systems without touching either the caller or the real
implementation. The subtle rule is in the ordering of the last three lines:
delegate, then store, then return - so an exception from the inner source
prevents the cache write, and the failure is not remembered. Caching a "not
found" would mean that adding the missing price later never takes effect, which
is the kind of bug that survives three deployments.

## Further reading

- [Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces) - declaring, implementing, and what they may contain.
- [Explicit interface implementation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation) - the syntax and the reasons.
- [Default interface methods](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions) - the versioning problem they solve.
- [`IComparer<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.icomparer-1) and [`IComparable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.icomparable-1) - which to use when.
- [Implementing a Dispose method](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose) - the contract ex6 keeps.
- [Generic constraints](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters) - what each constraint buys you.
