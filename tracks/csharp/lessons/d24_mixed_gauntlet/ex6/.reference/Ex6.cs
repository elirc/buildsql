// d24_mixed_gauntlet / ex6 - an event, a collection and a query.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 6".

namespace CSharpDojo.D24_MixedGauntlet;

public sealed class Basket
{
    private readonly List<string> _items = new List<string>();

    /// <summary>Raised with the item, after it has gone in.</summary>
    public event Action<string>? Added;

    /// <summary>Written for you: how many handlers are listening.</summary>
    public int Listeners => Added?.GetInvocationList().Length ?? 0;

    public int Count => _items.Count;

    /// <summary>
    /// Adds the item and then raises Added. A null or empty item is an
    /// ArgumentException and is neither added nor announced.
    /// </summary>
    public void Add(string item)
    {
        if (string.IsNullOrEmpty(item))
        {
            throw new ArgumentException("item is required", nameof(item));
        }

        _items.Add(item);
        Added?.Invoke(item);
    }

    /// <summary>
    /// The items that appear more than once, each named once, in the order
    /// they were first seen.
    /// </summary>
    public List<string> Duplicates()
    {
        return _items
            .GroupBy(item => item)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToList();
    }

    /// <summary>
    /// "apple=2" for each distinct item, ordered by count descending with ties
    /// broken by the item (ordinal).
    /// </summary>
    public List<string> Tally()
    {
        return _items
            .GroupBy(item => item)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => $"{group.Key}={group.Count()}")
            .ToList();
    }
}
