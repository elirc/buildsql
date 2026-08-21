// 13_async_await / ex3 - cancellation is cooperative, and it is a parameter.
// See lessons/13_async_await/README.md, "Exercise 3".

namespace CSharpDojo.L13_AsyncAwait;

public static class Cancellable
{
    /// <summary>
    /// The work's result - unless the token is cancelled first, in which case
    /// stop waiting and let an OperationCanceledException out.
    /// </summary>
    public static async Task<int> WaitOrCancelAsync(Task<int> work, CancellationToken token)
    {
        throw new NotImplementedException("ex3: WaitOrCancelAsync is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Add up the results, checking the token before each task so that an
    /// already-cancelled request does no work at all. Returns the running total.
    /// </summary>
    public static async Task<int> SumUntilCancelledAsync(IEnumerable<Task<int>> tasks, CancellationToken token)
    {
        throw new NotImplementedException("ex3: SumUntilCancelledAsync is not implemented yet - edit this file.");
    }
}
