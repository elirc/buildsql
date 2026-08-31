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
        if (totalSeconds < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(totalSeconds), "A clock reading cannot be negative.");
        }

        int hours = totalSeconds / 3600;
        int minutes = totalSeconds % 3600 / 60;
        int seconds = totalSeconds % 60;
        return $"{hours}:{minutes:D2}:{seconds:D2}";
    }

    /// <summary>
    /// How many whole minutes are in this many seconds, truncating toward zero
    /// (so 119 is 1 minute and -119 is -1 minute).
    /// </summary>
    public static int WholeMinutes(int totalSeconds)
    {
        return totalSeconds / 60;
    }
}
