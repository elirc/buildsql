// d04_methods_params / ex6 - small methods that call each other.
// See lessons/d04_methods_params/README.md, "Exercise 6".

namespace CSharpDojo.D04_MethodsParams;

public static class Math2
{
    /// <summary>
    /// The greatest common divisor of the two values, ignoring their signs.
    /// Gcd(0, n) is n and Gcd(0, 0) is 0.
    /// </summary>
    public static int Gcd(int a, int b)
    {
        long x = Math.Abs((long)a);
        long y = Math.Abs((long)b);
        while (y != 0)
        {
            (x, y) = (y, x % y);
        }

        return (int)x;
    }

    /// <summary>
    /// The least common multiple, always non-negative. Lcm with a zero is 0.
    /// Build it from Gcd, and divide before you multiply.
    /// </summary>
    public static int Lcm(int a, int b)
    {
        if (a == 0 || b == 0)
        {
            return 0;
        }

        long product = Math.Abs((long)a) / Gcd(a, b) * Math.Abs((long)b);
        return (int)product;
    }

    /// <summary>
    /// baseValue raised to a non-negative exponent, computed recursively.
    /// An exponent of 0 gives 1; a negative exponent throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static int PowerOf(int baseValue, int exponent)
    {
        if (exponent < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(exponent), "This method only does whole powers.");
        }

        return exponent == 0 ? 1 : baseValue * PowerOf(baseValue, exponent - 1);
    }
}
