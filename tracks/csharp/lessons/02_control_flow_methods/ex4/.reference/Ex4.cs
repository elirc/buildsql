// 02_control_flow_methods / ex4 - a switch expression with relational patterns.
// See lessons/02_control_flow_methods/README.md, "Exercise 4".

namespace CSharpDojo.L02_ControlFlowMethods;

public static class Grades
{
    /// <summary>
    /// 90+ is "A", 80+ "B", 70+ "C", 60+ "D", anything lower "F".
    /// A score outside 0..100 is not a grade: throw ArgumentOutOfRangeException.
    /// </summary>
    public static string Letter(int score)
    {
        if (score < 0 || score > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(score), score, "A score must be between 0 and 100.");
        }

        return score switch
        {
            >= 90 => "A",
            >= 80 => "B",
            >= 70 => "C",
            >= 60 => "D",
            _ => "F",
        };
    }
}
