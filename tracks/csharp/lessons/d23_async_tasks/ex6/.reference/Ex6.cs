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
        if (!task.IsCompleted)
        {
            return "pending";
        }

        if (task.IsCanceled)
        {
            return "cancelled";
        }

        if (task.IsFaulted)
        {
            return $"faulted:{task.Exception!.InnerException!.Message}";
        }

        return "ok";
    }

    /// <summary>
    /// The task's result when it has already succeeded, and the fallback in
    /// every other case - including pending and failed. Never awaits, never
    /// blocks, never throws.
    /// </summary>
    public static string ResultOrFallback(Task<string> task, string fallback)
    {
        return task.IsCompletedSuccessfully ? task.Result : fallback;
    }
}
