// d23_async_tasks / ex7 - the first one that actually works.
// See lessons/d23_async_tasks/README.md, "Exercise 7".

namespace CSharpDojo.D23_AsyncTasks;

public static class Preference
{
    /// <summary>
    /// The result of the first task to finish SUCCESSFULLY. Tasks that fail
    /// are ignored and the wait carries on. When every task has failed, throws
    /// an AggregateException holding all of their exceptions in task order. An
    /// empty sequence is an ArgumentException.
    /// </summary>
    public static async Task<T> FirstSuccessfulAsync<T>(IEnumerable<Task<T>> tasks)
    {
        List<Task<T>> all = tasks.ToList();
        if (all.Count == 0)
        {
            throw new ArgumentException("at least one task is required", nameof(tasks));
        }

        List<Task<T>> pending = new List<Task<T>>(all);

        while (pending.Count > 0)
        {
            Task<T> finished = await Task.WhenAny(pending);
            pending.Remove(finished);

            if (finished.Status == TaskStatus.RanToCompletion)
            {
                return await finished;
            }
        }

        throw new AggregateException(all.Select(task => task.Exception!.InnerException!));
    }
}
