// 09_delegates_events_lambdas / ex1 - Func and Action: behaviour as an argument.
// See lessons/09_delegates_events_lambdas/README.md, "Exercise 1".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public static class Behaviours
{
    /// <summary>
    /// Every item, put through <paramref name="transform"/>, in order.
    /// The method decides WHEN to call it; the caller decides WHAT it does.
    /// </summary>
    public static List<T> Apply<T>(IEnumerable<T> items, Func<T, T> transform)
    {
        throw new NotImplementedException("ex1: Apply is not implemented yet - edit this file.");
    }

    /// <summary>How many items the predicate says yes to.</summary>
    public static int CountWhere<T>(IEnumerable<T> items, Func<T, bool> predicate)
    {
        throw new NotImplementedException("ex1: CountWhere is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Call <paramref name="action"/> once for each number from 1 to
    /// <paramref name="times"/>, in order. An Action returns nothing: it is
    /// called for its effect.
    /// </summary>
    public static void Repeat(int times, Action<int> action)
    {
        throw new NotImplementedException("ex1: Repeat is not implemented yet - edit this file.");
    }
}
