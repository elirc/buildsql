using CSharpDojo.L02_ControlFlowMethods;

namespace CSharpDojo.Gates;

public class L02_ControlFlowMethodsTests
{
    [Fact]
    public void Ex1_CountdownEndsInLiftoff()
    {
        Teach.Equal("5, 4, 3, 2, 1, liftoff", Sequences.Countdown(5),
            "Count DOWN to 1, then append \"liftoff\". Separator is a comma and a space, "
                + "with no trailing separator - reread README ex1.");

        Teach.Equal("1, liftoff", Sequences.Countdown(1),
            "Starting at 1 still counts 1 before liftoff.");

        Teach.Equal("liftoff", Sequences.Countdown(0),
            "A start below 1 means the loop body never runs, so there is nothing to separate "
                + "- and no leading comma. If you got \", liftoff\" you glued the separator on "
                + "by hand instead of letting string.Join do it - reread README ex1.");

        Teach.Equal("liftoff", Sequences.Countdown(-3),
            "A negative start is the same case: the loop condition is false immediately.");
    }

    [Fact]
    public void Ex2_TryMinMaxAndSumHandTheirResultsBack()
    {
        bool found = Stats.TryMinMax(new[] { 4, -2, 9, 9 }, out int min, out int max);

        Teach.True(found, "A non-empty array has a minimum and a maximum, so TryMinMax returns "
            + "true - reread README ex2.");
        Teach.Equal(-2, min, "The smallest of 4, -2, 9, 9 is -2. Starting your running minimum "
            + "at 0 instead of at values[0] is the classic way to miss it.");
        Teach.Equal(9, max, "The largest of 4, -2, 9, 9 is 9, and a repeat of the maximum "
            + "changes nothing.");

        bool empty = Stats.TryMinMax(Array.Empty<int>(), out int emptyMin, out int emptyMax);

        Teach.True(!empty, "An empty array has no minimum: return false rather than throwing "
            + "- that is the whole point of the Try- prefix - reread README ex2.");
        Teach.Equal(0, emptyMin, "Even on the false path, C# requires every out parameter to be "
            + "assigned before you return. Set both to 0.");
        Teach.Equal(0, emptyMax, "Same for max: assigned, even though the caller should ignore it.");

        Teach.Equal(6, Stats.Sum(1, 2, 3), "params lets the caller pass loose arguments; inside "
            + "the method they are an int[] you can loop over.");
        Teach.Equal(0, Stats.Sum(), "params also allows NO arguments, which arrives as an empty "
            + "array - not null. Summing nothing is 0.");
        Teach.Equal(10, Stats.Sum(new[] { 1, 2, 3, 4 }), "A caller may also pass a real array; "
            + "the same method handles both.");
    }

    [Fact]
    public void Ex3_ForUsesItsDefaultsUntilYouOverrideThem()
    {
        Teach.Equal("Hello, Ada.", Greeting.For("Ada"),
            "Two arguments were left out, so both defaults apply - reread README ex3.");

        Teach.Equal("Hi, Ada.", Greeting.For("Ada", "Hi"),
            "The second positional argument replaces the salutation only.");

        Teach.Equal("HELLO, ADA!", Greeting.For("Ada", shout: true),
            "A named argument skips over the one in between, so the salutation is still the "
                + "default \"Hello\" - upper-cased, and ending in \"!\" - reread README ex3.");

        Teach.Equal("HI, ADA!", Greeting.For("Ada", "Hi", true),
            "Shouting upper-cases the whole line, salutation included.");
    }

    [Fact]
    public void Ex4_LetterIsASwitchOverRanges()
    {
        Teach.Equal("A", Grades.Letter(90), "90 is the bottom of the A band - the boundary is "
            + "inclusive.");
        Teach.Equal("B", Grades.Letter(89), "89 is one below the A band. Off-by-one at the "
            + "boundary is what this pair of checks is for - reread README ex4.");
        Teach.Equal("C", Grades.Letter(70), "70 is the bottom of the C band.");
        Teach.Equal("D", Grades.Letter(60), "60 is the bottom of the D band.");
        Teach.Equal("F", Grades.Letter(0), "0 is a valid score and an F. Valid and failing are "
            + "different things.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(101),
            "101 is not a score at all, so this is an argument problem, not an F. Throw "
                + "ArgumentOutOfRangeException - reread README ex4.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Grades.Letter(-1),
            "A negative score is the other end of the same guard clause.");
    }

    [Fact]
    public void Challenge_CollatzCountsStepsAndFindsTheLongest()
    {
        Teach.Equal(0, Collatz.Steps(1), "1 is already 1, so the loop never runs - reread "
            + "README challenge.");
        Teach.Equal(8, Collatz.Steps(6), "6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 is eight "
            + "steps. Count the arrows, not the numbers.");
        Teach.Equal(111, Collatz.Steps(27), "27 is the famous one: 111 steps, and the sequence "
            + "climbs to 9232 before it comes back down. A loop with no fixed trip count is "
                + "exactly what while is for - reread README challenge.");

        int start = Collatz.LongestUnder(1000, out int steps);

        Teach.Equal(871, start, "Under 1000 the longest chain starts at 871 - reread README "
            + "challenge.");
        Teach.Equal(178, steps, "871 takes 178 steps, and that number has to come back through "
            + "the out parameter, not through the return.");
    }

    [Fact]
    public void Review1_TryLongestPicksTheFirstLongestWord()
    {
        bool found = Words.TryLongest("the quick brown fox", out string longest);

        Teach.True(found, "There are words here, so TryLongest returns true.");
        Teach.Equal("quick", longest, "\"quick\" and \"brown\" are both five letters, and the "
            + "FIRST one wins - which is what a strictly-greater-than comparison gives you, "
                + "and what >= would not.");

        Teach.True(Words.TryLongest("hi", out string only) && only == "hi",
            "One word is trivially the longest word.");

        bool empty = Words.TryLongest("   ", out string nothing);

        Teach.True(!empty, "Whitespace holds no words: return false.");
        Teach.Equal("", nothing, "The out parameter still has to be assigned - use \"\", not null.");
    }
}
