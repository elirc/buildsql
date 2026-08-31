// d17_events / ex8 - a typed event bus built out of delegates.
// See lessons/d17_events/README.md, "Exercise 8".

namespace CSharpDojo.D17_Events;

public class EventBus
{
    // Written for you: one handler list per message type.
    private readonly Dictionary<Type, List<Delegate>> _handlers =
        new Dictionary<Type, List<Delegate>>();

    /// <summary>Written for you: how many message types have ever been subscribed to.</summary>
    public int TypeCount => _handlers.Count;

    /// <summary>Registers a handler for messages of type T.</summary>
    public void Subscribe<T>(Action<T> handler)
    {
        throw new NotImplementedException("ex8: Subscribe is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Removes one registration of that handler. True when something was
    /// removed, false when it was never subscribed.
    /// </summary>
    public bool Unsubscribe<T>(Action<T> handler)
    {
        throw new NotImplementedException("ex8: Unsubscribe is not implemented yet - edit this file.");
    }

    /// <summary>How many handlers are registered for T.</summary>
    public int SubscriberCount<T>()
    {
        throw new NotImplementedException("ex8: SubscriberCount is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Delivers the message to every handler for its type, in registration
    /// order, and returns how many ran. A type nobody subscribed to is not an
    /// error - it delivers to nobody. Handlers that subscribe or unsubscribe
    /// while the message is being delivered do not change this delivery.
    /// </summary>
    public int Publish<T>(T message)
    {
        throw new NotImplementedException("ex8: Publish is not implemented yet - edit this file.");
    }
}
