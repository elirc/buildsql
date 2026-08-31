// d05_classes_construction / ex3 - named constructors: static factory methods.
// See lessons/d05_classes_construction/README.md, "Exercise 3".

namespace CSharpDojo.D05_ClassesConstruction;

public class Temperature
{
    // The constructor is PRIVATE on purpose: callers go through the factories,
    // so "new Temperature(20)" cannot be ambiguous about which scale it meant.
    private Temperature(double celsius)
    {
        Celsius = celsius;
    }

    /// <summary>Degrees Celsius.</summary>
    public double Celsius { get; }

    /// <summary>The same temperature in Fahrenheit: C * 9 / 5 + 32.</summary>
    public double Fahrenheit => throw new NotImplementedException("ex3: Fahrenheit is not implemented yet - edit this file.");

    /// <summary>
    /// Build one from Celsius. Below absolute zero (-273.15) throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static Temperature FromCelsius(double celsius)
    {
        throw new NotImplementedException("ex3: FromCelsius is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Build one from Fahrenheit, converting with (F - 32) * 5 / 9 and then
    /// applying the same absolute-zero rule.
    /// </summary>
    public static Temperature FromFahrenheit(double fahrenheit)
    {
        throw new NotImplementedException("ex3: FromFahrenheit is not implemented yet - edit this file.");
    }
}
