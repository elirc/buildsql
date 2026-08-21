// 03_classes_objects / ex4 - a property with a body, guarding a field.
// See lessons/03_classes_objects/README.md, "Exercise 4".

namespace CSharpDojo.L03_ClassesObjects;

public class Thermostat
{
    public const int Minimum = 5;
    public const int Maximum = 30;

    private int _celsius = 20;

    /// <summary>
    /// Reads the stored setting. Writing clamps into Minimum..Maximum rather
    /// than throwing - a thermostat has no way to complain to a user.
    /// </summary>
    public int Celsius
    {
        get => _celsius;
        set => _celsius = Math.Clamp(value, Minimum, Maximum);
    }

    /// <summary>The same setting in Fahrenheit, rounded to a whole degree.</summary>
    public int Fahrenheit => (int)Math.Round((_celsius * 9.0 / 5.0) + 32, MidpointRounding.AwayFromZero);
}
