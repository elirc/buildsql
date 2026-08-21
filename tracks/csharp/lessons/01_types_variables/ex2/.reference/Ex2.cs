// 01_types_variables / ex2 - conversions: truncation, rounding, widening.
// See lessons/01_types_variables/README.md, "Exercise 2".

namespace CSharpDojo.L01_TypesVariables;

public static class Conversions
{
    /// <summary>Chop the fractional part off, toward zero. 3.9 -> 3, -3.9 -> -3.</summary>
    public static int Truncate(double value)
    {
        return (int)value;
    }

    /// <summary>Round to the nearest whole number, with .5 always going AWAY from zero.</summary>
    public static int RoundHalfAwayFromZero(double value)
    {
        return (int)Math.Round(value, MidpointRounding.AwayFromZero);
    }

    /// <summary>Add two ints without ever overflowing. The return type is your tool.</summary>
    public static long SafeAdd(int a, int b)
    {
        return (long)a + b;
    }
}
