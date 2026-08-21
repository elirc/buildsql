# Reading - csharp/05_interfaces

## Notes

**Interface versus abstract class, the answer to give.** An abstract class can
hold state, constructors, and non-public members, and a type may have only one.
An interface holds no state, and a type may implement any number. So: use an
abstract class when the implementers genuinely share *implementation and data*
and form one family; use an interface when you want to describe a *capability*
that unrelated types can have. The .NET framework itself is the worked example
— `Stream` is an abstract class (real shared buffering machinery, and every
stream is a stream), while `IDisposable` is an interface (a file, a database
connection and a subscription have nothing else in common). If you find
yourself wanting both, that is fine and normal: `List<T>` derives from nothing
interesting and implements six interfaces.

**Structural promise, nominal check.** C# interfaces are *nominal*: a type
implements `IPriced` only if it says so. Having a matching `Price` property is
not enough, which is the opposite of TypeScript's structural typing. That
matters when you meet a type you cannot edit — you cannot retrofit an interface
onto someone else's class, and the standard workaround is the *adapter*: a
small class of yours that implements the interface and forwards to theirs.

**How the runtime dispatches an interface call.** Each type carries an
interface map alongside its method table, so calling `item.Price` on an
`IPriced` variable is a lookup plus a call — slightly more expensive than a
virtual call, and irrelevant outside very hot loops. What is *not* irrelevant:
calling an interface member on a struct **boxes** it unless the call is
constrained by a generic type parameter. That is one of the reasons lesson 07's
generic constraints exist, and a real interview question.

**Interfaces name the seam.** The design value of `IClock` is not
polymorphism — you will probably only ever have two implementations, the real
one and the fake. It is that the interface marks the boundary between "my
logic" and "the messy outside world" (time, the network, the file system,
randomness). Code on your side of that line is deterministic and testable; code
on the other side is not. Every hard-to-test class you meet in the wild has that
line running straight through the middle of a method.

## ex1

The point of this exercise is what `Basket.Total` *cannot* see. It holds
`IPriced`, so `Title` and `Months` do not exist as far as it is concerned. That
narrowing is the whole trade: you give up access to everything a type offers in
return for accepting anything that offers this much.

That trade is also why interfaces should be small. An interface with fifteen
members is a promise almost nothing can make honestly, and the classes that do
implement it end up throwing `NotSupportedException` from half of them —
the standard example being `System.Array` implementing `IList<T>` and throwing
on `Add`. "Interface segregation", the I in SOLID, is exactly this observation:
prefer several small contracts to one large one.

`Subscription.Price` computing rather than storing is lesson 03's point coming
back. The interface says "you can be asked for a price"; it says nothing about
where the number lives, and the subscription's answer is arithmetic over data it
already has.

## ex2

Explicit implementation is the answer to a real collision: two interfaces, one
signature, two meanings. It is rare in application code and common in framework
code, where the second reason for it matters more — hiding a member from your
type's public surface.

The mechanical detail worth knowing: an explicitly implemented member has no
access modifier because it genuinely is not part of the class's interface. It
lives in the type's interface map, reachable only by casting. That also means
calling it on a **struct** boxes the struct, which is why the guidance for value
types is to implement interface members implicitly wherever you can.

The classic use in the wild is `IEnumerable.GetEnumerator()` — the old
non-generic one — implemented explicitly so that only `IEnumerable<T>`'s typed
version shows up on your class. You will write exactly that in lesson 08.

## ex3

Default interface members arrived in C# 8 for a specific reason: API
versioning. Before them, adding a member to a published interface broke every
implementer on the planet at compile time, which is why .NET's interfaces were
frozen for a decade and why "extension methods on the interface" became the
standard workaround. Now a library can add a member *with* a default and
existing implementers keep compiling.

The oddity you met — a default member being invisible on the implementing class
— follows from how it is implemented. The body lives in the interface, so the
call has to be dispatched through the interface; the class never got a copy.
This makes default members good for "here is the obvious implementation in
terms of the other members" and bad as a general code-sharing mechanism. When
you want shared implementation available everywhere, an abstract base class or
a plain helper is still the better tool.

Worth knowing for interviews: this is *not* multiple inheritance of state.
Interfaces still cannot have fields. If two interfaces supply conflicting
defaults, the implementing class must resolve it explicitly, which is the
diamond problem being handed back to you rather than guessed at.

## ex4

The design in ex4 has three names depending on who you ask: *dependency
injection* (the collaborators arrive from outside), *inversion of control* (the
class no longer decides which implementation it gets), and the *strategy
pattern* (the discount policy is an interchangeable algorithm). They describe
the same shape from different angles.

What makes it worth the extra constructor parameter is the gate's `FixedClock`.
Time, randomness, the network, the clock on the wall and the file system are
all *ambient dependencies* — things a method reaches out and grabs rather than
being handed. Every one of them makes a test either flaky or impossible, and
every one of them has a standard interface-shaped fix. In real .NET you would
use `TimeProvider` (built in since .NET 8) rather than rolling your own
`IClock`, but the mechanism is exactly what you just wrote.

Note the fields are `readonly`. A collaborator assigned once in the constructor
and never repointed is easier to reason about, and the compiler will hold you to
it — the same lesson-03 note applies, that `readonly` protects the arrow rather
than the object it points at.

## challenge

`IComparable<T>` is the deal interfaces offer in its clearest form: implement
one method to the framework's specification, and `List<T>.Sort`,
`Array.Sort`, `OrderBy`, `SortedSet<T>`, `Max` and `Min` all start working on
your type. You wrote no sorting algorithm. You described an order.

The contract has rules, and violating them corrupts sorts in ways that are hard
to debug: the comparison must be *consistent* (if a < b and b < c then a < c),
*antisymmetric* (if a < b then b > a), and stable for equal items in the sense
that `x.CompareTo(x)` is 0. `List<T>.Sort` uses an introsort that will happily
produce nonsense — or throw `InvalidOperationException: IComparer.Compare()
method returns inconsistent results` — if you break them.

Two traps the gate checks. Comparing `ToString()` values is text ordering, and
`"1.2.10"` sorts before `"1.2.9"`. Returning `Major - other.Major` works until
someone compares `int.MinValue`, at which point the subtraction overflows and
the sign flips. `int.CompareTo(int)` has neither problem and reads better.

The related interface is `IEquatable<T>`, and the two together raise the
question lesson 06 answers: what does it mean for two of your objects to be
"equal"?

## review1

The strategy pattern again, in the smallest possible form: `Order` adds goods
to whatever number the rate hands back, and cannot tell a flat rate from a
weight-based one. Adding a third rate — free shipping over £50, say — means
writing one new class and changing nothing that already works. That is the
"open for extension, closed for modification" line, and this is what it looks
like when it is not a slogan.

The rounding-up trick, `(n + 999) / 1000`, is worth keeping. Integer division
truncates, so rounding up needs either that idiom or a float round trip via
`Math.Ceiling`, and the integer version has no precision question at all. Where
the minimum charge lives is the design question: inside the rate, because
`Order` should not know that one policy has a floor.

## Further reading

- [Interfaces (C# programming guide)](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces) — declaring, implementing, and what an interface may contain.
- [Explicit interface implementation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation) — the collision case and the hiding case, with examples.
- [Default interface methods tutorial](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/default-interface-methods-versions) — the versioning problem they were designed to solve.
- [`IComparable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.icomparable-1) — the contract, including the null rule and the consistency requirements.
- [Dependency injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) — where constructor injection goes once a container is involved.
- [`TimeProvider`](https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider) — the framework's own `IClock`, and what to use in real code.
