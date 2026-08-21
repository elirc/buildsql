// 04_inheritance_polymorphism / challenge - the template method pattern.
// See lessons/04_inheritance_polymorphism/README.md, "Challenge".

namespace CSharpDojo.L04_InheritancePolymorphism;

public abstract class Report
{
    /// <summary>
    /// The fixed skeleton, in three lines joined by "\n":
    ///   == Title ==
    ///   (the body)
    ///   (the footer)
    /// Subclasses fill in the parts; they never rearrange the whole, which is
    /// why this method is not virtual.
    /// </summary>
    public string Render()
    {
        throw new NotImplementedException("challenge: Render is not implemented yet - edit this file.");
    }

    protected abstract string Title { get; }

    protected abstract string Body();

    /// <summary>Subclasses may replace this. Most do not need to.</summary>
    protected virtual string Footer() => "-- end --";
}

public class SalesReport : Report
{
    private readonly decimal[] _amounts;

    public SalesReport(params decimal[] amounts)
    {
        _amounts = amounts;
    }

    protected override string Title => "Sales";

    /// <summary>"3 sales totalling 60"</summary>
    protected override string Body()
    {
        throw new NotImplementedException("challenge: SalesReport.Body is not implemented yet - edit this file.");
    }

    /// <summary>"-- 3 rows --"</summary>
    protected override string Footer()
    {
        throw new NotImplementedException("challenge: SalesReport.Footer is not implemented yet - edit this file.");
    }
}

public class EmptyReport : Report
{
    protected override string Title => "Empty";

    /// <summary>"(no data)" - and this report keeps the default footer.</summary>
    protected override string Body()
    {
        throw new NotImplementedException("challenge: EmptyReport.Body is not implemented yet - edit this file.");
    }
}
