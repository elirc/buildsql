using CSharpDojo.D03_ControlFlow;

namespace CSharpDojo.Gates;

public class D03_ControlFlowTests
{
    [Fact]
    public void Ex1_LoopsWithAConditionInside()
    {
        Teach.Equal(23, Loops.SumOfMultiples(10, 3, 5),
            "3 + 5 + 6 + 9 = 23. The limit is EXCLUSIVE, so 10 itself is not counted "
                + "- reread README ex1.");
        Teach.Equal(60, Loops.SumOfMultiples(16, 3, 5),
            "3, 5, 6, 9, 10, 12, 15. 15 divides by both and is still counted ONCE - an `or` "
                + "in one condition beats two separate `if`s - reread README ex1.");
        Teach.Equal(0, Loops.SumOfMultiples(1, 3, 5), "A range with nothing in it sums to 0.");

        Teach.Equal(1, Loops.CountDigits(0),
            "Zero has one digit. A `while (n > 0)` loop that starts the count at 0 answers 0 "
                + "here - reread README ex1.");
        Teach.Equal(1, Loops.CountDigits(9), "So does 9.");
        Teach.Equal(2, Loops.CountDigits(10), "Ten is where the second digit starts.");
        Teach.Equal(5, Loops.CountDigits(-12345), "The sign is not a digit.");
        Teach.Equal(10, Loops.CountDigits(int.MinValue),
            "int.MinValue is -2147483648, which has ten digits - and Math.Abs(int.MinValue) "
                + "OVERFLOWS, because there is no positive int that big. Widen to long first "
                + "- reread README ex1.");
    }

