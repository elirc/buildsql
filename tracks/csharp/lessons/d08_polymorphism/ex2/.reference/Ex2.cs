// d08_polymorphism / ex2 - overriding ToString, and who calls it for you.
// See lessons/d08_polymorphism/README.md, "Exercise 2".

using System.Globalization;

namespace CSharpDojo.D08_Polymorphism;

public abstract class Cell
{
    /// <summary>Every cell renders itself. Abstract, so nobody inherits object's version.</summary>
    public abstract override string ToString();
}

public class TextCell : Cell
{
    public TextCell(string text)
    {
        Text = text;
    }

    public string Text { get; }

    /// <summary>The text, unchanged.</summary>
    public override string ToString() => Text;
}

public class NumberCell : Cell
{
    public NumberCell(decimal value)
    {
        Value = value;
    }

    public decimal Value { get; }

    /// <summary>The value with exactly two decimals, invariant culture.</summary>
    public override string ToString() => Value.ToString("0.00", CultureInfo.InvariantCulture);
}

public class EmptyCell : Cell
{
    /// <summary>"-".</summary>
    public override string ToString() => "-";
}

public static class Row
{
    /// <summary>
    /// The cells joined with " | ". Let string.Join call ToString for you -
    /// there is no cast and no type test in the answer.
    /// </summary>
    public static string Render(IEnumerable<Cell> cells) => string.Join(" | ", cells);
}
