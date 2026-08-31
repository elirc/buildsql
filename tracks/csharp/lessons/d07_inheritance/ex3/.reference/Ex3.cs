// d07_inheritance / ex3 - abstract members must be supplied, virtual ones may be.
// See lessons/d07_inheritance/README.md, "Exercise 3".

namespace CSharpDojo.D07_Inheritance;

// Written for you.
public abstract class Alert
{
    protected Alert(string message)
    {
        Message = message;
    }

    public string Message { get; }

    /// <summary>No sensible default exists, so every alert must say.</summary>
    public abstract string Severity { get; }

    /// <summary>A sensible default exists, so overriding is optional.</summary>
    public virtual int Priority => 3;

    /// <summary>"[INFO/3] disk is fine".</summary>
    public string Render() => $"[{Severity}/{Priority}] {Message}";
}

public class InfoAlert : Alert
{
    public InfoAlert(string message)
        : base(message)
    {
    }

    /// <summary>"INFO". Priority is left at the default.</summary>
    public override string Severity => "INFO";
}

public class PageAlert : Alert
{
    public PageAlert(string message)
        : base(message)
    {
    }

    /// <summary>"PAGE".</summary>
    public override string Severity => "PAGE";

    /// <summary>1 - a page wakes somebody up.</summary>
    public override int Priority => 1;
}
