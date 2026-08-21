// 13_async_await / ex4 - fix this code: .Result, and where async exceptions live.
// See lessons/13_async_await/README.md, "Exercise 4".

namespace CSharpDojo.L13_AsyncAwait;

public static class Faults
{
    /// <summary>
    /// Hand back the work's result. When the work failed, the caller must see
    /// the ORIGINAL exception - not an AggregateException wrapped round it.
    /// </summary>
    public static async Task<int> RunAsync(Task<int> work)
    {
        return await work;
    }

    /// <summary>
    /// Always fails, with an InvalidOperationException whose message is "boom".
    /// The failure must arrive in the returned TASK, not be thrown at the
    /// caller before they ever get one.
    /// </summary>
    public static async Task<int> AlwaysFailsAsync()
    {
        await Task.Yield();
        throw new InvalidOperationException("boom");
    }
}
