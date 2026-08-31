// d03_control_flow / ex2 - switch expressions with or-patterns and ranges.
// See lessons/d03_control_flow/README.md, "Exercise 2".

namespace CSharpDojo.D03_ControlFlow;

public static class Switches
{
    /// <summary>
    /// The season a month number falls in: 12, 1, 2 are "winter", 3-5
    /// "spring", 6-8 "summer", 9-11 "autumn". Anything outside 1-12 throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static string SeasonOf(int month)
    {
        throw new NotImplementedException("ex2: SeasonOf is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The ticket band for an age: 0-4 "free", 5-17 "child", 18-64 "adult",
    /// 65 and over "senior". A negative age throws ArgumentOutOfRangeException.
    /// </summary>
    public static string Ticket(int age)
    {
        throw new NotImplementedException("ex2: Ticket is not implemented yet - edit this file.");
    }
}
