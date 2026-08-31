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
        throw new NotImplementedException("ex3: SumOrNull is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The mean of the readings that are actually present, as a double.
    /// No readings present means 0.0 rather than an exception.
    /// </summary>
    public static double AverageOfPresent(int?[] readings)
    {
        throw new NotImplementedException("ex3: AverageOfPresent is not implemented yet - edit this file.");
    }

    /// <summary>The value as text, or "none" when there is no value.</summary>
    public static string Describe(int? value)
    {
        throw new NotImplementedException("ex3: Describe is not implemented yet - edit this file.");
    }
}
