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
        throw new NotImplementedException("ex5: ByKey is not implemented yet - edit this file.");
    }

    /// <summary>The same ordering, upside down.</summary>
    public static Comparison<T> Reversed<T>(Comparison<T> inner)
    {
        throw new NotImplementedException("ex5: Reversed is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Orders by <paramref name="first"/>, letting <paramref name="second"/>
    /// break the ties (when first answers 0).
    /// </summary>
    public static Comparison<T> Then<T>(Comparison<T> first, Comparison<T> second)
    {
        throw new NotImplementedException("ex5: Then is not implemented yet - edit this file.");
    }
}
