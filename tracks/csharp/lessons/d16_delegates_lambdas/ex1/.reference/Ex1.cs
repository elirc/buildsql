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
        return name switch
        {
            "add" => (a, b) => a + b,
            "sub" => (a, b) => a - b,
            "mul" => (a, b) => a * b,
            _ => throw new ArgumentException($"unknown operation: {name}", nameof(name)),
        };
    }

    /// <summary>Applies <paramref name="transform"/> twice: transform(transform(x)).</summary>
    public static int Twice(Func<int, int> transform, int x)
    {
        return transform(transform(x));
    }
}
