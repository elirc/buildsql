// d09_interfaces_contracts / ex1 - one contract, three unrelated implementers.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 1".

namespace CSharpDojo.D09_InterfacesContracts;

/// <summary>Anything in a document that can say how many words it contributes.</summary>
public interface IWordCount
{
    int Words { get; }
}

public class Paragraph : IWordCount
{
    public Paragraph(string text)
    {
        Text = text;
    }

    public string Text { get; }

    /// <summary>Words separated by any run of whitespace; empty text is 0.</summary>
    public int Words => Text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
}

public class Heading : IWordCount
{
    public Heading(string title, int level)
    {
        Title = title;
        Level = level;
    }

    public string Title { get; }

    public int Level { get; }

    /// <summary>The same counting rule, applied to the title.</summary>
    public int Words => Title.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
}

/// <summary>A struct may implement an interface too.</summary>
public readonly struct ImageBlock : IWordCount
{
    public ImageBlock(string source)
    {
        Source = source;
    }

    public string Source { get; }

    /// <summary>Always 0 - a picture is not words.</summary>
    public int Words => 0;
}

public static class Document
{
    /// <summary>Every part's word count added up.</summary>
    public static int Total(IEnumerable<IWordCount> parts)
    {
        int total = 0;
        foreach (IWordCount part in parts)
        {
            total += part.Words;
        }

        return total;
    }

    /// <summary>The largest single word count, or 0 when there are no parts.</summary>
    public static int Largest(IEnumerable<IWordCount> parts)
    {
        int largest = 0;
        foreach (IWordCount part in parts)
        {
            if (part.Words > largest)
            {
                largest = part.Words;
            }
        }

        return largest;
    }
}