    [Fact]
    public void Ex2_SwitchExpressionsWithPatterns()
    {
        Teach.Equal("winter", Switches.SeasonOf(12),
            "December, January and February are one arm - `12 or 1 or 2` says that in one line "
                + "- reread README ex2.");
        Teach.Equal("winter", Switches.SeasonOf(1), "January.");
        Teach.Equal("winter", Switches.SeasonOf(2), "February.");
        Teach.Equal("spring", Switches.SeasonOf(3), "The bottom of the spring range.");
        Teach.Equal("spring", Switches.SeasonOf(5), "The top of it.");
        Teach.Equal("summer", Switches.SeasonOf(6), "Summer starts at 6.");
        Teach.Equal("summer", Switches.SeasonOf(8), "...and ends at 8.");
        Teach.Equal("autumn", Switches.SeasonOf(9), "Autumn starts at 9.");
        Teach.Equal("autumn", Switches.SeasonOf(11), "...and ends at 11, because 12 is winter.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Switches.SeasonOf(0),
            "A switch expression with no matching arm throws SwitchExpressionException, which "
                + "tells the caller nothing. The discard arm is where you say what is really "
                + "wrong - reread README ex2.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Switches.SeasonOf(13), "And above the range.");

        Teach.Equal("free", Switches.Ticket(0), "A newborn travels free.");
        Teach.Equal("free", Switches.Ticket(4), "Free up to and including 4.");
        Teach.Equal("child", Switches.Ticket(5),
            "5 is the first child fare. Ordered relational arms make each boundary appear "
                + "exactly once - reread README ex2.");
        Teach.Equal("child", Switches.Ticket(17), "...through 17.");
        Teach.Equal("adult", Switches.Ticket(18), "18 is an adult.");
        Teach.Equal("adult", Switches.Ticket(64), "...through 64.");
        Teach.Equal("senior", Switches.Ticket(65), "65 and over is senior.");
        Teach.Equal("senior", Switches.Ticket(120), "No upper bound.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Switches.Ticket(-1),
            "A negative age is not a band, it is a bug - and the guard has to come FIRST, "
                + "before `< 5` swallows it - reread README ex2.");
    }

    [Fact]
    public void Ex3_LoopsThatStopEarly()
    {
        int[] values = { 4, 7, 4, 9 };

        Teach.Equal(0, Search.FirstIndexOf(values, 4),
            "The FIRST 4 is at index 0 - reread README ex3.");
        Teach.Equal(2, Search.LastIndexOf(values, 4),
            "The LAST 4 is at index 2. Walking backwards and returning on the first hit is "
                + "the shortest way to say that - reread README ex3.");
        Teach.Equal(3, Search.FirstIndexOf(values, 9), "The only 9.");
        Teach.Equal(3, Search.LastIndexOf(values, 9), "...which is also the last 9.");
        Teach.Equal(-1, Search.FirstIndexOf(values, 5),
            "Not found is -1, not an exception and not 0 - reread README ex3.");
        Teach.Equal(-1, Search.LastIndexOf(values, 5), "...both ways round.");
        Teach.Equal(-1, Search.FirstIndexOf(Array.Empty<int>(), 1),
            "An empty array finds nothing without ever entering the loop.");
        Teach.Equal(-1, Search.LastIndexOf(Array.Empty<int>(), 1),
            "And the backwards loop must not start at an index that does not exist.");
    }

    [Fact]
    public void Ex4_RunLengthEncoding()
    {
        Teach.Equal("a3b2c1", Runs.Encode("aaabbc"),
            "Every run gets its length, INCLUDING the runs of one - reread README ex4.");
        Teach.Equal("a1b1c1", Runs.Encode("abc"),
            "No repeats at all still produces a count per character.");
        Teach.Equal("a2b1a2", Runs.Encode("aabaa"),
            "Runs are consecutive: the two groups of 'a' are two runs, not one count of four "
                + "- reread README ex4.");
        Teach.Equal("a2", Runs.Encode("aa"), "One run of two.");
        Teach.Equal("", Runs.Encode(""), "Nothing encodes to nothing - and does not crash.");

        Teach.Equal(3, Runs.LongestRunLength("aaabbc"), "The three a's.");
        Teach.Equal(4, Runs.LongestRunLength("aabbbbc"), "The four b's.");
        Teach.Equal(1, Runs.LongestRunLength("abc"),
            "With no repeats the longest run is still 1, because a single character is a run "
                + "- reread README ex4.");
        Teach.Equal(0, Runs.LongestRunLength(""), "...but empty text has no runs at all.");
    }

    [Fact]
    public void Ex5_OneSwitchExpressionOverPatterns()
    {
        Teach.Equal("nothing", Inspect.Describe(null),
            "The null arm has to come first: a type pattern never matches null, so without it "
                + "you fall through to the discard - reread README ex5.");
        Teach.Equal("zero", Inspect.Describe(0),
            "A constant pattern is more specific than a type pattern, so it is listed before "
                + "the int arms - reread README ex5.");
        Teach.Equal("negative int", Inspect.Describe(-7),
            "A relational pattern combined with the type: `int and < 0`.");
        Teach.Equal("int 42", Inspect.Describe(42),
            "The general int arm captures the value so it can be interpolated.");
        Teach.Equal("empty string", Inspect.Describe(""),
            "A property pattern - `string { Length: 0 }` - tests the type and the property in "
                + "one step - reread README ex5.");
        Teach.Equal("string of 3", Inspect.Describe("hey"), "Any other string reports its length.");
        Teach.Equal("array of 2", Inspect.Describe(new[] { 1, 2 }), "An int[] reports its length.");
        Teach.Equal("something else", Inspect.Describe(3.5),
            "A double is not an int - patterns do NOT apply numeric conversions - reread "
                + "README ex5.");
        Teach.Equal("something else", Inspect.Describe(true), "And a bool falls through too.");
    }

    [Fact]
    public void Ex6_NestedLoops()
    {
        Teach.Equal("#\n##\n###", Grid.Triangle(3),
            "Three rows, an inner loop per row, and the newline BETWEEN rows rather than after "
                + "each one - reread README ex6.");
        Teach.Equal("#", Grid.Triangle(1), "One row has no separator at all.");
        Teach.Equal("", Grid.Triangle(0), "No rows is the empty string.");
        Teach.Equal("", Grid.Triangle(-2), "And a negative height is not an exception here.");

        Teach.Equal(2, Grid.CountPairs(new[] { 1, 2, 3, 4 }, 5),
            "(1,4) and (2,3). Starting the inner loop at i + 1 is what stops (4,1) being "
                + "counted as a second pair - reread README ex6.");
        Teach.Equal(3, Grid.CountPairs(new[] { 2, 2, 2 }, 4),
            "Three POSITIONS pair up three ways, even though the values are identical: the "
                + "pairs are positions, not values - reread README ex6.");
        Teach.Equal(1, Grid.CountPairs(new[] { 0, 0 }, 0), "Zeroes pair like anything else.");
        Teach.Equal(0, Grid.CountPairs(new[] { 5 }, 5),
            "One element cannot pair with itself - reread README ex6.");
        Teach.Equal(0, Grid.CountPairs(Array.Empty<int>(), 0), "And nothing pairs with nothing.");
    }

    [Fact]
    public void Ex7_TheLuhnCheck()
    {
        Teach.True(Checksum.IsValidLuhn("79927398713"),
            "The textbook valid number. If this fails, check which digits you are doubling: "
                + "counting starts at the RIGHTMOST digit and that one is not doubled "
                + "- reread README ex7.");
        Teach.True(!Checksum.IsValidLuhn("79927398710"),
            "Same number, wrong check digit - only one of the ten possible last digits passes.");
        Teach.True(!Checksum.IsValidLuhn("79927398711"), "...and it is not this one either.");
        Teach.True(Checksum.IsValidLuhn("7992 7398-713"),
            "Spaces and hyphens are how people type card numbers; ignore them rather than "
                + "rejecting them - reread README ex7.");
        Teach.True(Checksum.IsValidLuhn("18"),
            "The smallest valid example: 8, then 1 doubled to 2, totalling 10.");
        Teach.True(!Checksum.IsValidLuhn("79927398713x"),
            "A letter is not a separator - anything that is not a digit, space or hyphen makes "
                + "the whole input invalid - reread README ex7.");
        Teach.True(!Checksum.IsValidLuhn("0"),
            "A single digit passes the arithmetic (0 divides by 10) and is still not a valid "
                + "number - the length rule is a separate check - reread README ex7.");
        Teach.True(!Checksum.IsValidLuhn(""), "And empty input is invalid.");
        Teach.True(!Checksum.IsValidLuhn("   "), "So is input with no digits in it at all.");
    }

    [Fact]
    public void Ex8_AHandRolledNumberScanner()
    {
        Teach.True(Numeric.IsNumber("12"), "Digits alone - reread README ex8.");
        Teach.True(Numeric.IsNumber("-12.5"), "A sign, digits, a point, more digits.");
        Teach.True(Numeric.IsNumber("+0.5"), "A leading plus is allowed.");
        Teach.True(Numeric.IsNumber(".5"),
            "No whole part is fine as long as there is a digit after the point - reread "
                + "README ex8.");
        Teach.True(Numeric.IsNumber("007"), "Leading zeroes are digits like any other.");

        Teach.True(!Numeric.IsNumber("5."),
            "A trailing point with nothing after it is NOT a number here - the grammar says "
                + "the point must be followed by at least one digit - reread README ex8.");
        Teach.True(!Numeric.IsNumber("."), "A lone point has no digits at all.");
        Teach.True(!Numeric.IsNumber("-"), "Nor does a lone sign.");
        Teach.True(!Numeric.IsNumber(""), "Nor does empty text.");
        Teach.True(!Numeric.IsNumber("1.2.3"),
            "One point only. If this passed, your scanner stopped early instead of insisting "
                + "the WHOLE text be consumed - reread README ex8.");
        Teach.True(!Numeric.IsNumber("1a"),
            "A leftover character at the end fails, for the same reason.");
        Teach.True(!Numeric.IsNumber(" 1"),
            "Whitespace is not part of the grammar, so it is a leftover character too.");
        Teach.True(!Numeric.IsNumber("1-2"), "A sign is only allowed at the very front.");
    }
}
