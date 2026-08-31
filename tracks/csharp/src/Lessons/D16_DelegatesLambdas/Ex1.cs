// d16_delegates_lambdas / ex1 - handing back behaviour.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 1".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Ops
{
    /// <summary>
    /// The named arithmetic operation as a value: "add", "sub" or "mul".
    /// Anything else throws ArgumentException.
    /// </summary>
    public static Func<int, int, int> ForName(string name)
    {
        throw new NotImplementedException("ex1: ForName is not implemented yet - edit this file.");
    }

    /// <summary>Applies <paramref name="transform"/> twice: transform(transform(x)).</summary>
    public static int Twice(Func<int, int> transform, int x)
    {
        throw new NotImplementedException("ex1: Twice is not implemented yet - edit this file.");
    }
}
