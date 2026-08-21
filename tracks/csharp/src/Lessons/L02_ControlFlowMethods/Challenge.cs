// 02_control_flow_methods / challenge - a while loop with an unknown trip count.
// See lessons/02_control_flow_methods/README.md, "Challenge".

namespace CSharpDojo.L02_ControlFlowMethods;

public static class Collatz
{
    /// <summary>
    /// How many steps it takes to reach 1: halve an even number, triple an odd
    /// one and add 1. Steps(1) is 0; Steps(6) is 8.
    /// </summary>
    public static int Steps(int start)
    {
        throw new NotImplementedException("challenge: Steps is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Of the starting numbers 1..limit-1, which one takes the most steps?
    /// Return that number and hand its step count back through
    /// <paramref name="steps"/>. On a tie the smaller starting number wins.
    /// </summary>
    public static int LongestUnder(int limit, out int steps)
    {
        throw new NotImplementedException("challenge: LongestUnder is not implemented yet - edit this file.");
    }
}
