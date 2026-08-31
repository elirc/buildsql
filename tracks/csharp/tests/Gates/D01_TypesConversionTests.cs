using CSharpDojo.D01_TypesConversion;

namespace CSharpDojo.Gates;

public class D01_TypesConversionTests
{
    [Fact]
    public void Ex1_ClockAndWholeMinutes()
    {
        Teach.Equal("0:00:00", Duration.Clock(0),
            "Zero seconds is still a clock reading, and both the minutes and the seconds "
                + "are padded to two digits - reread README ex1.");
        Teach.Equal("0:00:59", Duration.Clock(59), "Under a minute, so only the seconds move.");
        Teach.Equal("0:01:00", Duration.Clock(60), "60 seconds is one minute and no seconds.");
        Teach.Equal("1:01:01", Duration.Clock(3661),
            "3661 = 1 hour + 1 minute + 1 second. If the minutes came out as 61 you took the "
                + "remainder of the wrong thing: minutes are (total % 3600) / 60 - reread README ex1.");
        Teach.Equal("23:59:59", Duration.Clock(86399), "One second short of a day.");
        Teach.Equal("100:00:00", Duration.Clock(360000),
            "The hours part is NOT padded and NOT wrapped at 24 - it is just a count.");

        Teach.Equal(1, Duration.WholeMinutes(119),
            "Integer division throws the fraction away rather than rounding, so 119 seconds "
                + "is 1 whole minute - reread README ex1.");
        Teach.Equal(-1, Duration.WholeMinutes(-119),
            "Integer division truncates TOWARD ZERO, so -119 is -1 and not -2. This is the "
                + "one place C# differs from a mathematician's floor - reread README ex1.");
        Teach.Equal(0, Duration.WholeMinutes(59), "Under a minute is no whole minutes.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Duration.Clock(-1),
            "A negative reading is a caller bug, and the precise exception type says which "
                + "argument to fix - reread README ex1.");
    }

    [Fact]
    public void Ex2_PercentagesAndWhereTheIntMathsHappens()
    {
        Teach.Equal(33.3, Ratios.Percent(1, 3),
            "1 in 3 is 33.3%. If you got 0 you divided two ints before widening: part / whole "
                + "is integer division, and 1 / 3 is 0 - reread README ex2.");
        Teach.Equal(66.7, Ratios.Percent(2, 3), "Rounded up at the first decimal place.");
        Teach.Equal(6.3, Ratios.Percent(1, 16),
            "100/16 is exactly 6.25 - a midpoint. The specification says halves go AWAY from "
                + "zero, so this is 6.3. Math.Round's default is to-even and would say 6.2 "
                + "- reread README ex2.");
        Teach.Equal(0.0, Ratios.Percent(0, 5), "None of five is 0%.");

        Teach.Equal(33, Ratios.IntegerPercent(1, 3),
            "Multiply first, divide second: 1 * 100 / 3 is 33, while 1 / 3 * 100 is 0 "
                + "- reread README ex2.");
        Teach.Equal(66, Ratios.IntegerPercent(2, 3), "Truncated, not rounded: 66 rather than 67.");
        Teach.Equal(100, Ratios.IntegerPercent(3, 3), "All of it.");
        Teach.Equal(-33, Ratios.IntegerPercent(-1, 3), "Truncation is toward zero here too.");

        Teach.Throws<DivideByZeroException>(() => Ratios.Percent(1, 0),
            "A share of nothing has no answer - say so rather than returning Infinity "
                + "- reread README ex2.");
        Teach.Throws<DivideByZeroException>(() => Ratios.IntegerPercent(1, 0),
            "...and the integer version guards the same way. (Integer division by zero would "
                + "throw on its own; the double version would quietly return Infinity, which "
                + "is exactly why the guard is written explicitly.)");
    }

