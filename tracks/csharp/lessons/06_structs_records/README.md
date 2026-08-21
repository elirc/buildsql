# 06 — Structs and records

Lesson 01 told you that `struct` copies and `class` points. This lesson is
about what you do with that: which of your own types should behave like values,
and what "equal" means for each kind. It is also where C# has changed most in
the last five years — `record`, `init`, `with`, `record struct` and positional
patterns all arrived since 2020, and together they make writing immutable
data types about as short as writing a JSON object.

The question underneath is one interviewers ask constantly and most candidates
answer vaguely: **when two objects hold the same data, are they the same
thing?** For a coordinate, a money amount, a date — obviously yes; nobody cares
*which* `(3, 7)` they have. For a customer, an order, a database connection —
obviously no; two customers with the same name are two people. C# gives you
types that default to each answer, and the skill is picking the right one.

## Concept — three kinds of type, two kinds of equality

**A `struct` is a value type.** It copies on assignment, lives inline where it
is declared, and gets **memberwise equality** for free — two structs are equal
when every field is. Make it `readonly` and the compiler enforces that nothing
can mutate it after construction:

```csharp
public readonly struct Money
{
    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }
    public decimal Amount { get; }
    public string Currency { get; }
}
```

Guidance from Microsoft, worth memorising: make a struct when the thing is
logically a single value, is under about 16 bytes, is immutable, and will not
be boxed often. Otherwise write a class. A *mutable* struct is a well-known
footgun — because every copy is independent, changes you make often land on a
copy you did not know you had.

**A `record` is a class with value semantics bolted on.** One line gets you
properties, a constructor, value equality, `GetHashCode`, a readable
`ToString`, a `Deconstruct`, and `with`:

```csharp
public record Reading(string Sensor, int Degrees);

var a = new Reading("kiln", 20);
var b = new Reading("kiln", 20);
a == b            // true - compared by value
a.ToString()      // "Reading { Sensor = kiln, Degrees = 20 }"
```

It is still a reference type: assigning copies the arrow, and `record struct`
is the value-type version.

**`with` copies and changes in one expression:**

```csharp
var shipped = order with { Status = "shipped" };   // order itself is untouched
```

The copy is **shallow**. If a member is a `List<T>`, the copy points at the
same list — which is also why record equality on such a member is reference
equality, and both facts bite in the same exercise below.

**A plain `class` compares by reference.** Two `ReadingClass` objects holding
identical data are not equal, because `object.Equals` asks "are you the same
object?". To change that you override `Equals` **and** `GetHashCode`, and they
must agree: equal objects must produce equal hash codes, or hashed collections
break in ways that look like the dictionary is lying to you.

```csharp
public override bool Equals(object? obj) => obj is CacheKey k && k.Id == Id;
public override int GetHashCode() => HashCode.Combine(Id);
```

**Deconstruction and positional patterns.** Records (and any type with a
`Deconstruct` method) can be taken apart:

```csharp
var (x, y) = point;
string where = point switch { (0, 0) => "origin", (_, 0) => "on the x axis", _ => "somewhere" };
```

## Exercise 1 — a value type of your own

Edit `src/Lessons/L06_StructsRecords/Ex1.cs`. `Money` is a `readonly struct`.
Implement `Add(Money other)`, which returns a **new** `Money` holding the sum
and throws `InvalidOperationException` when the currencies differ, and
`ToString()`, which returns `"GBP 5.00"` — currency, space, two decimal places,
formatted with `CultureInfo.InvariantCulture`.

You cannot assign to `Amount` inside `Add`; the struct is `readonly`. That is
the shape immutable value types take: every operation is a function returning a
new value, exactly like `DateTime.AddDays` or `string.Replace`.

```
uv run dojo test csharp 06_structs_records ex1
```

## Exercise 2 — the same data, three answers

Edit `src/Lessons/L06_StructsRecords/Ex2.cs`. `Reading` is a record;
`ReadingClass` holds the same two values as a plain class. Implement four tiny
methods: `SameReading` (ask the records), `SameLegacyData` (compare the class's
two properties by hand), `ClassEqualsSays` (ask the class's own `Equals` and
report what it says — do not fix it), and `Describe` (the record's own
`ToString`).

