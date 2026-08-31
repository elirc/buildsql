// d01_types_conversion / ex5 - double is fast and approximate, decimal is exact.
// See lessons/d01_types_conversion/README.md, "Exercise 5".

namespace CSharpDojo.D01_TypesConversion;

public static class Precision
{
    /// <summary>
    /// Start at 0.0, add 0.1 exactly <paramref name="times"/> times, and report
    /// whether the running total ends up EXACTLY equal to times / 10.0.
    /// </summary>
    public static bool DoubleTenthsReach(int times)
    {
        double total = 0.0;
        for (int i = 0; i < times; i++)
        {
            total += 0.1;
        }

        return total == times / 10.0;
    }

    /// <summary>
    /// The same experiment in decimal: add 0.1m that many times and report
    /// whether the total equals times / 10m exactly.
    /// </summary>
    public static bool DecimalTenthsReach(int times)
    {
        decimal total = 0m;
        for (int i = 0; i < times; i++)
        {
            total += 0.1m;
        }

        return total == times / 10m;
    }

    /// <summary>Round to 2 decimal places with halves going away from zero.</summary>
    public static decimal RoundMoney(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>Round to 2 decimal places with halves going to the even digit.</summary>
    public static decimal BankersRound(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.ToEven);
    }
}