    [Fact]
    public void Ex3_NullableValueTypes()
    {
        Teach.Equal(null, Optional.SumOrNull(null, null),
            "Nothing plus nothing is still nothing - not 0 - reread README ex3.");
        Teach.Equal(5, Optional.SumOrNull(null, 5),
            "One value present means the other counts as 0.");
        Teach.Equal(5, Optional.SumOrNull(2, 3), "Both present is an ordinary sum.");
        Teach.Equal(0, Optional.SumOrNull(0, null),
            "0 is a VALUE, not an absence. If this came back null you tested the sum instead "
                + "of the inputs - reread README ex3.");

        Teach.Equal(1.5, Optional.AverageOfPresent(new int?[] { 1, 2 }),
            "The mean of 1 and 2 is 1.5. If you got 1, the division happened in int "
                + "- reread README ex3.");
        Teach.Equal(7 / 3.0, Optional.AverageOfPresent(new int?[] { 1, 2, null, 4 }),
            "The null is skipped entirely: 7 over THREE readings, not four - reread README ex3.");
        Teach.Equal(0.0, Optional.AverageOfPresent(new int?[] { null, null }),
            "No readings present means 0.0 rather than a divide-by-zero.");
        Teach.Equal(0.0, Optional.AverageOfPresent(Array.Empty<int?>()), "An empty array too.");

        Teach.Equal("none", Optional.Describe(null), "No value, so the word - reread README ex3.");
        Teach.Equal("0", Optional.Describe(0), "...but 0 is a value and prints as one.");
        Teach.Equal("-4", Optional.Describe(-4), "Negative values print normally.");
    }

    [Fact]
    public void Ex4_OverflowWrapsUnlessYouStopIt()
    {
        Teach.Equal(5, Counters.AddChecked(2, 3), "The ordinary case is unchanged.");
        Teach.Throws<OverflowException>(() => Counters.AddChecked(int.MaxValue, 1),
            "One past the largest int is not the smallest int - in a checked context it is an "
                + "OverflowException. Without `checked` this silently wraps to a large negative "
                + "number - reread README ex4.");
        Teach.Throws<OverflowException>(() => Counters.AddChecked(int.MinValue, -1),
            "...and it guards the bottom of the range too.");

        Teach.Equal(-2, Counters.AddSaturating(-5, 3), "The ordinary case is unchanged here too.");
        Teach.Equal(int.MaxValue, Counters.AddSaturating(int.MaxValue, 1),
            "Clamping means the answer stops at the top of the range instead of wrapping "
                + "- reread README ex4.");
        Teach.Equal(int.MinValue, Counters.AddSaturating(int.MinValue, -1),
            "...and stops at the bottom.");
        Teach.Equal(int.MaxValue, Counters.AddSaturating(int.MaxValue, int.MaxValue),
            "Both operands at the limit: if you added them as ints first, the overflow already "
                + "happened before your comparison ran. Widen to long BEFORE adding "
                + "- reread README ex4.");
    }

    [Fact]
    public void Ex5_DoubleIsApproximateAndDecimalIsNot()
    {
        Teach.True(Precision.DoubleTenthsReach(1),
            "One tenth added once is exactly one tenth - the error needs more than one step "
                + "to show up - reread README ex5.");
        Teach.True(!Precision.DoubleTenthsReach(3),
            "0.1 + 0.1 + 0.1 is 0.30000000000000004, which is NOT 0.3. This is the single most "
                + "famous fact about binary floating point - reread README ex5.");
        Teach.True(Precision.DecimalTenthsReach(3),
            "decimal stores tenths exactly, so the same loop lands on the number - reread "
                + "README ex5.");
        Teach.True(Precision.DecimalTenthsReach(7), "...and it keeps landing on it.");

        Teach.Equal(2.35m, Precision.RoundMoney(2.345m),
            "2.345 is exactly a midpoint, and away-from-zero sends it up - reread README ex5.");
        Teach.Equal(2.34m, Precision.BankersRound(2.345m),
            "The SAME number rounds down under to-even, because 4 is already even. This is "
                + "Math.Round's default and it surprises people in money code - reread "
                + "README ex5.");
        Teach.Equal(2.36m, Precision.BankersRound(2.355m),
            "...and to-even sends this one up, because 5 is odd. To-even is not 'always down'.");
        Teach.Equal(-2.35m, Precision.RoundMoney(-2.345m),
            "Away from zero means away in both directions.");
        Teach.Equal(2.34m, Precision.RoundMoney(2.344m), "Below the midpoint, so down either way.");
    }

    [Fact]
    public void Ex6_ParsingTextYouDidNotWrite()
    {
        Teach.True(Fields.TryReadAmount(" 1,234.50 ", out decimal grouped) && grouped == 1234.50m,
            "Surrounding whitespace is ignored and the group separator is allowed, so this is "
                + "1234.50 - reread README ex6.");
        Teach.True(Fields.TryReadAmount("$19.99", out decimal money) && money == 19.99m,
            "One leading currency symbol is stripped before the number is read.");
        Teach.True(Fields.TryReadAmount("-5.25", out decimal negative) && negative == -5.25m,
            "A leading sign is part of the number.");

        Teach.True(!Fields.TryReadAmount(null, out decimal fromNull) && fromNull == 0m,
            "Null is a failure, and a failed read leaves the out parameter at 0 rather than "
                + "at whatever the caller passed - reread README ex6.");
        Teach.True(!Fields.TryReadAmount("   ", out _), "Whitespace only is a failure.");
        Teach.True(!Fields.TryReadAmount("abc", out decimal fromWords) && fromWords == 0m,
            "Words are a failure - and NOT an exception. That is the whole point of the "
                + "Try-pattern - reread README ex6.");
        Teach.True(!Fields.TryReadAmount("12 34", out _),
            "Whitespace INSIDE the number is a failure: NumberStyles.Number allows it around "
                + "the number, not inside it.");
    }

