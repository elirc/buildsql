// d16_delegates_lambdas / ex5 - building comparisons out of comparisons.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 5".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Comparers
{
    /// <summary>
    /// A Comparison that orders by an int key, ascending: the key function is
    /// applied to both operands and the keys compared.
    /// </summary>
    public static Comparison<T> ByKey<T>(Func<T, int> key)
    {
        return (a, b) => key(a).CompareTo(key(b));
    }

    /// <summary>The same ordering, upside down.</summary>
    public static Comparison<T> Reversed<T>(Comparison<T> inner)
    {
        return (a, b) => inner(b, a);
    }

    /// <summary>
    /// Orders by <paramref name="first"/>, letting <paramref name="second"/>
    /// break the ties (when first answers 0).
    /// </summary>
    public static Comparison<T> Then<T>(Comparison<T> first, Comparison<T> second)
    {
        return (a, b) =>
        {
            int result = first(a, b);
            return result != 0 ? result : second(a, b);
        };
    }
}
