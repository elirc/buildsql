// d07_inheritance / ex4 - sealed override, and the only door it leaves open.
// See lessons/d07_inheritance/README.md, "Exercise 4".

namespace CSharpDojo.D07_Inheritance;

public class Signal
{
    /// <summary>"signal".</summary>
    public virtual string Kind => "signal";
}

public class Beacon : Signal
{
    /// <summary>
    /// "beacon" - and SEALED, so no further class may override it. Use the
    /// `sealed override` modifiers.
    /// </summary>
    public sealed override string Kind => "beacon";
}

public class Strobe : Beacon
{
    /// <summary>
    /// "strobe". Kind is sealed above, so this cannot be an override - it has
    /// to HIDE the inherited member with the `new` modifier, which means it is
    /// only visible through a Strobe-typed reference.
    /// </summary>
    public new string Kind => "strobe";
}

public static class Signals
{
    /// <summary>Reads Kind through a Signal-typed reference.</summary>
    public static string KindOf(Signal signal) => signal.Kind;
}