    [Fact]
    public void Ex7_TheLedgerAddsUpAndReportsBadLines()
    {
        Teach.Equal(7.51m, Ledger.Balance(new[] { "credit,10.005", "debit,2.50" }),
            "10.005 - 2.50 is 7.505, and halves go away from zero, so 7.51. Round ONCE at the "
                + "end rather than after each line - reread README ex7.");
        Teach.Equal(0m, Ledger.Balance(Array.Empty<string>()),
            "No lines is a balance of zero, not an exception.");
        Teach.Equal(4.00m, Ledger.Balance(new[] { "", "CREDIT, 5.00", "  ", "Debit,1" }),
            "Blank lines are skipped, the operation is matched ignoring case, and the fields "
                + "are trimmed - reread README ex7.");

        FormatException second = Teach.Throws<FormatException>(
            () => Ledger.Balance(new[] { "credit,10", "oops" }),
            "A line without both fields is malformed - reread README ex7.");
        Teach.True(second.Message.Contains("line 2"),
            "The message must name the line so the user can fix it. Yours was: " + second.Message);

        FormatException third = Teach.Throws<FormatException>(
            () => Ledger.Balance(new[] { "credit,10", "", "spend,3" }),
            "'spend' is not one of the two operations.");
        Teach.True(third.Message.Contains("line 3"),
            "The blank line still counts toward the line number, so this is line 3 and not "
                + "line 2 - reread README ex7. Yours was: " + third.Message);

        FormatException first = Teach.Throws<FormatException>(
            () => Ledger.Balance(new[] { "credit,ten" }),
            "An amount that is not a number is malformed.");
        Teach.True(first.Message.Contains("line 1"),
            "Line numbers are 1-based. Yours was: " + first.Message);
    }

    [Fact]
    public void Ex8_WhatAnExplicitCastActuallyDoes()
    {
        Teach.Equal(3, Casts.TruncateToInt(3.99),
            "A cast from double to int truncates - it does not round - reread README ex8.");
        Teach.Equal(-3, Casts.TruncateToInt(-3.99),
            "...and it truncates toward zero, so -3.99 becomes -3 rather than -4.");
        Teach.Equal(0, Casts.TruncateToInt(-0.5), "Which makes this 0 and not -1.");

        Teach.Equal((byte)44, Casts.WrapToByte(300),
            "300 does not fit in a byte, so the high bits are thrown away and 300 - 256 = 44 "
                + "is what remains - reread README ex8.");
        Teach.Equal((byte)255, Casts.WrapToByte(-1),
            "-1 as an unsigned byte is all ones, which reads as 255. This is the bug that "
                + "makes a 'never negative' counter wrap to a huge number.");
        Teach.Equal((byte)0, Casts.WrapToByte(256), "And 256 wraps all the way round to 0.");

        Teach.Equal('A', Casts.ToChar(65), "char is a 16-bit number wearing a costume.");
        Teach.Equal('a', Casts.ToChar(97), "...and 97 is its lower-case twin.");

        Teach.True(Casts.TrySafeToInt(3.99, out int ok) && ok == 3,
            "A double an int can hold converts, still truncating - reread README ex8.");
        Teach.True(Casts.TrySafeToInt(-2.5, out int down) && down == -2, "Toward zero again.");
        Teach.True(!Casts.TrySafeToInt(1e20, out int huge) && huge == 0,
            "1e20 is far past int.MaxValue. The unguarded cast would hand back garbage without "
                + "complaining - which is why this method exists - reread README ex8.");
        Teach.True(!Casts.TrySafeToInt(double.NaN, out int nan) && nan == 0,
            "NaN is not a number, so there is no int for it. Check for it BEFORE the cast: "
                + "the cast itself does not raise anything - reread README ex8.");
        Teach.True(!Casts.TrySafeToInt(double.PositiveInfinity, out _),
            "Infinity is out of range too.");
    }
}
