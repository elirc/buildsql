// i2_interview_drills / review1 - the most-recently-used list, again.
// See lessons/i2_interview_drills/README.md, "Review".

namespace CSharpDojo.I2_InterviewDrills;

/// <summary>
/// A "recently opened" list: newest first, no duplicates, never longer than
/// Capacity.
/// </summary>
public sealed class RecentItems
{
    private readonly List<string> _items = new();

    public RecentItems(int capacity)
    {
        if (capacity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(capacity), capacity, "Keep at least one item.");
        }

        Capacity = capacity;
    }

    public int Capacity { get; }

    /// <summary>Newest first.</summary>
    public IReadOnlyList<string> Items => _items.AsReadOnly();

    /// <summary>
    /// Record that an item was used: it goes to the front, appears only once,
    /// and the oldest is dropped if that would take the list over Capacity.
    /// </summary>
    public void Touch(string item)
    {
        _items.Remove(item);
        _items.Insert(0, item);
        if (_items.Count > Capacity)
        {
            _items.RemoveAt(_items.Count - 1);
        }
    }
}
