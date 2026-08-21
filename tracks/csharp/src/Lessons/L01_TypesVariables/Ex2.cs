// 01_types_variables / ex2 - conversions: truncation, rounding, widening.
// See lessons/01_types_variables/README.md, "Exercise 2".

namespace CSharpDojo.L01_TypesVariables;

public static class Conversions
{
    /// <summary>Chop the fractional part off, toward zero. 3.9 -> 3, -3.9 -> -3.</summary>
    public static int Truncate(double value)
    {
        throw new NotImplementedException("ex2: Truncate is not implemented yet - edit this file.");
    }

    /// <summary>Round to the nearest whole number, with .5 always going AWAY from zero.</summary>
    public static int RoundHalfAwayFromZero(double value)
    {
        throw new NotImplementedException("ex2: RoundHalfAwayFromZero is not implemented yet - edit this file.");
    }

    /// <summary>Add two ints without ever overflowing. The return type is your tool.</summary>
    public static long SafeAdd(int a, int b)
    {
        throw new NotImplementedException("ex2: SafeAdd is not implemented yet - edit this file.");
    }
}