Predict all four results before running the gate. The one that surprises people
is `ClassEqualsSays`, and it is the reason ex4 exists.

```
uv run dojo test csharp 06_structs_records ex2
```

## Exercise 3 — copy-and-change

Edit `src/Lessons/L06_StructsRecords/Ex3.cs`. Implement `Reprice` (a copy at a
new unit price), `AddOneUnit` (a copy with one more unit **and** the status set
to `"amended"`), and `DiffersOnlyInStatus`, which is true when two orders match
on everything except status.

That last one has a one-line answer that uses `with` and `==` together and does
not name a single property except `Status`. Finding it is the exercise.

```
uv run dojo test csharp 06_structs_records ex3
```

## Exercise 4 — earning value equality by hand

Edit `src/Lessons/L06_StructsRecords/Ex4.cs`. `CacheKey` is meant to be a
dictionary key: two keys with the same region and id are the same key. Override
`Equals(object?)` and `GetHashCode()` so that a `Dictionary<CacheKey, string>`
can find an entry using a *different but equal* key object.

`Equals` will be handed nulls and objects of other types — deal with both. And
the two methods must agree: the gate builds a dictionary with one key and looks
it up with the twin, which only works if the hash codes match.

```
uv run dojo test csharp 06_structs_records ex4
```

## Challenge — patterns over a record struct

Edit `src/Lessons/L06_StructsRecords/Challenge.cs`. `Point` is a
`readonly record struct`. Implement `Classify(Point)` returning `"origin"`,
`"on the x axis"`, `"on the y axis"`, or `"quadrant 1"` through
`"quadrant 4"` (anticlockwise from the top right); and `Mirror(Point)`, which
swaps the coordinates.

Honest difficulty note: the switch itself is easy and the **order of the arms**
is the whole problem — three of your patterns match `(0, 0)`, and only the
first one written wins. Use positional patterns (`(0, 0)`, `(_, 0)`,
`( > 0, > 0)`), which work because a record struct generates `Deconstruct`.

```
uv run dojo test csharp 06_structs_records challenge
```

## Review

`review1` asks how deep record equality goes when a member is a `List<string>`,
and what `with` does about it. Both answers are "not as deep as you assumed".
`dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L06_StructsRecordsTests.cs`:

