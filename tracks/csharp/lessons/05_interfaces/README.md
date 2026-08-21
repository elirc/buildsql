# 05 — Interfaces

An interface is a list of things a type promises to be able to do, with no
statement about what it *is*. That sounds like a small difference from lesson
04's abstract class and it changes everything about how you design: a class has
one base and can implement as many interfaces as it likes, so interfaces are
how a type joins many worlds at once. `string` is comparable, enumerable,
cloneable and equatable, and it did not have to pick one parent to get there.

The practical consequence is the sentence you will hear in every code review:
**depend on interfaces, not on concrete types**. A `Checkout` that says
`DateTime.Now` can never be tested at midnight on the 31st. A `Checkout` that
takes an `IClock` can be handed any moment in history by a three-line fake, and
in production it gets the real one. Same code, and the difference is entirely
in what it asked for.

This lesson is also where C# gets slightly weird — explicit implementations
that are invisible on the class, default methods that only exist through the
interface — and both of those oddities are interview favourites precisely
because they reveal whether you know how the dispatch works.

## Concept — a contract, and four ways to satisfy it

Declaring one is short:

```csharp
public interface IPriced
{
    decimal Price { get; }        // members are public and abstract by default
}
```

No `public` on the members, no bodies (usually), no state — an interface cannot
have fields. A class opts in by listing it after a colon, and the compiler
checks that every member is there:

```csharp
public class Book : IPriced
{
    public decimal Price { get; }     // implicit implementation: also on the class
}
```

**Implicit implementation** is the normal way: the member is public on the
class *and* satisfies the interface. **Explicit implementation** nails a member
to one interface and hides it from the class's own surface:

```csharp
string IEnglish.Greet() => "hello";   // no access modifier; not callable on the class
```

You need it when two interfaces demand the same signature and you want two
different answers, and you sometimes want it to keep a noisy interface out of
your public API — `IDisposable.Dispose` implemented explicitly, say, when your
type prefers to expose `Close()`.

