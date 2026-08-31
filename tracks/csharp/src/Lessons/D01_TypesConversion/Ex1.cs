// d01_types_conversion / ex1 - integer division and remainder.
// See lessons/d01_types_conversion/README.md, "Exercise 1".

namespace CSharpDojo.D01_TypesConversion;

public static class Duration
{
    /// <summary>
    /// Format a non-negative number of seconds as "H:MM:SS" - the hours part
    /// unpadded, minutes and seconds always two digits.
    /// A negative input is a caller bug: throw ArgumentOutOfRangeException.
    /// </summary>
    public static string Clock(int totalSeconds)
    {
        throw new NotImplementedException("ex1: Clock is not implemented yet - edit this file.");
    }

    /// <summary>
    /// How many whole minutes are in this many seconds, truncating toward zero
    /// (so 119 is 1 minute and -119 is -1 minute).
    /// </summary>
    public static int WholeMinutes(int totalSeconds)
    {
        throw new NotImplementedException("ex1: WholeMinutes is not implemented yet - edit this file.");
    }
}
