# 03 — Classes and objects

Everything you have written so far has been a `static` method: a pure function
of its arguments, holding nothing between calls. That is a fine way to write a
calculator and a hopeless way to write a bank account, because an account *is*
a piece of state with rules attached — a balance that must never go negative, an
owner that must never change, a history of things that happened to it.

A class is how C# packages state together with the only code allowed to touch
it. That last clause is the whole idea, and it is worth being blunt about: the
point of a class is not that it groups related things, it is that it *forbids*
things. A `private` field can only be changed by methods you wrote, so if the
balance is ever wrong, the suspects are in one file. Losing that is what makes
a codebase of public fields miserable to change.

This lesson is the mechanics — fields, constructors, properties, static
members, access modifiers — but keep the idea in view, because lesson 04 and 05
are both about who gets to see what.

## Concept — an object is state plus its rules

The smallest useful class:

```csharp
public class Counter
{
    private int _count;                     // state: private, so it is ours

    public int Count => _count;             // a read-only view of it

    public void Increment() => _count++;    // the only way it ever changes
}
```

`new Counter()` makes an instance; each instance has its own `_count`. The
underscore prefix on private fields is a .NET convention, not a rule.

**Properties are methods that look like fields.** `public int Count => _count;`
compiles to a `get_Count()` method. That matters because you can change the
implementation later — validate, compute, log — without every caller having to
change. Which is why C# code exposes properties and not public fields, even
when the property does nothing but hand a field back.

The short forms, in increasing order of freedom:

```csharp
public string Name { get; }              // set only in the constructor
public string Name { get; init; }        // set in an object initialiser, then frozen
public int Balance { get; private set; } // anyone reads, only this class writes
public int Age { get => _age; set => _age = value; }  // your own logic; `value` is the incoming one
```

**Constructors put the object into a legal state.** They run once, they can
take arguments, and until one finishes there is no object:

```csharp
public class Account
{
    public Account(string owner)
    {
        Owner = owner;      // a get-only auto-property IS assignable here
    }

    public string Owner { get; }
}
```

If you write no constructor at all, C# gives you a parameterless one for free.
Write one and that gift disappears — which is how you make it impossible to
create an `Account` with no owner.

**Object initialisers and `init`.** For data-shaped types, an initialiser reads
better than a constructor with six arguments:

```csharp
var card = new LessonCard { Slug = "07_generics", Exercises = 4 };
```

`init` accessors allow exactly this and nothing after it: the property is
writable while the object is being built and read-only forever afterwards.
`required` (which `LessonCard.Slug` uses) makes the compiler insist the caller
supplies it, giving you a constructor's guarantee with an initialiser's syntax.

**Static means "belongs to the type".** A static field exists once, no matter
how many instances there are; a static method has no `this` and cannot touch
instance state. Shared counters, factory methods and `Math.Max` are static.
Nearly everything else should not be — static state is global state, with all
of global state's problems.

**Access modifiers** you need today: `public` (everyone), `private` (this type
only — the default for members), `internal` (this assembly). Start everything
`private` and open it only when something outside genuinely needs it.

## Exercise 1 — an object that protects an invariant

Edit `src/Lessons/L03_ClassesObjects/Ex1.cs`. Finish the `Account` class:

The constructor takes an owner and leaves the balance at zero. `Deposit(amount)`
adds money, and throws `ArgumentOutOfRangeException` for an amount of zero or
less. `Withdraw(amount)` takes money out and returns `true` — unless the balance
cannot cover it, in which case it changes **nothing** and returns `false`.

Notice the deliberate asymmetry: overdrawing is an ordinary thing customers do,
so it is a return value; depositing minus five pounds is a bug in the calling
code, so it is an exception. That distinction is lesson 12's whole subject, met
early.

```
uv run dojo test csharp 03_classes_objects ex1
```

## Exercise 2 — properties that compute

Edit `src/Lessons/L03_ClassesObjects/Ex2.cs`. `LessonCard` already declares
three `init`-only properties. Implement the two computed members:

`TotalExercises` is the core count plus one when there is a challenge.

`Display` reads `"07_generics: 4 exercises + challenge"` — and
`"00_hello_dojo: 3 exercises"` when there is no challenge, and
`"23_transactions: 1 exercise + challenge"` for exactly one exercise. The
pluralisation rule is lesson 00's, again.

Neither member stores anything. They are read at the moment someone asks, from
data that cannot change after construction.

```
uv run dojo test csharp 03_classes_objects ex2
```

## Exercise 3 — one counter, many objects

Edit `src/Lessons/L03_ClassesObjects/Ex3.cs`. `Robot.Built` is a static count of
how many have been made; `robot.Serial` is the number this particular robot got.
Implement the constructor so the first robot built is serial 1, and implement
`Reset()` so the counter goes back to zero — without disturbing the serials of
robots that already exist.

```
uv run dojo test csharp 03_classes_objects ex3
```

## Exercise 4 — a property with a body

