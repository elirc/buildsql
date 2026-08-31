// d01_types_conversion / ex4 - overflow: wrap, throw, or clamp.
// See lessons/d01_types_conversion/README.md, "Exercise 4".

namespace CSharpDojo.D01_TypesConversion;

public static class Counters
{
    /// <summary>
    /// a + b, but an int that cannot hold the answer must raise
    /// OverflowException rather than silently wrapping.
    /// </summary>
    public static int AddChecked(int a, int b)
    {
        checked
        {
            return a + b;
        }
    }

    /// <summary>
    /// a + b, clamped: anything above int.MaxValue comes back as int.MaxValue
    /// and anything below int.MinValue as int.MinValue. Never throws.
    /// </summary>
    public static int AddSaturating(int a, int b)
    {
        long sum = (long)a + b;
        if (sum > int.MaxValue)
        {
            return int.MaxValue;
        }

        if (sum < int.MinValue)
        {
            return int.MinValue;
        }

        return (int)sum;
    }
}
