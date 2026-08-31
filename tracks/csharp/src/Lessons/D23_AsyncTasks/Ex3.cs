// d23_async_tasks / ex3 - whoever gets there first.
// See lessons/d23_async_tasks/README.md, "Exercise 3".

namespace CSharpDojo.D23_AsyncTasks;

public static class Racing
{
    /// <summary>
    /// The result of whichever task finishes first. The other one is left
    /// exactly as it was - not awaited, not cancelled, not touched.
    /// </summary>
    public static async Task<string> FirstAsync(Task<string> first, Task<string> second)
    {
        throw new NotImplementedException("ex3: FirstAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "first" or "second", naming which of the two finished first.
    /// </summary>
    public static async Task<string> WinnerAsync(Task<string> first, Task<string> second)
    {
        throw new NotImplementedException("ex3: WinnerAsync is not implemented yet - edit this file.");
    }
}
