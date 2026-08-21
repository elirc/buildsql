// 01_types_variables / review1 - nullables and rounding, one more time.
// See lessons/01_types_variables/README.md, "Review".

namespace CSharpDojo.L01_TypesVariables;

public static class SensorRow
{
    /// <summary>
    /// "kiln: 21C" - a missing or blank label becomes "sensor", and a missing
    /// reading becomes "no reading" in place of the temperature.
    /// The temperature is rounded to a whole number, halves away from zero.
    /// </summary>
    public static string Summarize(string? label, double? celsius)
    {
        throw new NotImplementedException("review1: Summarize is not implemented yet - edit this file.");
    }
}