Edit `src/Lessons/L03_ClassesObjects/Ex4.cs`. `Thermostat` keeps a private
`_celsius` field. Implement the `Celsius` property so reading hands the field
back and writing **clamps** into `Minimum..Maximum` (5 to 30) instead of
throwing — a physical dial cannot argue with you. Then implement `Fahrenheit`,
a get-only property computing `C × 9/5 + 32`, rounded to a whole degree.

Setting `Celsius = 100` and reading back `30` is the point: a property is a
method, and methods can have opinions.

```
uv run dojo test csharp 03_classes_objects ex4
```

## Challenge — a class that owns a collection

Edit `src/Lessons/L03_ClassesObjects/Challenge.cs`. `ShoppingCart` holds a
private `List<CartItem>`. Implement `Add` (which **merges** by product name
rather than appending a second line, and rejects a quantity of zero or less),
`Remove` (`true` if there was such a line), `ItemCount` (total units, not
lines), `Total`, and `Items`.

Honest difficulty note: `Items` is the interesting one and it is a trap.
Returning the private list as an `IReadOnlyList<CartItem>` compiles and looks
right — but the caller can cast it straight back to `List<CartItem>` and mutate
your internals, and the gate checks that they cannot. `List<T>.AsReadOnly()` is
the tool. `List<T>` itself is lesson 08's subject; `Add`, `Count`, indexing and
`RemoveAt` are all you need here.

```
uv run dojo test csharp 03_classes_objects challenge
```

## Review

`review1` is `Scoreboard` — a constructor, a static creation counter, a
`private set` property and one guard clause. `dojo review` schedules it.

## The gate

This is the entire gate class, `tests/Gates/L03_ClassesObjectsTests.cs`:

