# d04 - Methods and parameters drills

Eight problems on the signature rather than the body: optional and named
arguments, `params`, `out`, `ref`, overload resolution, recursion, and two
larger methods that use most of them at once. They drill lesson 02 - if `out`
and `params` are not automatic yet, reread `02_control_flow_methods`.

Every file lives in `src/Lessons/D04_MethodsParams/`. Nothing here depends on
anything else here.

## Exercise 1 - optional arguments

`Line(message, level = "INFO", source = null)` returns `"[LEVEL] message"`, or
`"[LEVEL] (source) message"` when a source is given. `Bullet(text, marker =
"-", indent = 0)` returns the indent spaces, the marker, a space, then the
text. The gate calls both with named arguments, in and out of order.

Edit `src/Lessons/D04_MethodsParams/Ex1.cs`.

```
uv run dojo test csharp d04_methods_params ex1
```

## Exercise 2 - params arrays

`Combine(params string?[] parts)` joins with `"/"`, ignoring null and blank
parts and stripping slashes from both ends of each part so no double slash can
appear. `First(params string?[] candidates)` returns the first non-blank
candidate, trimmed, or `""`. Both must survive being called with no arguments
at all.

Edit `src/Lessons/D04_MethodsParams/Ex2.cs`.

```
uv run dojo test csharp d04_methods_params ex2
```

## Exercise 3 - two out parameters

`TryRange(text, out low, out high)` reads `"3-9"`. Whitespace around either
number is ignored; both must be non-negative whole numbers and `low` must not
exceed `high`. Every failure returns `false` with both outs at 0.

Edit `src/Lessons/D04_MethodsParams/Ex3.cs`.

```
uv run dojo test csharp d04_methods_params ex3
```

## Exercise 4 - ref versus by value

`Scale(ref x, ref y, factor)` multiplies both of the caller's variables.
`SwapIfOutOfOrder(ref a, ref b)` swaps them when `a > b` and reports whether it
did. `BumpByValue(count)` returns `count + 1` and leaves the caller's variable
alone - the gate checks that it really is unchanged.

Edit `src/Lessons/D04_MethodsParams/Ex4.cs`.

```
uv run dojo test csharp d04_methods_params ex4
```

## Exercise 5 - overload resolution

Five overloads of `Describe`, each returning its own name: `int`, `long`,
`double`, `object`, and `params int[]`. The bodies are one line each; the
exercise is being able to predict, before you run it, which one
`Describe((short)3)`, `Describe(1.5f)`, `Describe(1)` and `Describe(1, 2)`
select.

Edit `src/Lessons/D04_MethodsParams/Ex5.cs`.

```
uv run dojo test csharp d04_methods_params ex5
```

## Exercise 6 - methods calling methods

`Gcd(a, b)` ignoring signs, with `Gcd(0, 0)` being 0. `Lcm(a, b)` built from
`Gcd`, always non-negative, 0 when either input is 0. `PowerOf(base, exponent)`
by recursion, with a negative exponent throwing
`ArgumentOutOfRangeException`.

Edit `src/Lessons/D04_MethodsParams/Ex6.cs`.

```
uv run dojo test csharp d04_methods_params ex6
```

## Exercise 7 - split the bill

`Split(total, ways)` returns one `decimal` per person, every share a whole
number of cents, adding up to the total exactly. Leftover cents go one each to
the earliest shares, so 10.00 between 3 is `3.34, 3.33, 3.33`. The total is
rounded to cents first, halves away from zero. A `ways` of 0 or less, or a
negative total, throws `ArgumentOutOfRangeException`.

Edit `src/Lessons/D04_MethodsParams/Ex7.cs`.

```
uv run dojo test csharp d04_methods_params ex7
```

## Exercise 8 - a command-line parser

`Parse(params string[] args)` returns the `--` options as a dictionary:
`--key=value` splits at the first `=`, `--key value` consumes the following
token unless it is itself an option, and a bare `--flag` stores `"true"`. Keys
are lower-cased without the dashes; a repeated key keeps the last value;
everything else is ignored. `ValueOr(options, key, fallback = "")` reads one
back.

Edit `src/Lessons/D04_MethodsParams/Ex8.cs`.

```
uv run dojo test csharp d04_methods_params ex8
```

