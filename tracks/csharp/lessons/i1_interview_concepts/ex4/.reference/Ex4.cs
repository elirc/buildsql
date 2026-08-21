// i1_interview_concepts / ex4 - fix the async bugs.
// See lessons/i1_interview_concepts/README.md, "Exercise 4".

namespace CSharpDojo.I1_InterviewConcepts;

public static class AsyncFixes
{
    /// <summary>
    /// Hand back the work's result.
    ///
    /// The version to avoid is `return work.Result;` - it blocks the calling
    /// thread, and any failure arrives wrapped in an AggregateException. The
    /// caller must see the original exception.
    /// </summary>
    public static async Task<int> LoadAsync(Task<int> work)
    {
        return await work;
    }

    /// <summary>
    /// Wait for the work, then add "done" to the log.
    ///
    /// The version to avoid is `async void` - nobody can await it and nobody
    /// can catch what it throws. This one returns a Task, so a failure in the
    /// work must reach whoever awaits it.
    /// </summary>
    public static async Task RecordAsync(Task work, List<string> log)
    {
        await work;
        log.Add("done");
    }
}
