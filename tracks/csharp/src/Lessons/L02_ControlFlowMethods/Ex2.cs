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
        throw new NotImplementedException("ex2: TryMinMax is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Add up however many numbers the caller passes - Sum(), Sum(1),
    /// Sum(1, 2, 3) must all work. Do not change the signature.
    /// </summary>
    public static int Sum(params int[] numbers)
    {
        throw new NotImplementedException("ex2: Sum is not implemented yet - edit this file.");
    }
}
