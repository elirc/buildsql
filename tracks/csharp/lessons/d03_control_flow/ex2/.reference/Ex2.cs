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
    public static string SeasonOf(int month) => month switch
    {
        12 or 1 or 2 => "winter",
        >= 3 and <= 5 => "spring",
        >= 6 and <= 8 => "summer",
        >= 9 and <= 11 => "autumn",
        _ => throw new ArgumentOutOfRangeException(nameof(month), "Months run from 1 to 12."),
    };

    /// <summary>
    /// The ticket band for an age: 0-4 "free", 5-17 "child", 18-64 "adult",
    /// 65 and over "senior". A negative age throws ArgumentOutOfRangeException.
    /// </summary>
    public static string Ticket(int age) => age switch
    {
        < 0 => throw new ArgumentOutOfRangeException(nameof(age), "An age cannot be negative."),
        < 5 => "free",
        < 18 => "child",
        < 65 => "adult",
        _ => "senior",
    };
}
