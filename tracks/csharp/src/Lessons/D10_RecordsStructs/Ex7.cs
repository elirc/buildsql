// d10_records_structs / ex7 - a mutable struct behind an interface.
// See lessons/d10_records_structs/README.md, "Exercise 7".

namespace CSharpDojo.D10_RecordsStructs;

public interface ICounter
{
    int Value { get; }

    void Increment();
}

/// <summary>
/// A MUTABLE struct - the shape every style guide warns you about. Written this
/// way on purpose, so the four methods below can show you why.
/// </summary>
public struct MutableCounter : ICounter
{
    public int Value { get; private set; }

    /// <summary>Adds one to Value.</summary>
    public void Increment()
    {
        throw new NotImplementedException("ex7: Increment is not implemented yet - edit this file.");
    }
}

public static class Boxes
{
    /// <summary>
    /// A local MutableCounter, incremented twice, then read. Return its Value.
    /// </summary>
    public static int ViaLocal()
    {
        throw new NotImplementedException("ex7: ViaLocal is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Assign `new MutableCounter()` straight into an ICounter variable,
    /// increment it twice through that variable, and return its Value.
    /// </summary>
    public static int ViaInterface()
    {
        throw new NotImplementedException("ex7: ViaInterface is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Make a local MutableCounter, assign it to an ICounter variable,
    /// increment TWICE through the interface variable, and then return the
    /// LOCAL's Value.
    /// </summary>
    public static int ViaCopyThenReadOriginal()
    {
        throw new NotImplementedException("ex7: ViaCopyThenReadOriginal is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Make a MutableCounter[1], call Increment on element 0, and return
    /// element 0's Value.
    /// </summary>
    public static int ViaArrayElement()
    {
        throw new NotImplementedException("ex7: ViaArrayElement is not implemented yet - edit this file.");
    }
}
