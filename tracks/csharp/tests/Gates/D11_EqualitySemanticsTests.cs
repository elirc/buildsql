using CSharpDojo.D11_EqualitySemantics;

namespace CSharpDojo.Gates;

public class D11_EqualitySemanticsTests
{
    [Fact]
    public void Ex1_ThreeDifferentQuestions()
    {
        Box one = new Box(1);
        Box anotherOne = new Box(1);

        Teach.True(Basics.SameObject(one, one), "An object is itself.");
        Teach.True(!Basics.SameObject(one, anotherOne),
            "Two separate objects are never the same object, whatever they contain "
                + "- reread README ex1.");
        Teach.True(Basics.SameObject(null, null), "Two absences are the same absence.");
        Teach.True(!Basics.SameObject(one, null), "An object is not nothing.");

        Teach.True(!Basics.BoxesEqual(one, anotherOne),
            "Box overrides nothing, so it inherits object.Equals - which is identity. That is "
                + "the CORRECT default for a type that has not said what equality means "
                + "- reread README ex1.");
        Teach.True(Basics.BoxesEqual(one, one), "...and an object still equals itself.");

        string literal = "ab";
        string built = new string(new[] { 'a', 'b' });

        Teach.True(Basics.StringsEqual(literal, built),
            "string overloads == to compare the characters, which is why strings feel like "
                + "values - reread README ex1.");
        Teach.True(!Basics.StringsSameObject(literal, built),
            "...but they are two different objects on the heap. A string built at run time is "
                + "not interned, so identity and equality genuinely disagree here "
                + "- reread README ex1.");
        Teach.True(Basics.StringsSameObject(literal, "ab"),
            "Two identical LITERALS are the same object, because the compiler interns them.");
    }

    [Fact]
    public void Ex2_EqualsAndGetHashCodeTogether()
    {
        Isbn code = new Isbn(" 978-1 ");
        Teach.Equal("978-1", code.Code, "The code is trimmed on the way in.");

        Isbn lower = new Isbn("abc-1");
        Isbn upper = new Isbn("ABC-1");

        Teach.True(lower.Equals(upper), "Same code ignoring case - reread README ex2.");
        Teach.Equal(lower.GetHashCode(), upper.GetHashCode(),
            "...and they MUST hash the same. Compare case-insensitively while hashing "
                + "case-sensitively and a HashSet will hold two 'equal' items, because Equals "
                + "is never even called - reread README ex2.");

        HashSet<Isbn> set = new HashSet<Isbn> { lower, upper };
        Teach.Equal(1, set.Count, "...which is exactly what this checks.");

        Teach.True(lower.Equals(lower), "Equality is reflexive.");
        Teach.True(!lower.Equals(new Isbn("zzz")), "Different codes are different.");
        Teach.True(!lower.Equals(null),
            "Nothing is equal to null - and `obj is Isbn` handles that without a separate "
                + "check - reread README ex2.");
        Teach.True(!lower.Equals("abc-1"),
            "...and a string that happens to look like the code is not an Isbn.");

        Teach.Throws<ArgumentException>(() => new Isbn("   "), "A blank code is no code.");
        Teach.Throws<ArgumentException>(() => new Isbn(null!), "Nor is null.");
    }

    [Fact]
    public void Ex3_IEquatableOnAStruct()
    {
        Gram five = new Gram(5);
        Gram alsoFive = new Gram(5);
        Gram seven = new Gram(7);

        Teach.True(five.Equals(alsoFive), "The typed Equals compares the values.");
        Teach.True(!five.Equals(seven), "Different values are not equal.");
        Teach.Equal(five.GetHashCode(), alsoFive.GetHashCode(), "Equal grams hash the same.");

        Teach.True(five.Equals((object)alsoFive),
            "The untyped override must AGREE with the typed one, or the answer depends on how "
                + "the question was asked - reread README ex3.");
        Teach.True(!five.Equals((object)"5"),
            "...and a string is not a Gram, however it prints.");
        Teach.True(!five.Equals((object?)null), "Nor is null.");

        IEquatable<Gram> asInterface = five;
        Teach.True(asInterface.Equals(alsoFive),
            "The interface is what EqualityComparer<Gram>.Default looks for, and finding it is "
                + "what stops every comparison boxing the struct - reread README ex3.");

        HashSet<Gram> set = new HashSet<Gram> { five, alsoFive, seven };
        Teach.Equal(2, set.Count, "Two distinct weights out of three grams.");
    }

    [Fact]
    public void Ex4_WhenOperatorDisagreesWithEquals()
    {
        Tag blue = new Tag("blue");
        Tag alsoBlue = new Tag("blue");

        Teach.True(Tags.EqualsSays(blue, alsoBlue),
            "Equals was overridden, so it compares names - reread README ex4.");
        Teach.Equal(blue.GetHashCode(), alsoBlue.GetHashCode(), "...and the hashes agree.");

        Teach.True(!Tags.OperatorSays(blue, alsoBlue),
            "But == was NOT overloaded, so it is still reference comparison - and it says the "
                + "opposite. One type, two notions of equality - reread README ex4.");
        Teach.True(Tags.OperatorSays(blue, blue), "...and == still says an object is itself.");

        Teach.True(Tags.ListContains(new List<Tag> { blue }, alsoBlue),
            "List<T>.Contains goes through EqualityComparer<T>.Default, which uses EQUALS - "
                + "so the collection agrees with Equals and disagrees with ==. That is the "
                + "trap: which answer you get depends on which syntax the caller reached for "
                + "- reread README ex4.");
        Teach.True(!Tags.ListContains(new List<Tag> { blue }, new Tag("red")),
            "A different name really is absent.");
    }