```csharp
using CSharpDojo.L03_ClassesObjects;

namespace CSharpDojo.Gates;

public class L03_ClassesObjectsTests
{
    [Fact]
    public void Ex1_AccountProtectsItsOwnBalance()
    {
        Account account = new Account("Ada");

        Teach.Equal("Ada", account.Owner,
            "The constructor's job is to put the object into a usable state - Owner comes from "
                + "its parameter - reread README ex1.");
        Teach.Equal(0m, account.Balance,
            "A brand new account holds nothing. A decimal field starts at 0 on its own, but the "
                + "constructor is where you say so out loud.");

        account.Deposit(50m);
        Teach.Equal(50m, account.Balance, "Deposit adds to the balance.");

        Teach.True(account.Withdraw(20m),
            "A withdrawal the balance can cover succeeds and returns true.");
        Teach.Equal(30m, account.Balance, "50 in, 20 out, 30 left.");

        Teach.True(!account.Withdraw(1000m),
            "There is only 30 in the account, so this withdrawal must be refused - return false "
                + "rather than throwing - reread README ex1.");
        Teach.Equal(30m, account.Balance,
            "A refused withdrawal must change NOTHING. If the balance moved, you subtracted "
                + "before you checked - reread README ex1.");

        Teach.Throws<ArgumentOutOfRangeException>(() => account.Deposit(-5m),
            "A negative deposit is not an ordinary outcome, it is a caller bug: throw "
                + "ArgumentOutOfRangeException. Note the difference from the refused withdrawal, "
                + "which is an ordinary outcome - reread README ex1.");
    }

    [Fact]
    public void Ex2_LessonCardComputesFromItsInitOnlyData()
    {
        LessonCard generics = new LessonCard { Slug = "07_generics", Exercises = 4, HasChallenge = true };

        Teach.Equal(5, generics.TotalExercises,
            "Four core exercises plus one challenge is five - reread README ex2.");
        Teach.Equal("07_generics: 4 exercises + challenge", generics.Display,
            "Display reads its own properties; it stores nothing - reread README ex2.");

        LessonCard hello = new LessonCard { Slug = "00_hello_dojo", Exercises = 3 };

        Teach.Equal(3, hello.TotalExercises,
            "HasChallenge was never set in the object initialiser, so it is the default false, "
                + "and a bool default is false - not an error.");
        Teach.Equal("00_hello_dojo: 3 exercises", hello.Display,
            "With no challenge the \" + challenge\" half disappears entirely.");

        LessonCard single = new LessonCard { Slug = "23_transactions", Exercises = 1, HasChallenge = true };

        Teach.Equal("23_transactions: 1 exercise + challenge", single.Display,
            "One exercise is an \"exercise\" - the same pluralisation decision as lesson 00 ex2.");
    }

    [Fact]
    public void Ex3_SerialsComeFromSharedStaticState()
    {
        Robot.Reset();
        Teach.Equal(0, Robot.Built, "Reset puts the shared counter back to zero - reread README ex3.");

        Robot first = new Robot();
        Robot second = new Robot();
        Robot third = new Robot();

        Teach.Equal(1, first.Serial, "The first robot built gets serial 1, not 0 - increment "
            + "the counter before you read it.");
        Teach.Equal(2, second.Serial, "Serial is INSTANCE state: each robot keeps its own.");
        Teach.Equal(3, third.Serial, "Three robots, three different serials.");
        Teach.Equal(3, Robot.Built, "Built is STATIC state: one counter shared by the whole type "
            + "- reread README ex3.");

        Robot.Reset();
        Teach.Equal(0, Robot.Built, "Reset clears the counter...");
        Teach.Equal(1, first.Serial, "...but the robots already built keep the serial they were "
            + "given. Their instance state is not shared with anyone.");
    }

    [Fact]
    public void Ex4_CelsiusClampsAndFahrenheitConverts()
    {
        Thermostat thermostat = new Thermostat();

        Teach.Equal(20, thermostat.Celsius,
            "The field initialiser sets 20, and the getter hands the field back - reread README ex4.");
        Teach.Equal(68, thermostat.Fahrenheit,
            "20C is 68F: multiply by 9, divide by 5, add 32. Doing that in ints alone loses "
                + "the fraction before you round it.");

        thermostat.Celsius = 100;
        Teach.Equal(30, thermostat.Celsius,
            "100 is above Maximum, so the SETTER clamps it to 30 on the way in. The caller is "
                + "not told - reread README ex4.");

        thermostat.Celsius = -50;
        Teach.Equal(5, thermostat.Celsius, "And -50 clamps up to Minimum.");

        thermostat.Celsius = 21;
        Teach.Equal(70, thermostat.Fahrenheit,
            "21C is 69.8F, which rounds to 70. Fahrenheit is computed on demand, so it followed "
                + "the new setting without anyone updating it.");
    }

    [Fact]
    public void Challenge_CartOwnsItsItems()
    {
        ShoppingCart cart = new ShoppingCart();
        cart.Add("widget", 2.50m, 2);
        cart.Add("cable", 10m, 1);

        Teach.Equal(2, cart.Items.Count, "Two distinct products, two lines.");
        Teach.Equal(3, cart.ItemCount, "ItemCount counts units - two widgets and one cable is "
            + "three - reread README challenge.");
        Teach.Equal(15m, cart.Total, "2 x 2.50 plus 1 x 10.00 is 15.00.");

        cart.Add("widget", 2.50m, 3);
        Teach.Equal(2, cart.Items.Count, "Adding a product already in the cart must MERGE into "
            + "the existing line rather than appending a second one - reread README challenge.");
        Teach.Equal(6, cart.ItemCount, "Five widgets and one cable.");
        Teach.Equal(22.50m, cart.Total, "5 x 2.50 plus 10.00 is 22.50.");

        Teach.True(cart.Items is not List<CartItem>,
            "Items must not hand out the private List itself: a caller can cast an "
                + "IReadOnlyList<T> back to List<T> and then Add to your internals. Return a "
                + "wrapper (AsReadOnly()) instead - reread README challenge.");

        Teach.True(cart.Remove("cable"), "Removing a line that exists returns true.");
        Teach.Equal(12.50m, cart.Total, "With the cable gone, only the widgets are left.");
        Teach.True(!cart.Remove("nonesuch"), "Removing something that was never there is false, "
            + "not an exception.");

        Teach.Throws<ArgumentOutOfRangeException>(() => cart.Add("ghost", 1m, 0),
            "Adding zero units is a caller bug - guard it the way Account.Deposit does.");
    }

    [Fact]
    public void Review1_ScoreboardKeepsInstanceAndStaticStateApart()
    {
        Scoreboard.Reset();

        Scoreboard home = new Scoreboard("Home");
        Scoreboard away = new Scoreboard("Away");

        Teach.Equal("Home", home.Team, "The constructor stores the team name.");
        Teach.Equal(2, Scoreboard.Created, "Created is static: both constructions increment the "
            + "one counter.");

        home.Add(3);
        home.Add(4);

        Teach.Equal(7, home.Points, "Points accumulate on the instance you called Add on.");
        Teach.Equal(0, away.Points, "The other scoreboard has its own Points and did not move.");

        Teach.Throws<ArgumentOutOfRangeException>(() => away.Add(-1),
            "A negative award breaks the invariant this class exists to protect: throw "
                + "ArgumentOutOfRangeException.");
        Teach.Equal(0, away.Points, "And the refused award left the state alone.");
    }
}
```

In plain English: `Ex1` builds an account, deposits, withdraws successfully,
withdraws too much and checks the balance did not move, then checks the
negative deposit throws. `Ex2` builds three cards with object initialisers and
reads the computed members. `Ex3` resets the counter, builds three robots, and
checks the shared count and the per-robot serials — then resets again to prove
instance state survives. `Ex4` reads the default, then writes out-of-range
values in both directions. `Challenge` walks a small shopping session including
the merge and the read-only check, and `Review1` is the spaced-repetition
variant.

## The teaching point

Every design decision in this lesson is the same decision in a different
costume: **who is allowed to change this, and when?** The constructor is "at
birth". `init` is "while it is being built". `private set` is "only by my own
methods". A get-only computed property is "never — it is derived". Reading a
class you have never seen before, those four answers tell you most of what the
author was worried about.

The invariant idea in ex1 is what senior code review looks for. A class whose
public surface makes an illegal state unreachable — no negative balance, no
account without an owner, no cart line with zero quantity — cannot be misused
by a colleague in a hurry. A class with public fields and a comment saying
"don't set this to null" will be, by Thursday.

Next: **04_inheritance_polymorphism**, where several classes agree to answer the
same question in different ways.
