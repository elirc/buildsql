// 03_classes_objects / ex3 - static state versus instance state.
// See lessons/03_classes_objects/README.md, "Exercise 3".

namespace CSharpDojo.L03_ClassesObjects;

public class Robot
{
    /// <summary>How many Robots have been built since the last Reset.</summary>
    public static int Built { get; private set; }

    /// <summary>1 for the first robot built, 2 for the second, and so on.</summary>
    public int Serial { get; }

    public Robot()
    {
        Built++;
        Serial = Built;
    }

    /// <summary>Put the counter back to zero. Existing robots keep their serials.</summary>
    public static void Reset()
    {
        Built = 0;
    }
}
