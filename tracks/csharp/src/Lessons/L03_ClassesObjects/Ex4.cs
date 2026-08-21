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
        get => throw new NotImplementedException("ex4: the Celsius getter is not implemented yet - edit this file.");
        set => throw new NotImplementedException("ex4: the Celsius setter is not implemented yet - edit this file.");
    }

    /// <summary>The same setting in Fahrenheit, rounded to a whole degree.</summary>
    public int Fahrenheit => throw new NotImplementedException("ex4: Fahrenheit is not implemented yet - edit this file.");
}
