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
        string name = string.IsNullOrWhiteSpace(label) ? "sensor" : label;
        if (!celsius.HasValue)
        {
            return $"{name}: no reading";
        }

        int degrees = (int)Math.Round(celsius.Value, MidpointRounding.AwayFromZero);
        return $"{name}: {degrees}C";
    }
}
