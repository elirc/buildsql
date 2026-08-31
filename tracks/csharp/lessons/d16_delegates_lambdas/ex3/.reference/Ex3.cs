// d16_delegates_lambdas / ex3 - factories: closing over a parameter.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 3".

namespace CSharpDojo.D16_DelegatesLambdas;

public static class Factories
{
    /// <summary>
    /// A function that applies a fixed discount rate: MakeDiscounter(0.25m)
    /// turns 100 into 75. The rate is captured, not stored anywhere else.
    /// </summary>
    public static Func<decimal, decimal> MakeDiscounter(decimal rate)
    {
        return price => price * (1m - rate);
    }

    /// <summary>
    /// A function that puts a fixed tag in front: MakeTagger("urgent") turns
    /// "reboot" into "[urgent] reboot".
    /// </summary>
    public static Func<string, string> MakeTagger(string tag)
    {
        return message => $"[{tag}] {message}";
    }
}