```csharp
using CSharpDojo.L06_StructsRecords;

namespace CSharpDojo.Gates;

public class L06_StructsRecordsTests
{
    [Fact]
    public void Ex1_MoneyIsAValueThatCanBeAddedButNotMixed()
    {
        Money five = new Money(5m, "GBP");
        Money three = new Money(3m, "GBP");

        Teach.Equal(new Money(8m, "GBP"), five.Add(three),
            "Add returns a NEW Money. A readonly struct cannot mutate itself, which is exactly "
                + "the property that makes it safe to pass around - reread README ex1.");

        Teach.Equal(5m, five.Amount,
            "The original is untouched: Add produced a new value rather than changing this one.");

        Teach.Equal("GBP 5.00", five.ToString(),
            "The currency, a space, and two decimal places. Format with \"0.00\" and "
                + "CultureInfo.InvariantCulture so the output does not change with the "
                + "machine's locale - reread README ex1.");

        Teach.Throws<InvalidOperationException>(() => five.Add(new Money(3m, "EUR")),
            "Pounds plus euros is not a number - throw InvalidOperationException rather than "
                + "silently producing nonsense - reread README ex1.");

        Teach.True(new Money(5m, "GBP").Equals(new Money(5m, "GBP")),
            "Structs get memberwise equality for free: two Moneys with the same amount and "
                + "currency are equal without you writing a line.");
    }

    [Fact]
    public void Ex2_RecordsBringEqualityAndToStringWithThem()
    {
        Reading a = new Reading("kiln", 20);
        Reading b = new Reading("kiln", 20);

        Teach.True(!ReferenceEquals(a, b), "These really are two separate objects.");

        Teach.True(Equality.SameReading(a, b),
            "A record compares by VALUE, so two separate records holding the same data are "
                + "equal - reread README ex2.");

        Teach.True(!Equality.SameReading(a, new Reading("kiln", 21)),
            "Different data, not equal. Value equality means every member has to match.");

        ReadingClass c = new ReadingClass("kiln", 20);
        ReadingClass d = new ReadingClass("kiln", 20);

        Teach.True(Equality.SameLegacyData(c, d),
            "Compared property by property, these two obviously hold the same data.");

        Teach.True(!Equality.ClassEqualsSays(c, d),
            "...but the CLASS says they are not equal, because a plain class inherits "
                + "reference equality from object: same data, different objects - reread "
                + "README ex2. Return what Equals says; do not fix it up.");

        Teach.Equal("Reading { Sensor = kiln, Degrees = 20 }", Equality.Describe(a),
            "A record's generated ToString prints the type name and every property. Hand back "
                + "reading.ToString() rather than building the string yourself.");
    }

    [Fact]
    public void Ex3_WithCopiesAndChangesInOneStep()
    {
        Order original = new Order("SKU-1", 2, 10m);

        Order repriced = Orders.Reprice(original, 12m);
        Teach.Equal(new Order("SKU-1", 2, 12m), repriced,
            "Reprice changes the price and copies everything else, Status included - reread "
                + "README ex3.");
        Teach.Equal(10m, original.UnitPrice,
            "`with` never modifies the record you started from. If the original moved, you "
                + "mutated instead of copying - reread README ex3.");

        Order amended = Orders.AddOneUnit(original);
        Teach.Equal(new Order("SKU-1", 3, 10m, "amended"), amended,
            "One `with` expression can set several properties at once - a comma-separated "
                + "list inside the braces.");

        Teach.True(Orders.DiffersOnlyInStatus(
                new Order("SKU-1", 2, 10m, "new"),
                new Order("SKU-1", 2, 10m, "shipped")),
            "Copy one order with the other's status and compare: if they are equal now, the "
                + "status was the only difference - reread README ex3.");

        Teach.True(!Orders.DiffersOnlyInStatus(
                new Order("SKU-1", 2, 10m, "new"),
                new Order("SKU-1", 9, 10m, "new")),
            "Different quantities differ in more than the status.");
    }

    [Fact]
    public void Ex4_EqualKeysMustHashTheSame()
    {
        CacheKey key = new CacheKey("eu", 7);
        CacheKey twin = new CacheKey("eu", 7);
        CacheKey other = new CacheKey("us", 7);

        Teach.True(key.Equals(twin),
            "Same region, same id: the same key - reread README ex4.");
        Teach.True(!key.Equals(other),
            "A different region is a different key.");
        Teach.True(!key.Equals("eu"),
            "Equals takes an object, so it can be handed anything at all. Something that is "
                + "not a CacheKey is never equal to one - a type test is the first thing "
                + "Equals does.");
        Teach.True(!key.Equals(null),
            "And null is never equal to a real object. `obj is CacheKey other` handles that "
                + "case for free, which is why it is the idiomatic opening line.");

        Teach.Equal(key.GetHashCode(), twin.GetHashCode(),
            "Two objects that are Equal MUST return the same hash code. Break that and hashed "
                + "collections stop working - reread README ex4.");

        Dictionary<CacheKey, string> cache = new Dictionary<CacheKey, string>
        {
            [key] = "cached value",
        };

        Teach.True(cache.ContainsKey(twin),
            "This is the payoff: a Dictionary finds an entry using a DIFFERENT but equal key "
                + "object, because it hashes to the same bucket and then compares equal. "
                + "Without GetHashCode this lookup fails even though Equals is correct.");

        HashSet<CacheKey> seen = new HashSet<CacheKey> { key, twin, other };
        Teach.Equal(2, seen.Count,
            "A HashSet keeps one of each: key and twin are the same key, so only two remain.");
    }

    [Fact]
    public void Challenge_PositionalPatternsReadThePointApart()
    {
        Teach.Equal("origin", Geometry.Classify(new Point(0, 0)),
            "(0, 0) is the origin - and it must be tested before the axis cases, which would "
                + "both match it - reread README challenge.");
        Teach.Equal("on the x axis", Geometry.Classify(new Point(3, 0)),
            "Y is 0, so the point sits on the x axis.");
        Teach.Equal("on the y axis", Geometry.Classify(new Point(0, -2)),
            "X is 0, so it sits on the y axis - including below the origin.");
        Teach.Equal("quadrant 1", Geometry.Classify(new Point(2, 5)), "Right and up.");
        Teach.Equal("quadrant 2", Geometry.Classify(new Point(-2, 5)), "Left and up.");
        Teach.Equal("quadrant 3", Geometry.Classify(new Point(-2, -5)), "Left and down.");
        Teach.Equal("quadrant 4", Geometry.Classify(new Point(2, -5)), "Right and down.");

        Teach.Equal(new Point(7, 3), Geometry.Mirror(new Point(3, 7)),
            "Mirror swaps the parts. A record struct generates Deconstruct, so "
                + "`var (x, y) = point;` takes it apart in one line - reread README challenge.");

        Teach.True(new Point(1, 2) == new Point(1, 2),
            "A record struct has == generated for it, which a plain struct does not.");
    }

    [Fact]
    public void Review1_RecordEqualityStopsAtTheReference()
    {
        List<string> firstList = new List<string> { "milk", "bread" };
        List<string> secondList = new List<string> { "milk", "bread" };

        Basket a = new Basket("ada", firstList);
        Basket b = new Basket("ada", secondList);

        Teach.True(!Baskets.RecordSays(a, b),
            "The two lists hold the same strings but ARE different objects, and List<T> uses "
                + "reference equality. A record compares its members with THEIR equality, so "
                + "these baskets are not equal - reread README review.");

        Teach.True(Baskets.RecordSays(a, new Basket("ada", firstList)),
            "Point both records at the SAME list and they are equal again.");

        Teach.True(Baskets.SameContents(a, b),
            "The question a human meant needs a real comparison of the contents.");
        Teach.True(!Baskets.SameContents(a, new Basket("bo", firstList)),
            "A different owner is a different basket, however the items line up.");

        Basket original = new Basket("ada", new List<string> { "milk" });
        Basket renamed = Baskets.Rename(original, "bo");

        Teach.Equal("bo", renamed.Owner, "Rename is a with-expression on the owner.");

        renamed.Items.Add("bread");
        Teach.Equal(2, original.Items.Count,
            "`with` makes a SHALLOW copy: the new record points at the very same list, so "
                + "adding through one is visible through the other. Copying a record does not "
                + "copy what its members point at - reread README review.");
    }
}
```

