// 10_linq_1 / challenge - one pipeline, from raw rows to a printed report.
// See lessons/10_linq_1/README.md, "Challenge".

namespace CSharpDojo.L10_Linq1;

public static class Reports
{
    /// <summary>
    /// The <paramref name="count"/> biggest orders of one year, as
    /// "ada: 300 | cy: 120 | bo: 90" - biggest first, ties broken by customer
    /// name A-Z. A year with no orders reports "(none)".
    /// </summary>
    public static string TopOfYear(IEnumerable<Order> orders, int year, int count)
    {
        throw new NotImplementedException("challenge: TopOfYear is not implemented yet - edit this file.");
    }
}
