// d08_polymorphism / ex2 - overriding ToString, and who calls it for you.
// See lessons/d08_polymorphism/README.md, "Exercise 2".

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
    public override string ToString()
    {
        throw new NotImplementedException("ex2: TextCell.ToString is not implemented yet - edit this file.");
    }
}

public class NumberCell : Cell
{
    public NumberCell(decimal value)
    {
        Value = value;
    }

    public decimal Value { get; }

    /// <summary>The value with exactly two decimals, invariant culture.</summary>
    public override string ToString()
    {
        throw new NotImplementedException("ex2: NumberCell.ToString is not implemented yet - edit this file.");
    }
}

public class EmptyCell : Cell
{
    /// <summary>"-".</summary>
    public override string ToString()
    {
        throw new NotImplementedException("ex2: EmptyCell.ToString is not implemented yet - edit this file.");
    }
}

public static class Row
{
    /// <summary>
    /// The cells joined with " | ". Let string.Join call ToString for you -
    /// there is no cast and no type test in the answer.
    /// </summary>
    public static string Render(IEnumerable<Cell> cells)
    {
        throw new NotImplementedException("ex2: Render is not implemented yet - edit this file.");
    }
}
