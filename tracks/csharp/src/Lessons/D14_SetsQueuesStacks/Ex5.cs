// d14_sets_queues_stacks / ex5 - a sliding window is a queue.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 5".

namespace CSharpDojo.D14_SetsQueuesStacks;

/// <summary>
/// Allows at most <c>limit</c> requests in any window of <c>windowSeconds</c>.
/// Request times arrive as non-decreasing whole seconds; an allowance made at
/// time t stops counting once the clock reaches t + windowSeconds.
/// </summary>
public class RateLimiter
{
    public RateLimiter(int limit, int windowSeconds)
    {
        throw new NotImplementedException("ex5: the RateLimiter constructor is not implemented yet - edit this file.");
    }

    /// <summary>How many granted requests are still inside the window.</summary>
    public int InWindow
    {
        get { throw new NotImplementedException("ex5: InWindow is not implemented yet - edit this file."); }
    }

    /// <summary>
    /// Asks to make a request at time <paramref name="second"/>. Expired
    /// allowances fall off the FRONT of the queue first; then the request is
    /// granted (and remembered) only when fewer than the limit remain.
    /// </summary>
    public bool Allow(int second)
    {
        throw new NotImplementedException("ex5: Allow is not implemented yet - edit this file.");
    }
}
