// i3_interview_rapidfire / ex4 - async, cold. 5 minutes.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 4".

namespace CSharpDojo.I3_InterviewRapidfire;

public static class AsyncRapid
{
    /// <summary>
    /// How many of the tasks finished successfully. Wait for ALL of them, and
    /// do not throw however many of them failed.
    /// </summary>
    public static async Task<int> CountSucceededAsync(IReadOnlyList<Task<int>> tasks)
    {
        try
        {
            await Task.WhenAll(tasks);
        }
        catch
        {
            // Every task has finished either way; the outcomes are on the tasks.
        }

        return tasks.Count(task => task.IsCompletedSuccessfully);
    }

    /// <summary>
    /// The total of the successful ones only. Same rule: wait for everything,
    /// throw nothing.
    /// </summary>
    public static async Task<int> TotalOfSucceededAsync(IReadOnlyList<Task<int>> tasks)
    {
        try
        {
            await Task.WhenAll(tasks);
        }
        catch
        {
            // Same again: WhenAll only rethrows the first failure.
        }

        return tasks.Where(task => task.IsCompletedSuccessfully).Sum(task => task.Result);
    }
}
