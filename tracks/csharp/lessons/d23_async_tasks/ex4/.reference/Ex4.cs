// d23_async_tasks / ex4 - the failures await does not show you.
// See lessons/d23_async_tasks/README.md, "Exercise 4".

namespace CSharpDojo.D23_AsyncTasks;

public static class Failures
{
    /// <summary>
    /// "ok:&lt;result&gt;" when the task succeeds, "failed:&lt;message&gt;"
    /// when it fails - and the message is the original exception's, not an
    /// AggregateException's.
    /// </summary>
    public static async Task<string> DescribeAsync(Task<string> task)
    {
        try
        {
            return $"ok:{await task}";
        }
        catch (Exception ex)
        {
            return $"failed:{ex.Message}";
        }
    }

    /// <summary>
    /// Waits for all of them and returns the messages of EVERY failure, in
    /// task order, comma-joined. An empty string when nothing failed. Awaiting
    /// Task.WhenAll rethrows only the first failure, so the rest have to be
    /// read off the tasks themselves.
    /// </summary>
    public static async Task<string> AllErrorsAsync(IEnumerable<Task<string>> tasks)
    {
        Task<string>[] all = tasks.ToArray();

        try
        {
            await Task.WhenAll(all);
        }
        catch (Exception)
        {
            // Every failure is on the tasks; the throw only reported one.
        }

        return string.Join(
            ",",
            all.Where(task => task.IsFaulted)
                .Select(task => task.Exception!.InnerException!.Message));
    }
}
