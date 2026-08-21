// 08_collections / ex4 - iterators: a sequence that is computed as it is read.
// See lessons/08_collections/README.md, "Exercise 4".

namespace CSharpDojo.L08_Collections;

public static class Iterators
{
    /// <summary>
    /// The even numbers of the source, in order - produced one at a time with
    /// yield return, NOT collected into a list first.
    /// </summary>
    public static IEnumerable<int> Evens(IEnumerable<int> numbers)
    {
        throw new NotImplementedException("ex4: Evens is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The numbers from the start of the source that are below the limit,
    /// stopping at the FIRST one that is not - and reading no further.
    /// </summary>
    public static IEnumerable<int> WhileBelow(IEnumerable<int> numbers, int limit)
    {
        throw new NotImplementedException("ex4: WhileBelow is not implemented yet - edit this file.");
    }
}
