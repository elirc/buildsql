// d17_events / ex5 - writing the add and remove accessors yourself.
// See lessons/d17_events/README.md, "Exercise 5".

namespace CSharpDojo.D17_Events;

public class Room
{
    private EventHandler? _entered;

    /// <summary>Written for you: true while anybody is listening.</summary>
    public bool HasListeners => _entered is not null;

    /// <summary>
    /// The same event any other class would declare, with the accessors
    /// spelled out so the counters can be kept up to date.
    /// </summary>
    public event EventHandler Entered
    {
        add
        {
            _entered += value;
            Subscribers = CurrentCount();
            if (Subscribers > PeakSubscribers)
            {
                PeakSubscribers = Subscribers;
            }
        }
        remove
        {
            _entered -= value;
            Subscribers = CurrentCount();
        }
    }

    /// <summary>How many handlers are subscribed right now.</summary>
    public int Subscribers { get; private set; }

    /// <summary>The largest value Subscribers has ever held.</summary>
    public int PeakSubscribers { get; private set; }

    /// <summary>Raises Entered with this room as the sender.</summary>
    public void Enter()
    {
        _entered?.Invoke(this, EventArgs.Empty);
    }

    private int CurrentCount()
    {
        return _entered?.GetInvocationList().Length ?? 0;
    }
}
