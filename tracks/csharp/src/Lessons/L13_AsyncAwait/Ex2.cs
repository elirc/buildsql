// 13_async_await / ex2 - WhenAll over many tasks, and what order the results come back in.
// See lessons/13_async_await/README.md, "Exercise 2".

namespace CSharpDojo.L13_AsyncAwait;

public static class Fanout
{
    /// <summary>The total of every task's result, waiting for all of them.</summary>
    public static async Task<int> SumAllAsync(IEnumerable<Task<int>> tasks)
    {
        throw new NotImplementedException("ex2: SumAllAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The results joined with ", " - in the order the tasks were GIVEN to you,
    /// not the order they happened to finish in.
    /// </summary>
    public static async Task<string> JoinAsync(IEnumerable<Task<string>> tasks)
    {
        throw new NotImplementedException("ex2: JoinAsync is not implemented yet - edit this file.");
    }
}
