// d21_deferred_execution / ex7 - read once, replay for ever.
// See lessons/d21_deferred_execution/README.md, "Exercise 7".

using System.Collections;

namespace CSharpDojo.D21_DeferredExecution;

/// <summary>
/// Wraps a sequence so that the source is enumerated at most once however many
/// times this object is enumerated, and nothing at all is read until the first
/// enumeration asks for an item.
/// </summary>
public sealed class Memoized<T> : IEnumerable<T>
{
    private readonly List<T> _cache = new List<T>();
    private IEnumerator<T>? _source;

    public Memoized(IEnumerable<T> source)
    {
        _source = source.GetEnumerator();
    }

    /// <summary>How many items have been pulled from the source so far.</summary>
    public int Cached => _cache.Count;

    public IEnumerator<T> GetEnumerator()
    {
        throw new NotImplementedException("ex7: GetEnumerator is not implemented yet - edit this file.");
    }

    // Written for you: the non-generic half of IEnumerable, which every
    // IEnumerable<T> also has to supply.
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
