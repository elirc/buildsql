// d23_async_tasks / ex1 - starting both before awaiting either.
// See lessons/d23_async_tasks/README.md, "Exercise 1".

namespace CSharpDojo.D23_AsyncTasks;

public static class Basics
{
    /// <summary>
    /// Starts BOTH operations and only then waits for them, returning
    /// "&lt;first&gt;+&lt;second&gt;" in parameter order. Awaiting the first
    /// call before making the second would make the two run one after the
    /// other.
    /// </summary>
    public static async Task<string> BothAsync(Func<Task<string>> first, Func<Task<string>> second)
    {
        Task<string> firstTask = first();
        Task<string> secondTask = second();

        string firstResult = await firstTask;
        string secondResult = await secondTask;

        return $"{firstResult}+{secondResult}";
    }

    /// <summary>
    /// A task that has already finished with that value, built without making
    /// this an async method at all.
    /// </summary>
    public static Task<string> Immediate(string value)
    {
        return Task.FromResult(value);
    }

    /// <summary>
    /// A task that has already FAILED with an InvalidOperationException
    /// carrying that message - returned, not thrown at the caller.
    /// </summary>
    public static Task<string> AlreadyFailed(string message)
    {
        return Task.FromException<string>(new InvalidOperationException(message));
    }
}
