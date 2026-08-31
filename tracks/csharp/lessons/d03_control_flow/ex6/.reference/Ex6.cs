// d03_control_flow / ex6 - nested loops.
// See lessons/d03_control_flow/README.md, "Exercise 6".

using System.Text;

namespace CSharpDojo.D03_ControlFlow;

public static class Grid
{
    /// <summary>
    /// A left-aligned triangle of "#": row i has i hashes, rows separated by
    /// "\n", no trailing newline. A height of 0 or less gives "".
    /// </summary>
    public static string Triangle(int height)
    {
        StringBuilder art = new StringBuilder();
        for (int row = 1; row <= height; row++)
        {
            if (row > 1)
            {
                art.Append('\n');
            }

            for (int column = 0; column < row; column++)
            {
                art.Append('#');
            }
        }

        return art.ToString();
    }

    /// <summary>
    /// How many pairs of DIFFERENT positions (i &lt; j) hold values adding up
    /// to target. Equal values at different positions count separately.
    /// </summary>
    public static int CountPairs(int[] values, int target)
    {
        int pairs = 0;
        for (int i = 0; i < values.Length; i++)
        {
            for (int j = i + 1; j < values.Length; j++)
            {
                if (values[i] + values[j] == target)
                {
                    pairs++;
                }
            }
        }

        return pairs;
    }
}
