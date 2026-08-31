// d07_inheritance / ex2 - override, and then call base anyway.
// See lessons/d07_inheritance/README.md, "Exercise 2".

namespace CSharpDojo.D07_Inheritance;

public class Logger
{
    /// <summary>The plain version: the message, unchanged.</summary>
    public virtual string Format(string message) => message;
}

public class TimestampLogger : Logger
{
    public TimestampLogger(string stamp)
    {
        Stamp = stamp;
    }

    public string Stamp { get; }

    /// <summary>
    /// "[stamp] " followed by whatever the BASE version produced - call
    /// base.Format rather than repeating it.
    /// </summary>
    public override string Format(string message) => $"[{Stamp}] " + base.Format(message);
}

public class ShoutingLogger : TimestampLogger
{
    public ShoutingLogger(string stamp)
        : base(stamp)
    {
    }

    /// <summary>
    /// Whatever the base version produced, upper-cased with the invariant
    /// culture.
    /// </summary>
    public override string Format(string message) => base.Format(message).ToUpperInvariant();
}
