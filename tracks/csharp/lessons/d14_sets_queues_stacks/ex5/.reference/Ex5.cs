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
    private readonly int _limit;
    private readonly int _windowSeconds;
    private readonly Queue<int> _granted = new Queue<int>();

    public RateLimiter(int limit, int windowSeconds)
    {
        _limit = limit;
        _windowSeconds = windowSeconds;
    }

    /// <summary>How many granted requests are still inside the window.</summary>
    public int InWindow
    {
        get { return _granted.Count; }
    }

    /// <summary>
    /// Asks to make a request at time <paramref name="second"/>. Expired
    /// allowances fall off the FRONT of the queue first; then the request is
    /// granted (and remembered) only when fewer than the limit remain.
    /// </summary>
    public bool Allow(int second)
    {
        while (_granted.Count > 0 && _granted.Peek() <= second - _windowSeconds)
        {
            _granted.Dequeue();
        }

        if (_granted.Count >= _limit)
        {
            return false;
        }

        _granted.Enqueue(second);
        return true;
    }
}
