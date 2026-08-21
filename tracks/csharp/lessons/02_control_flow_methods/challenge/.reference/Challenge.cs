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
        long current = start;
        int count = 0;
        while (current != 1)
        {
            current = current % 2 == 0 ? current / 2 : (3 * current) + 1;
            count++;
        }

        return count;
    }

    /// <summary>
    /// Of the starting numbers 1..limit-1, which one takes the most steps?
    /// Return that number and hand its step count back through
    /// <paramref name="steps"/>. On a tie the smaller starting number wins.
    /// </summary>
    public static int LongestUnder(int limit, out int steps)
    {
        int bestStart = 1;
        int bestSteps = 0;
        for (int start = 1; start < limit; start++)
        {
            int count = Steps(start);
            if (count > bestSteps)
            {
                bestStart = start;
                bestSteps = count;
            }
        }

        steps = bestSteps;
        return bestStart;
    }
}
