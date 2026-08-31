// d17_events / ex4 - handing back a way to unsubscribe.
// See lessons/d17_events/README.md, "Exercise 4".

namespace CSharpDojo.D17_Events;

public class Feed
{
    private Action<string>? _handlers;

    /// <summary>Written for you: how many handlers are on the list right now.</summary>
    public int SubscriberCount => _handlers?.GetInvocationList().Length ?? 0;

    /// <summary>
    /// Adds a handler and returns the action that removes it again. The
    /// returned action is safe to call more than once - the second call does
    /// nothing rather than removing somebody else's handler.
    /// </summary>
    public Action Subscribe(Action<string> handler)
    {
        _handlers += handler;

        bool removed = false;
        return () =>
        {
            if (removed)
            {
                return;
            }

            removed = true;
            _handlers -= handler;
        };
    }

    /// <summary>Calls every current handler with the item, in subscription order.</summary>
    public void Publish(string item)
    {
        _handlers?.Invoke(item);
    }
}
