using CSharpDojo.L01_TypesVariables;

namespace CSharpDojo.Gates;

public class L01_TypesVariablesTests
{
    [Fact]
    public void Ex1_CopyingAStructCopiesTheValue()
    {
        Teach.Equal(
            12,
            Copies.AfterCopyingAStruct(new ReadingValue { Degrees = 12 }),
            "ReadingValue is a struct, so `copy = original` duplicates the data. Writing 99 "
                + "into the copy cannot reach the original - reread README ex1.");

        Teach.Equal(
            99,
            Copies.AfterCopyingAClass(new ReadingRef { Degrees = 12 }),
            "ReadingRef is a class, so `copy = original` duplicates the arrow, not the object. "
                + "Both names point at one object, so writing 99 through the copy is visible "
                + "through the original - reread README ex1.");
    }

    [Fact]
    public void Ex2_ConversionsTruncateRoundAndWiden()
    {
        Teach.Equal(3, Conversions.Truncate(3.9),
            "A cast from double to int truncates toward zero: 3.9 -> 3, never 4.");

        Teach.Equal(-3, Conversions.Truncate(-3.9),
            "Truncation is toward ZERO, not downward: -3.9 -> -3, not -4. If you got -4 you "
                + "reached for Math.Floor - reread README ex2.");

        Teach.Equal(3, Conversions.RoundHalfAwayFromZero(2.5),
            "Math.Round's default is banker's rounding, which sends 2.5 to 2. This method has "
                + "to send it to 3, so pass MidpointRounding.AwayFromZero - reread README ex2.");

        Teach.Equal(4, Conversions.RoundHalfAwayFromZero(3.5),
            "Banker's rounding sends 3.5 to 4 as well, which is why 2.5 is the case that "
                + "catches you. Both must round away from zero here.");

        Teach.Equal(2147483648L, Conversions.SafeAdd(int.MaxValue, 1),
            "int.MaxValue + 1 wraps around to a negative number because the ADDITION happens "
                + "in int. Widen an operand to long before adding - reread README ex2.");
    }

    [Fact]
    public void Ex3_DescribeHandlesEveryMissingCombination()
    {
        Teach.Equal("Ada (36)", Labels.Describe("Ada", 36),
            "With both values present, Describe is just an interpolated string.");

        Teach.Equal("anonymous (36)", Labels.Describe(null, 36),
            "A null name becomes \"anonymous\" - reread README ex3.");

        Teach.Equal("anonymous (36)", Labels.Describe("   ", 36),
            "Blank is as missing as null here. string.IsNullOrWhiteSpace covers both in one "
                + "check - reread README ex3.");

        Teach.Equal("Ada (age unknown)", Labels.Describe("Ada", null),
            "int? has no value here, so the parentheses hold \"age unknown\" instead of a number.");

        Teach.Equal("anonymous (age unknown)", Labels.Describe(null, null),
            "Both decisions are independent: handle each one on its own rather than writing "
                + "one branch per combination.");
    }

    [Fact]
    public void Ex4_LineTotalIsDecimalMoneyMaths()
    {
        Teach.Equal(59.97m, Money.LineTotal(19.99m, 3, 0m),
            "19.99 x 3 is 59.97 exactly in decimal. If you saw 59.970000000000006 you did the "
                + "maths in double somewhere - reread README ex4.");

        Teach.Equal(27.00m, Money.LineTotal(10m, 3, 10m),
            "A 10% discount off 30 is 27. discountPercent is a percentage, not a fraction.");

        Teach.Equal(0.13m, Money.LineTotal(0.25m, 1, 50m),
            "Half of 0.25 is 0.125, exactly on the halfway line. Math.Round's default rounds "
                + "that to the even neighbour, 0.12; this method must round away from zero to "
                + "0.13 - reread README ex4.");

        Teach.Equal(0m, Money.LineTotal(19.99m, 0, 0m),
            "Zero of something costs nothing. No special case needed - the arithmetic already "
                + "says so.");
    }

    [Fact]
    public void Challenge_FormatParsesAndReformatsALine()
    {
        Teach.Equal("widget x3 = $59.97", ReceiptLine.Format("widget|19.99|3"),
            "Split on '|', parse the middle field as a decimal and the last as an int, then "
                + "rebuild the line - reread README challenge.");

        Teach.Equal("cable x4 = $10.00", ReceiptLine.Format("cable|2.5|4"),
            "The money is always printed with two decimal places, so 10 prints as \"10.00\". "
                + "A plain interpolation of the decimal would print \"10.0\" - use a format string.");

        Teach.Equal("mat x3 = $0.30", ReceiptLine.Format("mat|0.1|3"),
            "0.1 x 3 is exactly 0.30 in decimal, and prints with both decimal places.");
    }

    [Fact]
    public void Review1_SummarizeMixesNullChecksAndRounding()
    {
        Teach.Equal("kiln: 21C", SensorRow.Summarize("kiln", 20.5),
            "20.5 rounds away from zero to 21 - the same MidpointRounding decision as ex2.");

        Teach.Equal("sensor: 20C", SensorRow.Summarize(null, 20.4),
            "A missing label becomes \"sensor\"; 20.4 is nowhere near a halfway case and rounds "
                + "down to 20.");

        Teach.Equal("kiln: no reading", SensorRow.Summarize("kiln", null),
            "A null double? means there is no temperature to print at all - the whole "
                + "\"21C\" part is replaced.");

        Teach.Equal("sensor: no reading", SensorRow.Summarize("  ", null),
            "Blank label and no reading: both fallbacks at once.");
    }
}
