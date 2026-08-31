// d10_records_structs / ex3 - a readonly struct that returns new copies.
// See lessons/d10_records_structs/README.md, "Exercise 3".

using System.Globalization;

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
        return new Rgb(Reduce(Red, amount), Reduce(Green, amount), Reduce(Blue, amount));
    }

    /// <summary>"#FF8000" - a hash and six UPPER-case hex digits.</summary>
    public string Hex =>
        "#" + Red.ToString("X2", CultureInfo.InvariantCulture)
            + Green.ToString("X2", CultureInfo.InvariantCulture)
            + Blue.ToString("X2", CultureInfo.InvariantCulture);

    /// <summary>The same as Hex.</summary>
    public override string ToString() => Hex;

    private static byte Reduce(byte channel, int amount) => (byte)Math.Max(0, channel - amount);
}