## The gate

This is the entire gate class, `tests/Gates/D04_MethodsParamsTests.cs`:

```csharp
using System.Globalization;
using CSharpDojo.D04_MethodsParams;

namespace CSharpDojo.Gates;

public class D04_MethodsParamsTests
{
    private static string Money2(IEnumerable<decimal> shares) =>
        string.Join(", ", shares.Select(s => s.ToString("0.00", CultureInfo.InvariantCulture)));

    [Fact]
    public void Ex1_OptionalArgumentsAndNamedArguments()
    {
        Teach.Equal("[INFO] started", Log.Line("started"),
            "Both optional arguments left out, so the defaults apply - reread README ex1.");
        Teach.Equal("[WARN] started", Log.Line("started", "WARN"),
            "The second argument positionally is the level.");
        Teach.Equal("[WARN] (db) started", Log.Line("started", "WARN", "db"),
            "With a source, it goes in round brackets between the level and the message.");
        Teach.Equal("[INFO] (db) started", Log.Line("started", source: "db"),
            "Naming an argument lets the caller SKIP the one before it - which is the whole "
                + "reason optional parameters and named arguments belong together "
                + "- reread README ex1.");
        Teach.Equal("[ERROR] boom", Log.Line(level: "ERROR", message: "boom"),
            "Named arguments may also come in any order.");

        Teach.Equal("- milk", Log.Bullet("milk"), "Both defaults: marker '-' and no indent.");
        Teach.Equal("* milk", Log.Bullet("milk", "*"), "A different marker.");
        Teach.Equal("    - milk", Log.Bullet("milk", indent: 4),
            "Indent named, marker defaulted - reread README ex1.");
        Teach.Equal("  * milk", Log.Bullet("milk", "*", 2), "And both given positionally.");
    }

    [Fact]
    public void Ex2_ParamsArrays()
    {
        Teach.Equal("a/b", Paths.Combine("a", "b"), "Two parts, one separator - reread README ex2.");
        Teach.Equal("a/b", Paths.Combine("/a/", "/b/"),
            "Every part is stripped of its own slashes first, so no double slash can appear "
                + "- reread README ex2.");
        Teach.Equal("a/b", Paths.Combine("a", "", null, "b"),
            "Blank and null parts vanish rather than leaving '//' holes.");
        Teach.Equal("", Paths.Combine(),
            "A params method can be called with NO arguments at all - the array arrives empty, "
                + "never null - reread README ex2.");
        Teach.Equal("x/y", Paths.Combine(new string?[] { "x", "y" }),
            "...and it can also be handed a real array, which is the same method.");
        Teach.Equal("", Paths.Combine("/", "  "), "Parts that are nothing but slashes vanish too.");

        Teach.Equal("x", Paths.First("", " ", "x", "y"),
            "The first candidate with something in it, trimmed - reread README ex2.");
        Teach.Equal("x", Paths.First(" x "), "...and it is trimmed.");
        Teach.Equal("", Paths.First(), "No candidates means no answer, and no exception.");
        Teach.Equal("", Paths.First(null, "   "), "Nor does an all-blank list.");
    }

    [Fact]
    public void Ex3_TryPatternWithTwoOutParameters()
    {
        Teach.True(Parsing.TryRange("3-9", out int low, out int high) && low == 3 && high == 9,
            "The ordinary case: two numbers either side of the hyphen - reread README ex3.");
        Teach.True(Parsing.TryRange(" 3 - 9 ", out int paddedLow, out int paddedHigh)
                && paddedLow == 3 && paddedHigh == 9,
            "Whitespace around each number is ignored - trim the halves after splitting.");
        Teach.True(Parsing.TryRange("7-7", out int sameLow, out int sameHigh)
                && sameLow == 7 && sameHigh == 7,
            "A range of one is still a range: low may EQUAL high.");

        Teach.True(!Parsing.TryRange("9-3", out int badLow, out int badHigh)
                && badLow == 0 && badHigh == 0,
            "A backwards range is a failure, and a failed call leaves BOTH out parameters at 0 "
                + "- half-written output is worse than none - reread README ex3.");
        Teach.True(!Parsing.TryRange("3", out _, out _), "One number is not a range.");
        Teach.True(!Parsing.TryRange("3-9-2", out _, out _), "Nor are three.");
        Teach.True(!Parsing.TryRange("a-b", out _, out _), "Nor are two non-numbers.");
        Teach.True(!Parsing.TryRange("-3-9", out _, out _),
            "A negative bound is out of the grammar: splitting on '-' gives three fields here "
                + "- reread README ex3.");
        Teach.True(!Parsing.TryRange(null, out _, out _), "Null is a failure, not a crash.");
        Teach.True(!Parsing.TryRange("   ", out _, out _), "So is blank text.");
    }

    [Fact]
    public void Ex4_RefMeansTheCallersVariable()
    {
        int x = 3;
        int y = 4;
        Mutate.Scale(ref x, ref y, 10);
        Teach.Equal(30, x, "A ref parameter IS the caller's variable, so x changed - reread README ex4.");
        Teach.Equal(40, y, "...and so did y.");

        int a = 9;
        int b = 2;
        Teach.True(Mutate.SwapIfOutOfOrder(ref a, ref b),
            "9 is greater than 2, so it swapped and said so.");
        Teach.Equal(2, a, "a now holds the smaller value - reread README ex4.");
        Teach.Equal(9, b, "...and b the larger.");

        Teach.True(!Mutate.SwapIfOutOfOrder(ref a, ref b),
            "Already in order, so nothing to do and false.");
        Teach.Equal(2, a, "...and the variables were left alone.");
        Teach.Equal(9, b, "Both of them.");

        int count = 5;
        Teach.Equal(6, Mutate.BumpByValue(count), "The RETURNED value is one higher...");
        Teach.Equal(5, count,
            "...but the caller's variable is untouched, because a by-value parameter is a COPY. "
                + "If this is 6, you have found a bug in the C# compiler - reread README ex4.");
    }

    [Fact]
    public void Ex5_WhichOverloadDoesTheCompilerPick()
    {
        Teach.Equal("int", Overloads.Describe(1),
            "An exact match beats everything else - including the params array, which is only "
                + "considered when nothing else applies - reread README ex5.");
        Teach.Equal("long", Overloads.Describe(1L), "1L is a long, and long is exact.");
        Teach.Equal("double", Overloads.Describe(1.0), "1.0 is a double.");
        Teach.Equal("object", Overloads.Describe("text"),
            "A string only converts to object, so that is the only applicable overload.");

        Teach.Equal("int", Overloads.Describe((short)3),
            "short converts implicitly to int, long AND double. int wins because int is the "
                + "most specific of the three - reread README ex5.");
        Teach.Equal("int", Overloads.Describe('a'),
            "char widens to int the same way - which is also why 'a' + 1 is an int.");
        Teach.Equal("double", Overloads.Describe(1.5f),
            "float widens to double, and widening beats boxing to object - reread README ex5.");
        Teach.Equal("object", Overloads.Describe(true),
            "bool has no numeric conversion at all, so only object applies.");

        Teach.Equal("params", Overloads.Describe(1, 2),
            "Two ints match nothing in normal form, so the compiler expands the params array "
                + "- reread README ex5.");
        Teach.Equal("params", Overloads.Describe(new[] { 1, 2 }),
            "An int[] passed directly is the params overload in its NORMAL form.");
    }

    [Fact]
    public void Ex6_SmallMethodsThatCallEachOther()
    {
        Teach.Equal(6, Math2.Gcd(12, 18), "6 divides both - reread README ex6.");
        Teach.Equal(6, Math2.Gcd(18, 12), "Order does not matter.");
        Teach.Equal(6, Math2.Gcd(-12, 18), "Nor does sign.");
        Teach.Equal(5, Math2.Gcd(0, 5),
            "Everything divides 0, so the gcd is the other number - and Euclid's loop gives "
                + "that for free rather than needing a special case - reread README ex6.");
        Teach.Equal(0, Math2.Gcd(0, 0), "...and with two zeroes there is nothing to divide.");
        Teach.Equal(1, Math2.Gcd(7, 13), "Two primes share only 1.");

        Teach.Equal(12, Math2.Lcm(4, 6), "4 and 6 first meet at 12 - reread README ex6.");
        Teach.Equal(42, Math2.Lcm(21, 6), "21 and 6 meet at 42, not at 126.");
        Teach.Equal(12, Math2.Lcm(-4, 6), "The answer is always non-negative.");
        Teach.Equal(0, Math2.Lcm(0, 5), "A zero has no multiples to meet.");

        Teach.Equal(1024, Math2.PowerOf(2, 10), "Ten doublings - reread README ex6.");
        Teach.Equal(1, Math2.PowerOf(5, 0),
            "Anything to the power 0 is 1, and that is the recursion's base case.");
        Teach.Equal(-8, Math2.PowerOf(-2, 3), "A negative base keeps its sign on odd powers.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Math2.PowerOf(2, -1),
            "A negative exponent has no int answer - guard BEFORE recursing, or the recursion "
                + "never reaches its base case - reread README ex6.");
    }

    [Fact]
    public void Ex7_SplittingMoneyWithoutLosingACent()
    {
        Teach.Equal("3.34, 3.33, 3.33", Money2(Money.Split(10m, 3)),
            "10.00 in three does not divide, so one share carries the spare cent and the total "
                + "is preserved exactly - reread README ex7.");
        Teach.Equal(10.00m, Money.Split(10m, 3).Sum(),
            "The shares must add back up to the total. Rounding each share independently loses "
                + "a cent, which is the bug this exercise exists for - reread README ex7.");
        Teach.Equal("0.03, 0.02", Money2(Money.Split(0.05m, 2)),
            "Five cents in two is three and two.");
        Teach.Equal("1.00", Money2(Money.Split(1m, 1)), "One way is the whole thing.");
        Teach.Equal("5.01, 5.00", Money2(Money.Split(10.005m, 2)),
            "The total is rounded to cents FIRST - halves away from zero, so 10.005 becomes "
                + "10.01 - and then split - reread README ex7.");
        Teach.Equal("0.00, 0.00, 0.00", Money2(Money.Split(0m, 3)), "Nothing splits into nothing.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Money.Split(10m, 0),
            "Splitting between nobody is a caller bug, not a division by zero - reread "
                + "README ex7.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Money.Split(10m, -2), "Nor a negative count.");
        Teach.Throws<ArgumentOutOfRangeException>(() => Money.Split(-1m, 2),
            "And a negative total is out of range too.");
    }

    [Fact]
    public void Ex8_ACommandLineParser()
    {
        Dictionary<string, string> options = Args.Parse("--name=ada", "--verbose", "--level", "3");

        Teach.Equal("ada", Args.ValueOr(options, "name"),
            "'--key=value' splits at the FIRST '=' - reread README ex8.");
        Teach.Equal("true", Args.ValueOr(options, "verbose"),
            "'--verbose' is followed by another option, so it is a flag and stores \"true\" "
                + "- reread README ex8.");
        Teach.Equal("3", Args.ValueOr(options, "level"),
            "'--level 3' takes the NEXT token as its value, and that token must not be counted "
                + "again as an option - reread README ex8.");
        Teach.Equal(3, options.Count, "Three options, and no fourth entry for the consumed '3'.");

        Teach.Equal(0, Args.Parse().Count,
            "No arguments at all is an empty dictionary - a params array is never null.");
        Teach.Equal("Ada", Args.ValueOr(Args.Parse("--Name", "Ada"), "name"),
            "The KEY is lower-cased so lookups are predictable; the VALUE is left exactly as "
                + "the user typed it - reread README ex8.");
        Teach.Equal("2", Args.ValueOr(Args.Parse("--x=1", "--x=2"), "x"),
            "A repeated option keeps the last value, which is what every shell tool does.");
        Teach.Equal("", Args.ValueOr(Args.Parse("--k="), "k", "MISSING"),
            "'--k=' is an option with an EMPTY value, which is not the same as an absent "
                + "option - reread README ex8.");

        Dictionary<string, string> positional = Args.Parse("hello", "--a");
        Teach.Equal(1, positional.Count, "A bare word before an option is not an option.");
        Teach.Equal("true", Args.ValueOr(positional, "a"), "...and the trailing flag is still a flag.");

        Teach.Equal("", Args.ValueOr(options, "nope"),
            "The fallback defaults to the empty string - reread README ex8.");
        Teach.Equal("dev", Args.ValueOr(options, "nope", "dev"), "...unless the caller supplies one.");
    }
}
```