**Default interface members** (C# 8 and later) let an interface ship a body:

```csharp
public interface IAuditEvent
{
    string Actor { get; }
    string Describe() => $"{Actor} did something";   // implementers may skip it
}
```

They exist so a library can add a member to a published interface without
breaking every implementer. The catch, and it is a real one: a default member is
only callable through the interface type, not through the implementing class.
`new LoginEvent("ada").Describe()` does not compile; casting to `IAuditEvent`
first does.

**Composition over inheritance.** Instead of inheriting behaviour, hold an
object that has it and hand it in from outside:

```csharp
public class Checkout
{
    private readonly IClock _clock;
    public Checkout(IClock clock) => _clock = clock;   // constructor injection
}
```

That is dependency injection, before any framework gets involved: the class
names what it needs as an interface and someone else decides which
implementation to supply. The .NET track's lesson 02 is the container that
automates the "someone else".

## Exercise 1 — one contract, two unrelated types

Edit `src/Lessons/L05_Interfaces/Ex1.cs`. `IPriced` demands a `Label` and a
`Price`. `Book` and `Subscription` share no base class and no fields.

Implement `Book.Label` (the title in double quotes: `"Dune"`),
`Subscription.Label` (`news x3`), `Subscription.Price` (the whole subscription:
monthly × months), and `Basket.Total`, which adds up an
`IEnumerable<IPriced>` — mentioning neither concrete type.

```
uv run dojo test csharp 05_interfaces ex1
```

## Exercise 2 — two contracts, one name

Edit `src/Lessons/L05_Interfaces/Ex2.cs`. `IEnglish.Greet()` and
`IFrench.Greet()` have identical signatures, and `Bilingual` implements both.
As shipped it has one public `Greet` that satisfies both at once — which is why
it can only ever give one answer.

Replace it with two **explicit** implementations, so that
`((IEnglish)person).Greet()` is `"hello"` and `((IFrench)person).Greet()` is
`"bonjour"`. Remember: an explicit implementation takes no access modifier.

```
uv run dojo test csharp 05_interfaces ex2
```

## Exercise 3 — a default that most implementers keep

Edit `src/Lessons/L05_Interfaces/Ex3.cs`. Implement `IAuditEvent.Describe()` —
the body inside the *interface* — so it returns `"ada performed login"`, built
from the two properties every implementer promises. `LoginEvent` then needs no
`Describe` at all. `AdminEvent` supplies its own:
`"[ADMIN] root performed delete-user"`.

Watch how the gate declares its variables. `IAuditEvent login = new LoginEvent("ada");`
is not stylistic — a default interface member is unreachable through the class
type, and that is the detail worth taking away.

```
uv run dojo test csharp 05_interfaces ex3
```

## Exercise 4 — collaborators handed in from outside

Edit `src/Lessons/L05_Interfaces/Ex4.cs`. `Checkout` needs the current date and
a discount rule, and is given both as interfaces. Implement the constructor
(store them in the two `readonly` fields) and `Receipt(amount)`, which returns
`"2026-08-20: 90"` — the clock's date formatted `yyyy-MM-dd`, then the amount
after the policy has had it.

`Checkout` must never write `DateTime.Now` and never construct a policy. The
gate supplies a `FixedClock` pinned to 20 August 2026 and a `TenOff` policy that
subtracts 10 — read those three-line classes in the gate; they are what
testability looks like.

```
uv run dojo test csharp 05_interfaces ex4
```

## Challenge — implement an interface the framework already knows

Edit `src/Lessons/L05_Interfaces/Challenge.cs`. `SemVer` holds a major, minor
and patch number. Implement `CompareTo(SemVer? other)` — major first, then
minor, then patch, with `null` sorting before everything — and `ToString()` ->
`"1.2.3"`.

Then read the gate's last block: it calls `versions.Sort()` and you wrote no
sorting code. `List<T>.Sort` found your `CompareTo` through `IComparable<T>`.
That is the deal interfaces offer — implement the contract the framework
already understands, and the framework's machinery starts working on your type.

Honest difficulty note: the trap is comparing the parts as text (`"10"` sorts
before `"9"`) or subtracting to get the sign (fine until the numbers are large
enough to overflow). Both are common enough that the gate checks for them.

```
uv run dojo test csharp 05_interfaces challenge
```

## Review

`review1` is a shipping-rate strategy: one interface, two implementations
(`FlatRate`, `ByWeight`), and an `Order` that takes whichever it is given.
`dojo review` schedules it.

## The gate

This is the entire gate class, `tests/Gates/L05_InterfacesTests.cs`:

```csharp
using CSharpDojo.L05_Interfaces;

namespace CSharpDojo.Gates;

public class L05_InterfacesTests
{
    [Fact]
    public void Ex1_OneContractCoversTwoUnrelatedTypes()
    {
        Book book = new Book("Dune", 12.50m);
        Subscription news = new Subscription("news", 4m, 3);

        Teach.Equal("\"Dune\"", book.Label,
            "A book's label is its title wrapped in double quotes - escape them as \\\" inside "
                + "a C# string - reread README ex1.");
        Teach.Equal("news x3", news.Label,
            "A subscription's label is the service, an x, and the number of months.");
        Teach.Equal(12m, news.Price,
            "Price is the WHOLE subscription: 4 a month for 3 months is 12. The interface asked "
                + "for a price, and each type decides what that means - reread README ex1.");

        List<IPriced> basket = new List<IPriced> { book, news };

        Teach.Equal(24.50m, Basket.Total(basket),
            "12.50 plus 12 is 24.50. Total never mentions Book or Subscription: it only knows "
                + "IPriced - reread README ex1.");
        Teach.Equal(0m, Basket.Total(new List<IPriced>()),
            "An empty basket costs nothing.");
    }

    [Fact]
    public void Ex2_ExplicitImplementationsGiveTwoAnswers()
    {
        Bilingual person = new Bilingual();

        Teach.Equal("hello", ((IEnglish)person).Greet(),
            "Through IEnglish, Greet says \"hello\". One class, two contracts, two "
                + "implementations - reread README ex2.");

        Teach.Equal("bonjour", ((IFrench)person).Greet(),
            "Through IFrench, the same object says \"bonjour\". If both calls give the same "
                + "answer you still have one method implementing both interfaces implicitly - "
                + "reread README ex2.");

        Teach.True(person is IEnglish && person is IFrench,
            "Bilingual must still declare BOTH interfaces. Explicit implementation changes how "
                + "the members are reached, not what the class promises.");
    }

    [Fact]
    public void Ex3_DefaultMethodsAreInheritedUnlessReplaced()
    {
        IAuditEvent login = new LoginEvent("ada");

        Teach.Equal("ada performed login", login.Describe(),
            "LoginEvent writes no Describe at all - it takes the default implementation from "
                + "the interface, which reads the two properties - reread README ex3.");

        IAuditEvent admin = new AdminEvent("root", "delete-user");

        Teach.Equal("[ADMIN] root performed delete-user", admin.Describe(),
            "AdminEvent supplies its own Describe, which wins over the interface's default - "
                + "reread README ex3.");

        Teach.Equal("login", login.Action,
            "Action is an ordinary property on the implementer; only Describe has a default.");
    }

    private sealed class FixedClock : IClock
    {
        public DateTime Now => new DateTime(2026, 8, 20);
    }

    private sealed class TenOff : IDiscountPolicy
    {
        public decimal Apply(decimal amount) => amount - 10m;
    }

    private sealed class NoDiscount : IDiscountPolicy
    {
        public decimal Apply(decimal amount) => amount;
    }

    [Fact]
    public void Ex4_CheckoutUsesWhateverItWasGiven()
    {
        Checkout discounted = new Checkout(new FixedClock(), new TenOff());

        Teach.Equal("2026-08-20: 90", discounted.Receipt(100m),
            "The date comes from the injected clock (never DateTime.Now) and the amount from "
                + "the injected policy, which here takes 10 off - reread README ex4.");

        Checkout plain = new Checkout(new FixedClock(), new NoDiscount());

        Teach.Equal("2026-08-20: 100", plain.Receipt(100m),
            "Same Checkout code, a different policy object, a different answer - and Checkout "
                + "needed no changes at all. That is what depending on an interface buys you.");

        Teach.Equal("2026-08-20: 40", discounted.Receipt(50m),
            "The collaborators are stored once in the constructor and reused on every call.");
    }

    [Fact]
    public void Challenge_SemVerTeachesTheFrameworkHowToSortIt()
    {
        SemVer one = new SemVer(1, 2, 3);
        SemVer same = new SemVer(1, 2, 3);

        Teach.Equal(0, one.CompareTo(same),
            "Equal versions compare to 0 - and note that CompareTo says \"same order\", not "
                + "\"same object\" - reread README challenge.");

        Teach.True(new SemVer(1, 9, 9).CompareTo(new SemVer(2, 0, 0)) < 0,
            "1.9.9 sorts before 2.0.0: major wins outright, whatever the other parts say - "
                + "reread README challenge.");

        Teach.True(new SemVer(1, 2, 10).CompareTo(new SemVer(1, 2, 9)) > 0,
            "Compare the parts as NUMBERS: 10 is after 9, though \"10\" sorts before \"9\" as "
                + "text. Comparing the ToString values is the classic wrong answer here.");

        Teach.True(one.CompareTo(null) > 0,
            "By convention every object sorts after null, so CompareTo(null) is positive.");

        List<SemVer> versions = new List<SemVer>
        {
            new SemVer(2, 0, 0), new SemVer(1, 2, 3), new SemVer(1, 0, 0), new SemVer(1, 2, 0),
        };
        versions.Sort();

        Teach.Equal("1.0.0, 1.2.0, 1.2.3, 2.0.0", string.Join(", ", versions),
            "List<T>.Sort found your CompareTo through IComparable<T> - you wrote no sorting "
                + "code at all. string.Join calls ToString on each item, which is the other "
                + "half of this exercise - reread README challenge.");
    }

    [Fact]
    public void Review1_TheOrderDoesNotKnowWhichRateItHas()
    {
        Teach.Equal(5m, new FlatRate(5m).For(20000),
            "A flat rate ignores the weight entirely.");

        Teach.Equal(2m, new ByWeight().For(0),
            "Nothing weighs less than the minimum charge of 2.");
        Teach.Equal(2m, new ByWeight().For(1000),
            "Exactly one kilogram is one kilogram, not two - watch the boundary.");
        Teach.Equal(4m, new ByWeight().For(1001),
            "One gram over rounds UP to the next whole kilogram: 4. Integer division alone "
                + "rounds down, so this needs a deliberate rounding up.");

        Order flat = new Order(new FlatRate(5m));
        Order weighed = new Order(new ByWeight());

        Teach.Equal(35m, flat.TotalFor(30m, 1500),
            "Goods plus shipping, with the flat policy.");
        Teach.Equal(34m, weighed.TotalFor(30m, 1500),
            "The same order, the same Order class, a different injected policy - reread README "
                + "review.");
    }
}
```

In plain English: `Ex1` prices a book and a subscription and totals them through
the interface. `Ex2` calls `Greet` through each interface on one object. `Ex3`
checks the inherited default and the replaced version. `Ex4` builds two
`Checkout`s with different fake policies and compares the receipts. `Challenge`
checks the comparison contract in four ways and then lets `List<T>.Sort` use
it. `Review1` is the spaced-repetition variant. The little `FixedClock`,
`TenOff` and `NoDiscount` classes inside the gate are test doubles — the whole
reason ex4's design is worth the extra constructor parameter.

## The teaching point

Interfaces are how .NET is extensible without knowing about you. `IEnumerable<T>`
is why your class can be `foreach`ed; `IComparable<T>` is why it can be sorted;
`IDisposable` is why `using` knows to clean it up; `ILogger` is why your custom
logger drops into ASP.NET Core. Every one of those is the same deal: implement
the contract, inherit the ecosystem.

The design habit — ex4's — is the one that changes how your code feels to work
with. A class that constructs its own collaborators has hard-coded a decision
that belongs to whoever assembles the application. A class that asks for them by
interface can be tested with fakes, reconfigured per environment, and reused in
a context you never imagined. The cost is one constructor parameter and the
discipline of not reaching for `new` in the middle of your logic.

Next: **06_structs_records**, where you meet the types that behave like values —
and the equality rules that come with them.
