// d09_interfaces_contracts / ex3 - two contracts, one class, narrow parameters.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 3".

namespace CSharpDojo.D09_InterfacesContracts;

public interface IReadableDoc
{
    string Read();
}

public interface IWritableDoc
{
    void Write(string text);
}

/// <summary>Implements BOTH contracts.</summary>
public class MemoryDoc : IReadableDoc, IWritableDoc
{
    private string _text = "";

    /// <summary>Everything written so far.</summary>
    public string Read()
    {
        throw new NotImplementedException("ex3: MemoryDoc.Read is not implemented yet - edit this file.");
    }

    /// <summary>Appends to what is already there.</summary>
    public void Write(string text)
    {
        throw new NotImplementedException("ex3: MemoryDoc.Write is not implemented yet - edit this file.");
    }
}

/// <summary>Implements only the reading half.</summary>
public class FrozenDoc : IReadableDoc
{
    public FrozenDoc(string text)
    {
        Text = text;
    }

    public string Text { get; }

    public string Read()
    {
        throw new NotImplementedException("ex3: FrozenDoc.Read is not implemented yet - edit this file.");
    }
}

public static class Docs
{
    /// <summary>
    /// The length of what the document reads. Takes the NARROW interface, so a
    /// FrozenDoc is accepted too.
    /// </summary>
    public static int LengthOf(IReadableDoc doc)
    {
        throw new NotImplementedException("ex3: LengthOf is not implemented yet - edit this file.");
    }

    /// <summary>Writes "!" to anything writable and returns nothing.</summary>
    public static void Exclaim(IWritableDoc doc)
    {
        throw new NotImplementedException("ex3: Exclaim is not implemented yet - edit this file.");
    }

    /// <summary>
    /// True when this document can be written to. Ask about the OBJECT, not
    /// about the variable's type.
    /// </summary>
    public static bool CanWrite(IReadableDoc doc)
    {
        throw new NotImplementedException("ex3: CanWrite is not implemented yet - edit this file.");
    }
}
