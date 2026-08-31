// d17_events / ex1 - declaring an event and raising it safely.
// See lessons/d17_events/README.md, "Exercise 1".

namespace CSharpDojo.D17_Events;

public class Kettle
{
    private int _celsius;

    /// <summary>Raised once, when the water first reaches 100 degrees.</summary>
    public event EventHandler? Boiled;

    /// <summary>Written for you: true while anybody is listening.</summary>
    public bool HasListeners => Boiled is not null;

    public int Celsius => _celsius;

    /// <summary>
    /// Adds <paramref name="degrees"/> to the temperature. If that takes the
    /// kettle from below 100 to 100 or above, Boiled is raised with this
    /// kettle as the sender and EventArgs.Empty. Heating an already-boiling
    /// kettle raises nothing.
    /// </summary>
    public void Heat(int degrees)
    {
        throw new NotImplementedException("ex1: Heat is not implemented yet - edit this file.");
    }
}
