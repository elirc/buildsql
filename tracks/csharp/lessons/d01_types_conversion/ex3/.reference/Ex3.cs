// d01_types_conversion / ex3 - nullable value types and the absent reading.
// See lessons/d01_types_conversion/README.md, "Exercise 3".

namespace CSharpDojo.D01_TypesConversion;

public static class Optional
{
    /// <summary>
    /// null when BOTH inputs are null; otherwise the sum, counting a null as 0.
    /// </summary>
    public static int? SumOrNull(int? a, int? b)
    {
        if (a is null && b is null)
        {
            return null;
        }

        return (a ?? 0) + (b ?? 0);
    }

    /// <summary>
    /// The mean of the readings that are actually present, as a double.
    /// No readings present means 0.0 rather than an exception.
    /// </summary>
    public static double AverageOfPresent(int?[] readings)
    {
        int sum = 0;
        int count = 0;
        foreach (int? reading in readings)
        {
            if (reading.HasValue)
            {
                sum += reading.Value;
                count++;
            }
        }

        return count == 0 ? 0.0 : sum / (double)count;
    }

    /// <summary>The value as text, or "none" when there is no value.</summary>
    public static string Describe(int? value)
    {
        return value.HasValue ? value.Value.ToString() : "none";
    }
}
