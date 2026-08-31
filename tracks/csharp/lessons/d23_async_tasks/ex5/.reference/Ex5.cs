// d23_async_tasks / ex5 - one step after another, without blocking.
// See lessons/d23_async_tasks/README.md, "Exercise 5".

namespace CSharpDojo.D23_AsyncTasks;

public static class Chaining
{
    /// <summary>
    /// Applies a plain function to whatever the task produces. The function
    /// must not run until the task has actually finished.
    /// </summary>
    public static async Task<TOut> MapAsync<TIn, TOut>(Task<TIn> task, Func<TIn, TOut> map)
    {
        return map(await task);
    }

    /// <summary>
    /// Runs a second asynchronous step on the first one's result. The second
    /// step is not started until the first has finished, and a failure in the
    /// first means the second never runs at all.
    /// </summary>
    public static async Task<TOut> ThenAsync<TIn, TOut>(Task<TIn> task, Func<TIn, Task<TOut>> next)
    {
        TIn value = await task;
        return await next(value);
    }
}
