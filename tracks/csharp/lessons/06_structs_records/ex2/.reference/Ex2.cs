// 06_structs_records / ex2 - what a record gives you that a class does not.
// See lessons/06_structs_records/README.md, "Exercise 2".

namespace CSharpDojo.L06_StructsRecords;

/// <summary>Two properties, value equality, a readable ToString - all free.</summary>
public record Reading(string Sensor, int Degrees);

/// <summary>The same two values as an ordinary class, with nothing added.</summary>
public class ReadingClass
{
    public ReadingClass(string sensor, int degrees)
    {
        Sensor = sensor;
        Degrees = degrees;
    }

    public string Sensor { get; }

    public int Degrees { get; }
}

public static class Equality
{
    /// <summary>Do these two records hold the same data? Ask them.</summary>
    public static bool SameReading(Reading a, Reading b)
    {
        return a == b;
    }

    /// <summary>
    /// Do these two class instances hold the same data? The class does not
    /// answer that question for you, so compare the values yourself.
    /// </summary>
    public static bool SameLegacyData(ReadingClass a, ReadingClass b)
    {
        return a.Sensor == b.Sensor && a.Degrees == b.Degrees;
    }

    /// <summary>
    /// What does the CLASS's own Equals say about the same two instances?
    /// Just ask it and hand back the answer, whatever it is.
    /// </summary>
    public static bool ClassEqualsSays(ReadingClass a, ReadingClass b)
    {
        return a.Equals(b);
    }

    /// <summary>The record's own ToString, unchanged.</summary>
    public static string Describe(Reading reading)
    {
        return reading.ToString();
    }
}
