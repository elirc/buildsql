// d17_events / ex6 - one bad handler must not silence the rest.
// See lessons/d17_events/README.md, "Exercise 6".

namespace CSharpDojo.D17_Events;

public class Broadcaster
{
    /// <summary>Raised by both broadcast methods below.</summary>
    public event Action<string>? Message;

    /// <summary>
    /// Written for you, and deliberately wrong: the ordinary raise. The
    /// combined delegate calls its handlers in turn and the first one that
    /// throws ends the whole thing, so any handler after it never runs.
    /// </summary>
    public void BroadcastNaive(string text)
    {
        Message?.Invoke(text);
    }

    /// <summary>
    /// Calls EVERY handler, even when some of them throw, and returns the
    /// exceptions in the order they happened. An empty list means all the
    /// handlers were happy.
    /// </summary>
    public List<Exception> Broadcast(string text)
    {
        List<Exception> failures = new List<Exception>();
        Action<string>? handlers = Message;
        if (handlers is null)
        {
            return failures;
        }

        foreach (Delegate entry in handlers.GetInvocationList())
        {
            try
            {
                ((Action<string>)entry)(text);
            }
            catch (Exception ex)
            {
                failures.Add(ex);
            }
        }

        return failures;
    }
}
