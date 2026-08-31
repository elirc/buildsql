// d20_linq_joins_flatten / ex4 - keeping the parent while you flatten.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 4".

namespace CSharpDojo.D20_LinqJoinsFlatten;

// The gate builds these. Written for you.
public record Invoice(string Number, List<string> Lines);

public static class Documents
{
    /// <summary>
    /// "INV1/paper" for every line of every invoice, invoices in order and
    /// lines within an invoice in order.
    /// </summary>
    public static List<string> AllLines(IEnumerable<Invoice> invoices)
    {
        return invoices
            .SelectMany(invoice => invoice.Lines, (invoice, line) => $"{invoice.Number}/{line}")
            .ToList();
    }

    /// <summary>
    /// "INV1#1: paper", numbering the lines from 1 WITHIN each invoice - so
    /// the numbering restarts for every invoice.
    /// </summary>
    public static List<string> NumberedLines(IEnumerable<Invoice> invoices)
    {
        return invoices
            .SelectMany(invoice => invoice.Lines
                .Select((line, index) => $"{invoice.Number}#{index + 1}: {line}"))
            .ToList();
    }

    /// <summary>The numbers of the invoices that have no lines at all, in order.</summary>
    public static List<string> Blank(IEnumerable<Invoice> invoices)
    {
        return invoices
            .Where(invoice => invoice.Lines.Count == 0)
            .Select(invoice => invoice.Number)
            .ToList();
    }
}
