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
