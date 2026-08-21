// 09_delegates_events_lambdas / ex2 - closures: what a lambda captures, and when.
// See lessons/09_delegates_events_lambdas/README.md, "Exercise 2".

namespace CSharpDojo.L09_DelegatesEventsLambdas;

public static class Closures
{
    /// <summary>
    /// A counter with no class behind it: the returned function hands back
    /// 1, then 2, then 3... The state lives in a local variable that the
    /// lambda captured.
    /// </summary>
    public static Func<int> MakeCounter()
    {
        int count = 0;
        return () => ++count;
    }

    /// <summary>
    /// Build three functions inside a plain `for (int i = 0; i &lt; 3; i++)`
    /// loop, each one `() =&gt; i`. Write it the obvious way and let the gate
    /// tell you what they return - do NOT copy i into a local first.
    /// </summary>
    public static List<Func<int>> FromForLoop()
    {
        List<Func<int>> functions = new List<Func<int>>();
        for (int i = 0; i < 3; i++)
        {
            functions.Add(() => i);
        }

        return functions;
    }

    /// <summary>
    /// The same three functions, built by a `foreach` over new[] { 0, 1, 2 },
    /// each one returning the loop variable.
    /// </summary>
    public static List<Func<int>> FromForeachLoop()
    {
        List<Func<int>> functions = new List<Func<int>>();
        foreach (int i in new[] { 0, 1, 2 })
        {
            functions.Add(() => i);
        }

        return functions;
    }
}
