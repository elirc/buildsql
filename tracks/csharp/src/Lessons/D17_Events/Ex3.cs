// d17_events / ex3 - multicast: several subscribers on one event.
// See lessons/d17_events/README.md, "Exercise 3".

namespace CSharpDojo.D17_Events;

public class Bell
{
    /// <summary>Raised by Ring, once per subscriber.</summary>
    public event Action<string>? Rung;

    /// <summary>Written for you: how many handlers are on the list right now.</summary>
    public int SubscriberCount => Rung?.GetInvocationList().Length ?? 0;

    /// <summary>Raises Rung with the note. Does nothing when nobody is listening.</summary>
    public void Ring(string note)
    {
        throw new NotImplementedException("ex3: Ring is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Removes every subscriber at once - something only code inside this
    /// class is allowed to do.
    /// </summary>
    public void Silence()
    {
        throw new NotImplementedException("ex3: Silence is not implemented yet - edit this file.");
    }
}
