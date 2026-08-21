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
        throw new NotImplementedException("ex4: CountSucceededAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The total of the successful ones only. Same rule: wait for everything,
    /// throw nothing.
    /// </summary>
    public static async Task<int> TotalOfSucceededAsync(IReadOnlyList<Task<int>> tasks)
    {
        throw new NotImplementedException("ex4: TotalOfSucceededAsync is not implemented yet - edit this file.");
    }
}
