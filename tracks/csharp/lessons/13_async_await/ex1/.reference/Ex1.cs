// 13_async_await / ex1 - awaiting, and waiting for two things at once.
// See lessons/13_async_await/README.md, "Exercise 1".

namespace CSharpDojo.L13_AsyncAwait;

public static class Awaiting
{
    /// <summary>
    /// The two results added together. Both tasks are already running when you
    /// are handed them - your job is to wait for both and combine them.
    /// </summary>
    public static async Task<int> SumAsync(Task<int> first, Task<int> second)
    {
        int[] results = await Task.WhenAll(first, second);
        return results[0] + results[1];
    }

    /// <summary>
    /// "one+two" - the two results in the order the PARAMETERS are in, however
    /// the tasks actually finish.
    /// </summary>
    public static async Task<string> InOrderAsync(Task<string> first, Task<string> second)
    {
        await Task.WhenAll(first, second);
        return $"{first.Result}+{second.Result}";
    }
}
