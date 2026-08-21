// 02_control_flow_methods / ex2 - out parameters and params arrays.
// See lessons/02_control_flow_methods/README.md, "Exercise 2".

namespace CSharpDojo.L02_ControlFlowMethods;

public static class Stats
{
    /// <summary>
    /// Hand back the smallest and largest of <paramref name="values"/> through
    /// the out parameters and return true. For an empty array, set both to 0
    /// and return false - do not throw.
    /// </summary>
    public static bool TryMinMax(int[] values, out int min, out int max)
    {
        min = 0;
        max = 0;
        if (values.Length == 0)
        {
            return false;
        }

        min = values[0];
        max = values[0];
        foreach (int value in values)
        {
            if (value < min)
            {
                min = value;
            }

            if (value > max)
            {
                max = value;
            }
        }

        return true;
    }

    /// <summary>
    /// Add up however many numbers the caller passes - Sum(), Sum(1),
    /// Sum(1, 2, 3) must all work. Do not change the signature.
    /// </summary>
    public static int Sum(params int[] numbers)
    {
        int total = 0;
        foreach (int number in numbers)
        {
            total += number;
        }

        return total;
    }
}
