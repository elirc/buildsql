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
    public string Read() => _text;

    /// <summary>Appends to what is already there.</summary>
    public void Write(string text) => _text += text;
}

/// <summary>Implements only the reading half.</summary>
public class FrozenDoc : IReadableDoc
{
    public FrozenDoc(string text)
    {
        Text = text;
    }

    public string Text { get; }

    public string Read() => Text;
}

public static class Docs
{
    /// <summary>
    /// The length of what the document reads. Takes the NARROW interface, so a
    /// FrozenDoc is accepted too.
    /// </summary>
    public static int LengthOf(IReadableDoc doc) => doc.Read().Length;

    /// <summary>Writes "!" to anything writable and returns nothing.</summary>
    public static void Exclaim(IWritableDoc doc) => doc.Write("!");

    /// <summary>
    /// True when this document can be written to. Ask about the OBJECT, not
    /// about the variable's type.
    /// </summary>
    public static bool CanWrite(IReadableDoc doc) => doc is IWritableDoc;
}
