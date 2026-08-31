// d23_async_tasks / ex6 - asking a task how it is doing.
// See lessons/d23_async_tasks/README.md, "Exercise 6".

namespace CSharpDojo.D23_AsyncTasks;

public static class States
{
    /// <summary>
    /// "pending", "ok", "cancelled" or "faulted:&lt;message&gt;" - without
    /// awaiting the task and without blocking on it. The message is the
    /// original exception's, not the AggregateException wrapper's.
    /// </summary>
    public static string Describe(Task task)
    {
        throw new NotImplementedException("ex6: Describe is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The task's result when it has already succeeded, and the fallback in
    /// every other case - including pending and failed. Never awaits, never
    /// blocks, never throws.
    /// </summary>
    public static string ResultOrFallback(Task<string> task, string fallback)
    {
        throw new NotImplementedException("ex6: ResultOrFallback is not implemented yet - edit this file.");
    }
}
