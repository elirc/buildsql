// d10_records_structs / ex3 - a readonly struct that returns new copies.
// See lessons/d10_records_structs/README.md, "Exercise 3".

namespace CSharpDojo.D10_RecordsStructs;

public readonly struct Rgb
{
    public Rgb(byte red, byte green, byte blue)
    {
        Red = red;
        Green = green;
        Blue = blue;
    }

    public byte Red { get; }

    public byte Green { get; }

    public byte Blue { get; }

    /// <summary>
    /// A NEW colour with every channel reduced by the amount, stopping at 0.
    /// The struct is readonly, so nothing here may be modified in place.
    /// </summary>
    public Rgb Darken(int amount)
    {
        throw new NotImplementedException("ex3: Darken is not implemented yet - edit this file.");
    }

    /// <summary>"#FF8000" - a hash and six UPPER-case hex digits.</summary>
    public string Hex => throw new NotImplementedException("ex3: Hex is not implemented yet - edit this file.");

    /// <summary>The same as Hex.</summary>
    public override string ToString()
    {
        throw new NotImplementedException("ex3: ToString is not implemented yet - edit this file.");
    }
}
