// d09_interfaces_contracts / ex5 - a default implementation, and where it lives.
// See lessons/d09_interfaces_contracts/README.md, "Exercise 5".

namespace CSharpDojo.D09_InterfacesContracts;

public interface IReportable
{
    string Title { get; }

    IReadOnlyList<string> Rows { get; }

    /// <summary>
    /// "Q1: 2 row(s)" - the title, a colon, the row count, " row(s)".
    /// This body lives in the INTERFACE, so an implementer that says nothing
    /// gets it for free.
    /// </summary>
    string Summary()
    {
        throw new NotImplementedException("ex5: the default Summary is not implemented yet - edit this file.");
    }
}

/// <summary>Says nothing about Summary, so it uses the interface's version.</summary>
public class SalesReport : IReportable
{
    public SalesReport(string title, IReadOnlyList<string> rows)
    {
        Title = title;
        Rows = rows;
    }

    public string Title { get; }

    public IReadOnlyList<string> Rows { get; }
}

/// <summary>Supplies its own Summary: "Q1/2" - the title, a slash, the count.</summary>
public class TerseReport : IReportable
{
    public TerseReport(string title, IReadOnlyList<string> rows)
    {
        Title = title;
        Rows = rows;
    }

    public string Title { get; }

    public IReadOnlyList<string> Rows { get; }

    public string Summary()
    {
        throw new NotImplementedException("ex5: TerseReport.Summary is not implemented yet - edit this file.");
    }
}

public static class Reports
{
    /// <summary>Asks through the interface, so both kinds work.</summary>
    public static string SummaryOf(IReportable report)
    {
        throw new NotImplementedException("ex5: SummaryOf is not implemented yet - edit this file.");
    }
}
