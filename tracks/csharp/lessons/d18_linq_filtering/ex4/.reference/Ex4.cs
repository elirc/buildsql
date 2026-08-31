// d18_linq_filtering / ex4 - slicing: by position, and by a running condition.
// See lessons/d18_linq_filtering/README.md, "Exercise 4".

namespace CSharpDojo.D18_LinqFiltering;

public static class Slices
{
    /// <summary>
    /// One page of the sequence. Page numbers are 1-based, so page 1 is the
    /// first pageSize items. A page past the end is empty, not an error.
    /// </summary>
    public static List<int> Page(IEnumerable<int> source, int pageNumber, int pageSize)
    {
        return source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
    }

    /// <summary>
    /// The longest run of costs from the front whose running total stays at or
    /// below the budget. Stops at the first cost that would break it, even if
    /// a later, smaller one would fit.
    /// </summary>
    public static List<int> WithinBudget(IEnumerable<int> costs, int budget)
    {
        int spent = 0;
        return costs.TakeWhile(cost =>
        {
            spent += cost;
            return spent <= budget;
        }).ToList();
    }

    /// <summary>
    /// Everything after the first negative number, with the negative itself
    /// dropped. Empty when there is no negative number at all.
    /// </summary>
    public static List<int> AfterFirstNegative(IEnumerable<int> numbers)
    {
        return numbers.SkipWhile(number => number >= 0).Skip(1).ToList();
    }
}
