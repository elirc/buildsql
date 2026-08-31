// d08_polymorphism / ex6 - a bag of rules, all the same shape.
// See lessons/d08_polymorphism/README.md, "Exercise 6".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Rule
{
    /// <summary>null when the input is fine, otherwise the complaint.</summary>
    public abstract string? Check(string input);
}

public class NotBlank : Rule
{
    /// <summary>"must not be blank".</summary>
    public override string? Check(string input) =>
        string.IsNullOrWhiteSpace(input) ? "must not be blank" : null;
}

public class MaxLength : Rule
{
    public MaxLength(int limit)
    {
        Limit = limit;
    }

    public int Limit { get; }

    /// <summary>"must be at most N characters".</summary>
    public override string? Check(string input) =>
        input.Length > Limit ? $"must be at most {Limit} characters" : null;
}

public class DigitsOnly : Rule
{
    /// <summary>"must be digits only". EMPTY text passes vacuously; a space does not.</summary>
    public override string? Check(string input) =>
        input.All(char.IsAsciiDigit) ? null : "must be digits only";
}

public static class Validation
{
    /// <summary>
    /// The FIRST complaint any rule makes, in order, or "" when they all pass.
    /// Stop asking as soon as one complains.
    /// </summary>
    public static string FirstError(IEnumerable<Rule> rules, string input)
    {
        foreach (Rule rule in rules)
        {
            string? complaint = rule.Check(input);
            if (complaint is not null)
            {
                return complaint;
            }
        }

        return "";
    }

    /// <summary>Every complaint, in order, joined with "; ".</summary>
    public static string AllErrors(IEnumerable<Rule> rules, string input)
    {
        List<string> complaints = new List<string>();
        foreach (Rule rule in rules)
        {
            string? complaint = rule.Check(input);
            if (complaint is not null)
            {
                complaints.Add(complaint);
            }
        }

        return string.Join("; ", complaints);
    }
}
