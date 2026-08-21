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
        return string.Join("\n", $"== {Title} ==", Body(), Footer());
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
        decimal total = 0m;
        foreach (decimal amount in _amounts)
        {
            total += amount;
        }

        string noun = _amounts.Length == 1 ? "sale" : "sales";
        return $"{_amounts.Length} {noun} totalling {total}";
    }

    /// <summary>"-- 3 rows --"</summary>
    protected override string Footer()
    {
        return $"-- {_amounts.Length} rows --";
    }
}

public class EmptyReport : Report
{
    protected override string Title => "Empty";

    /// <summary>"(no data)" - and this report keeps the default footer.</summary>
    protected override string Body()
    {
        return "(no data)";
    }
}
