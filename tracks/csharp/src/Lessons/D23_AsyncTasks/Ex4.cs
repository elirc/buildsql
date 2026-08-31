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
        throw new NotImplementedException("ex4: DescribeAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Waits for all of them and returns the messages of EVERY failure, in
    /// task order, comma-joined. An empty string when nothing failed. Awaiting
    /// Task.WhenAll rethrows only the first failure, so the rest have to be
    /// read off the tasks themselves.
    /// </summary>
    public static async Task<string> AllErrorsAsync(IEnumerable<Task<string>> tasks)
    {
        throw new NotImplementedException("ex4: AllErrorsAsync is not implemented yet - edit this file.");
    }
}
