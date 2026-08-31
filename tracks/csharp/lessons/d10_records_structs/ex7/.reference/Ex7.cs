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
        Value++;
    }
}

public static class Boxes
{
    /// <summary>
    /// A local MutableCounter, incremented twice, then read. Return its Value.
    /// </summary>
    public static int ViaLocal()
    {
        MutableCounter counter = new MutableCounter();
        counter.Increment();
        counter.Increment();
        return counter.Value;
    }

    /// <summary>
    /// Assign `new MutableCounter()` straight into an ICounter variable,
    /// increment it twice through that variable, and return its Value.
    /// </summary>
    public static int ViaInterface()
    {
        ICounter boxed = new MutableCounter();
        boxed.Increment();
        boxed.Increment();
        return boxed.Value;
    }

    /// <summary>
    /// Make a local MutableCounter, assign it to an ICounter variable,
    /// increment TWICE through the interface variable, and then return the
    /// LOCAL's Value.
    /// </summary>
    public static int ViaCopyThenReadOriginal()
    {
        MutableCounter counter = new MutableCounter();
        ICounter boxed = counter;
        boxed.Increment();
        boxed.Increment();
        return counter.Value;
    }

    /// <summary>
    /// Make a MutableCounter[1], call Increment on element 0, and return
    /// element 0's Value.
    /// </summary>
    public static int ViaArrayElement()
    {
        MutableCounter[] counters = new MutableCounter[1];
        counters[0].Increment();
        return counters[0].Value;
    }
}
