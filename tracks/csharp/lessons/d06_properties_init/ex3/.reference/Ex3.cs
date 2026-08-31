// d06_properties_init / ex3 - required members.
// See lessons/d06_properties_init/README.md, "Exercise 3".

namespace CSharpDojo.D06_PropertiesInit;

public class MailMessage
{
    /// <summary>Every message must be addressed. `required` makes the compiler say so.</summary>
    public required string To { get; init; }

    /// <summary>...and must have a subject.</summary>
    public required string Subject { get; init; }

    /// <summary>The body is optional and defaults to empty.</summary>
    public string Body { get; init; } = "";

    /// <summary>True when there is any body text at all.</summary>
    public bool HasBody => Body.Length > 0;

    /// <summary>"To: ada@example.com | Hello (5 chars)".</summary>
    public string Summary => $"To: {To} | {Subject} ({Body.Length} chars)";
}
