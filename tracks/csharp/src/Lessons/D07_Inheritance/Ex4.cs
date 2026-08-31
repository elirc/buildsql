// d07_inheritance / ex4 - sealed override, and the only door it leaves open.
// See lessons/d07_inheritance/README.md, "Exercise 4".

namespace CSharpDojo.D07_Inheritance;

public class Signal
{
    /// <summary>"signal".</summary>
    public virtual string Kind =>
        throw new NotImplementedException("ex4: Signal.Kind is not implemented yet - edit this file.");
}

public class Beacon : Signal
{
    /// <summary>
    /// "beacon" - and SEALED, so no further class may override it. Use the
    /// `sealed override` modifiers.
    /// </summary>
    public override string Kind =>
        throw new NotImplementedException("ex4: Beacon.Kind is not implemented yet - edit this file.");
}

public class Strobe : Beacon
{
    /// <summary>
    /// "strobe". Kind is sealed above, so this cannot be an override - it has
    /// to HIDE the inherited member with the `new` modifier, which means it is
    /// only visible through a Strobe-typed reference.
    /// </summary>
    public string Kind =>
        throw new NotImplementedException("ex4: Strobe.Kind is not implemented yet - edit this file.");
}

public static class Signals
{
    /// <summary>Reads Kind through a Signal-typed reference.</summary>
    public static string KindOf(Signal signal)
    {
        throw new NotImplementedException("ex4: KindOf is not implemented yet - edit this file.");
    }
}