In plain English: `Ex1` adds money, checks the original did not move, formats
it, and mixes currencies to see the exception. `Ex2` builds two records and two
class instances with identical data and asks all four questions. `Ex3` checks
each `with` result against a freshly constructed expected record — which works
only because records compare by value. `Ex4` tests `Equals` against a twin, a
different key, a string, and null, then checks the hash codes match and puts
the keys in a `Dictionary` and a `HashSet`. `Challenge` walks all seven
classifications, and `Review1` is the spaced-repetition variant.

## The teaching point

The everyday version of this lesson is: **use records for data, classes for
behaviour, structs for small values.** A DTO coming off an HTTP request, an
event in a queue, a query result, a configuration snapshot — all records; they
are data, they should be immutable, and comparing them by value is what you
meant. A service, a repository, a controller — classes; they have identity and
dependencies and no sensible notion of equality.

The `Equals`/`GetHashCode` contract in ex4 is not academic. Break it and you get
one of the nastiest bug classes in .NET: a `Dictionary` that "loses" an entry
you know you added, or a `HashSet` with two items you can see are identical.
The reason is exactly what the gate demonstrates — the lookup hashes to a
bucket first and only compares within it — and the reason `record` exists is
that nobody should have to write those two methods by hand for the hundredth
time.

Next: **07_generics**, where the types themselves get parameters.
