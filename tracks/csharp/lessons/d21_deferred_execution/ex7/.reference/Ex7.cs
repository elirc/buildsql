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
    private bool _finished;

    public Memoized(IEnumerable<T> source)
    {
        _source = source.GetEnumerator();
    }

    /// <summary>How many items have been pulled from the source so far.</summary>
    public int Cached => _cache.Count;

    public IEnumerator<T> GetEnumerator()
    {
        int index = 0;
        while (true)
        {
            if (index < _cache.Count)
            {
                yield return _cache[index];
                index++;
                continue;
            }

            if (_finished || _source is null)
            {
                yield break;
            }

            if (_source.MoveNext())
            {
                _cache.Add(_source.Current);
            }
            else
            {
                _finished = true;
                _source.Dispose();
                _source = null;
                yield break;
            }
        }
    }

    // Written for you: the non-generic half of IEnumerable, which every
    // IEnumerable<T> also has to supply.
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
