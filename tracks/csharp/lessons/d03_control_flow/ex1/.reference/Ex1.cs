// d03_control_flow / ex1 - two loops with a condition inside.
// See lessons/d03_control_flow/README.md, "Exercise 1".

namespace CSharpDojo.D03_ControlFlow;

public static class Loops
{
    /// <summary>
    /// The sum of every whole number from 1 up to but NOT including
    /// <paramref name="limit"/> that divides by <paramref name="a"/> or by
    /// <paramref name="b"/>. A number divisible by both is counted once.
    /// </summary>
    public static int SumOfMultiples(int limit, int a, int b)
    {
        int total = 0;
        for (int n = 1; n < limit; n++)
        {
            if (n % a == 0 || n % b == 0)
            {
                total += n;
            }
        }

        return total;
    }

    /// <summary>
    /// How many decimal digits the number has, ignoring its sign: 0 has one
    /// digit, -12345 has five, and int.MinValue has ten.
    /// </summary>
    public static int CountDigits(int value)
    {
        long remaining = Math.Abs((long)value);
        int digits = 1;
        while (remaining >= 10)
        {
            remaining /= 10;
            digits++;
        }

        return digits;
    }
}
