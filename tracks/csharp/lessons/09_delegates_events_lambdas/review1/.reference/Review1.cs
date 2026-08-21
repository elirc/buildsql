// 09_delegates_events_lambdas / review1 - captured state, and a function that returns a function.
// See lessons/09_delegates_events_lambdas/README.md, "Review".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public static class Accumulators
{
    /// <summary>
    /// A running total: the returned function adds its argument to what it has
    /// seen so far and hands back the new total. Two separate adders keep two
    /// separate totals.
    /// </summary>
    public static Func<int, int> MakeAdder()
    {
        int total = 0;
        return amount =>
        {
            total += amount;
            return total;
        };
    }

    /// <summary>
    /// The opposite of the predicate you were given: true where it says false.
    /// </summary>
    public static Func<T, bool> Not<T>(Func<T, bool> predicate)
    {
        return value => !predicate(value);
    }
}
