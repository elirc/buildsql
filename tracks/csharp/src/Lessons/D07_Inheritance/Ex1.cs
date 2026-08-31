// d07_inheritance / ex1 - a base constructor and an abstract member.
// See lessons/d07_inheritance/README.md, "Exercise 1".

namespace CSharpDojo.D07_Inheritance;

// Written for you. Note that the constructor is protected: only a derived
// class can call it, because an Instrument on its own is not a thing.
public abstract class Instrument
{
    protected Instrument(string name)
    {
        Name = name;
    }

    public string Name { get; }

    /// <summary>What this instrument sounds like.</summary>
    public abstract string Play();

    /// <summary>"guitar: strum" - the name, a colon, and the sound.</summary>
    public string Announce() => $"{Name}: {Play()}";
}

public class Guitar : Instrument
{
    /// <summary>Passes the name "guitar" to the base and stores the string count.</summary>
    public Guitar(int strings)
        : base("")   // <- the name belongs here
    {
        throw new NotImplementedException("ex1: the Guitar constructor is not implemented yet - edit this file.");
    }

    public int Strings { get; }

    public override string Play()
    {
        throw new NotImplementedException("ex1: Guitar.Play is not implemented yet - edit this file.");
    }
}

public class Drum : Instrument
{
    /// <summary>Passes the name "drum" to the base.</summary>
    public Drum()
        : base("")   // <- the name belongs here
    {
        throw new NotImplementedException("ex1: the Drum constructor is not implemented yet - edit this file.");
    }

    public override string Play()
    {
        throw new NotImplementedException("ex1: Drum.Play is not implemented yet - edit this file.");
    }
}
