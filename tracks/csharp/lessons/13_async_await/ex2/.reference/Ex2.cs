// 13_async_await / ex2 - WhenAll over many tasks, and what order the results come back in.
// See lessons/13_async_await/README.md, "Exercise 2".

namespace CSharpDojo.L13_AsyncAwait;

public static class Fanout
{
    /// <summary>The total of every task's result, waiting for all of them.</summary>
    public static async Task<int> SumAllAsync(IEnumerable<Task<int>> tasks)
    {
        int[] results = await Task.WhenAll(tasks);
        return results.Sum();
    }

    /// <summary>
    /// The results joined with ", " - in the order the tasks were GIVEN to you,
    /// not the order they happened to finish in.
    /// </summary>
    public static async Task<string> JoinAsync(IEnumerable<Task<string>> tasks)
    {
        string[] results = await Task.WhenAll(tasks);
        return string.Join(", ", results);
    }
}
