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
        : base("guitar")
    {
        Strings = strings;
    }

    public int Strings { get; }

    public override string Play() => "strum";
}

public class Drum : Instrument
{
    /// <summary>Passes the name "drum" to the base.</summary>
    public Drum()
        : base("drum")
    {
    }

    public override string Play() => "boom";
}
