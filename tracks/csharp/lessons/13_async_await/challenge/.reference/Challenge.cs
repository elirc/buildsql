// 13_async_await / challenge - fan out, wait, and describe what happened.
// See lessons/13_async_await/README.md, "Challenge".

namespace CSharpDojo.L13_AsyncAwait;

public static class Pipeline
{
    /// <summary>
    /// Wait for every task and report:
    ///   all succeeded  -> "ok: &lt;total&gt;"
    ///   any faulted    -> "failed: &lt;exception type name&gt;" for the FIRST
    ///                     faulted task in list order
    ///   token cancelled while waiting -> do not report anything; let the
    ///                     OperationCanceledException out.
    /// </summary>
    public static async Task<string> SummariseAsync(IReadOnlyList<Task<int>> work, CancellationToken token)
    {
        try
        {
            int[] results = await Task.WhenAll(work).WaitAsync(token);
            return $"ok: {results.Sum()}";
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch
        {
            Task<int> faulted = work.First(task => task.IsFaulted);
            Exception cause = faulted.Exception!.InnerException!;
            return cause switch
            {
                TimeoutException => "failed: TimeoutException",
                _ => $"failed: {cause.GetType().Name}",
            };
        }
    }
}