    [Fact]
    public void Ex5_TheKeyThatMoved()
    {
        Teach.True(Hashing.FoundBeforeMutation(),
            "Nothing has changed, so the set finds its own item - reread README ex5.");

        Teach.True(!Hashing.FoundAfterMutation(),
            "Renaming the key changed its hash, so Contains looks in a different bucket and "
                + "finds nothing - while the object is still sitting in the set "
                + "- reread README ex5.");

        Teach.True(!Hashing.FoundByFreshOldNameKey(),
            "Asking with the ORIGINAL name reaches the right bucket, but the object living "
                + "there has since been renamed, so Equals says no. The entry is now "
                + "unreachable by any key at all - reread README ex5.");

        Teach.Equal(1, Hashing.CountAfterMutation(),
            "...and yet Count still says 1, and enumerating the set would still yield it. That "
                + "is why a key must be immutable in whatever decides its hash "
                + "- reread README ex5.");
    }

    [Fact]
    public void Ex6_AComparerForSomeoneElsesType()
    {
        GridCellComparer comparer = new GridCellComparer();

        Reading a = new Reading(1.2, 3.9);
        Reading b = new Reading(1.8, 3.1);

        Teach.True(comparer.Equals(a, b),
            "Both floor to the cell (1, 3), so the comparer calls them the same "
                + "- reread README ex6.");
        Teach.Equal(comparer.GetHashCode(a), comparer.GetHashCode(b),
            "...and equal items MUST hash the same, or Distinct never calls Equals "
                + "- reread README ex6.");

        Teach.True(!comparer.Equals(new Reading(-0.5, 0.0), new Reading(0.5, 0.0)),
            "-0.5 FLOORS to -1 and 0.5 floors to 0, so these are different cells. A cast would "
                + "have truncated both to 0 and merged them - reread README ex6.");

        Teach.True(comparer.Equals(null, null), "Two nulls are equal...");
        Teach.True(!comparer.Equals(a, null), "...and one null is not - the framework really "
            + "does pass nulls while probing - reread README ex6.");

        Reading[] readings =
        {
            new Reading(1.2, 3.9),
            new Reading(1.8, 3.1),
            new Reading(-0.5, 0.0),
            new Reading(0.5, 0.0),
        };
        Teach.Equal(3, Readings.DistinctCells(readings),
            "Cells (1,3), (-1,0) and (0,0) - three of them - reread README ex6.");
        Teach.Equal(0, Readings.DistinctCells(Array.Empty<Reading>()), "Nothing has no cells.");
    }

    [Fact]
    public void Ex7_TheWholeContractByHand()
    {
        Money ten = new Money(10m, "usd");
        Money alsoTen = new Money(10m, "USD");
        Money euros = new Money(10m, "eur");

        Teach.True(ten.Equals(alsoTen), "Same amount, same currency ignoring case.");
        Teach.True(ten == alsoTen, "...and the operator agrees, because you overloaded it.");
        Teach.True(!(ten != alsoTen), "...and != is its exact opposite.");
        Teach.Equal(ten.GetHashCode(), alsoTen.GetHashCode(),
            "Equal money hashes the same, with the same case rule - reread README ex7.");

        Teach.True(ten.Equals(ten), "Reflexive.");
        Teach.True(!ten.Equals(euros), "A different currency is different money.");
        Teach.True(ten != euros, "...both ways of asking.");
        Teach.True(!ten.Equals("10 usd"), "A string is not Money.");

        Money? missing = null;
        Teach.True(!ten.Equals(missing), "Nothing equals null...");
        Teach.True(!(ten == missing), "...through the operator either...");
        Teach.True(!(missing == ten),
            "...including with the null on the LEFT, which is the case that stack-overflows if "
                + "you wrote `left == null` inside the operator - reread README ex7.");
        Teach.True(missing == null,
            "...and two nulls compare equal, which the operator has to say for itself.");

        HashSet<Money> wallet = new HashSet<Money> { ten, alsoTen, euros };
        Teach.Equal(2, wallet.Count, "Two distinct amounts of money out of three objects.");
    }

    [Fact]
    public void Ex8_EqualityAndInheritance()
    {
        Point2 plain = new Point2(1, 2);
        Point2 alsoPlain = new Point2(1, 2);
        ColouredPoint red = new ColouredPoint(1, 2, "red");
        ColouredPoint alsoRed = new ColouredPoint(1, 2, "red");
        ColouredPoint blue = new ColouredPoint(1, 2, "blue");

        Teach.True(plain.Equals(alsoPlain), "Two plain points with the same coordinates.");
        Teach.Equal(plain.GetHashCode(), alsoPlain.GetHashCode(), "...hashing the same.");

        Teach.True(!plain.Equals(red),
            "A Point2 is not equal to a ColouredPoint, even at the same coordinates "
                + "- reread README ex8.");
        Teach.True(!red.Equals(plain),
            "...and the reverse must give the SAME answer. With `obj is Point2` the first "
                + "check would be true and this one false, breaking symmetry - which is why "
                + "the type test is GetType() - reread README ex8.");

        Teach.True(red.Equals(alsoRed), "Same coordinates and same colour.");
        Teach.Equal(red.GetHashCode(), alsoRed.GetHashCode(), "...so the same hash.");
        Teach.True(!red.Equals(blue), "A different colour is a different point.");

        HashSet<Point2> set = new HashSet<Point2> { plain, alsoPlain, red, alsoRed, blue };
        Teach.Equal(3, set.Count,
            "One plain point, one red, one blue - reread README ex8.");

        Teach.True(!red.Equals(null), "Nothing is equal to null.");
        Teach.True(!plain.Equals("1,2"), "...or to an unrelated type.");
    }
}
