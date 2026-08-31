// d05_classes_construction / ex5 - readonly does not mean immutable.
// See lessons/d05_classes_construction/README.md, "Exercise 5".

namespace CSharpDojo.D05_ClassesConstruction;

public class Poll
{
    private readonly string[] _options = Array.Empty<string>();

    /// <summary>
    /// A blank question is an ArgumentException, and so is a set of options
    /// with fewer than two entries. The options are COPIED on the way in.
    /// </summary>
    public Poll(string question, string[] options)
    {
        if (string.IsNullOrWhiteSpace(question))
        {
            throw new ArgumentException("A poll needs a question.", nameof(question));
        }

        if (options is null || options.Length < 2)
        {
            throw new ArgumentException("A poll needs at least two options.", nameof(options));
        }

        Question = question.Trim();
        _options = (string[])options.Clone();
    }

    public string Question { get; } = "";

    /// <summary>How many options this poll has.</summary>
    public int Count => _options.Length;

    /// <summary>
    /// The options, as an array the caller may do what it likes with - so this
    /// hands back a COPY, not the field.
    /// </summary>
    public string[] Options()
    {
        return (string[])_options.Clone();
    }
}
