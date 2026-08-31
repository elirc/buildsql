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
    public override string Format(string message)
    {
        throw new NotImplementedException("ex2: TimestampLogger.Format is not implemented yet - edit this file.");
    }
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
    public override string Format(string message)
    {
        throw new NotImplementedException("ex2: ShoutingLogger.Format is not implemented yet - edit this file.");
    }
}
