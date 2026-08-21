// i2_interview_drills / ex5 - fix the async code. Time-box: 10 minutes.
// See lessons/i2_interview_drills/README.md, "Exercise 5".

namespace CSharpDojo.I2_InterviewDrills;

public static class Pages
{
    /// <summary>
    /// The total of every page's count.
    ///
    /// The version a colleague wrote had three bugs: it blocked on .Result, it
    /// ignored the cancellation token, and it caught every exception and
    /// returned 0. Yours must do none of those.
    ///
    /// An already-cancelled token means do no work at all.
    /// </summary>
    public static async Task<int> TotalAsync(IReadOnlyList<Task<int>> pages, CancellationToken token)
    {
        token.ThrowIfCancellationRequested();

        int[] counts = await Task.WhenAll(pages).WaitAsync(token);
        return counts.Sum();
    }
}
