// d01_types_conversion / ex2 - when the int maths happens decides the answer.
// See lessons/d01_types_conversion/README.md, "Exercise 2".

namespace CSharpDojo.D01_TypesConversion;

public static class Ratios
{
    /// <summary>
    /// part as a percentage of whole, rounded to one decimal place with halves
    /// going away from zero. A whole of 0 throws DivideByZeroException.
    /// </summary>
    public static double Percent(int part, int whole)
    {
        if (whole == 0)
        {
            throw new DivideByZeroException("A percentage of nothing is not a number.");
        }

        return Math.Round(part * 100.0 / whole, 1, MidpointRounding.AwayFromZero);
    }

    /// <summary>
    /// The same percentage as a whole number, truncated toward zero and computed
    /// entirely in integer arithmetic. A whole of 0 throws DivideByZeroException.
    /// </summary>
    public static int IntegerPercent(int part, int whole)
    {
        if (whole == 0)
        {
            throw new DivideByZeroException("A percentage of nothing is not a number.");
        }

        return part * 100 / whole;
    }
}
