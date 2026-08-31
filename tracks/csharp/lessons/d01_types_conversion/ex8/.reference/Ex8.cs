// d01_types_conversion / ex8 - what an explicit cast actually does.
// See lessons/d01_types_conversion/README.md, "Exercise 8".

namespace CSharpDojo.D01_TypesConversion;

public static class Casts
{
    /// <summary>double to int by cast: the fraction is dropped, toward zero.</summary>
    public static int TruncateToInt(double value)
    {
        return (int)value;
    }

    /// <summary>
    /// int to byte, keeping only the low 8 bits and never throwing - so 300
    /// becomes 44 and -1 becomes 255.
    /// </summary>
    public static byte WrapToByte(int value)
    {
        return unchecked((byte)value);
    }

    /// <summary>A UTF-16 code unit as its char.</summary>
    public static char ToChar(int code)
    {
        return (char)code;
    }

    /// <summary>
    /// The cast you can trust: true plus the truncated value when the double is
    /// a real number that an int can hold, false plus 0 otherwise (NaN, either
    /// infinity, or a magnitude past int.MinValue / int.MaxValue). The cast
    /// itself must never run on a value it cannot represent.
    /// </summary>
    public static bool TrySafeToInt(double value, out int result)
    {
        result = 0;
        if (double.IsNaN(value) || double.IsInfinity(value))
        {
            return false;
        }

        if (value < int.MinValue || value > int.MaxValue)
        {
            return false;
        }

        result = (int)value;
        return true;
    }
}
