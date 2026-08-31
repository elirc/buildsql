// d13_lists_dictionaries / ex5 - removing without tripping the enumerator.
// See lessons/d13_lists_dictionaries/README.md, "Exercise 5".

namespace CSharpDojo.D13_ListsDictionaries;

public static class Cleanup
{
    /// <summary>
    /// Removes every reading strictly below <paramref name="minimum"/> and
    /// returns how many were removed. Careful: removing from a dictionary while
    /// foreach-ing it throws InvalidOperationException.
    /// </summary>
    public static int DropBelow(Dictionary<string, int> readings, int minimum)
    {
        List<string> doomed = readings
            .Where(pair => pair.Value < minimum)
            .Select(pair => pair.Key)
            .ToList();

        foreach (string key in doomed)
        {
            readings.Remove(key);
        }

        return doomed.Count;
    }

    /// <summary>
    /// Removes every value the predicate condemns and returns how many were
    /// removed. The survivors keep their relative order.
    /// </summary>
    public static int DropWhere(List<int> values, Func<int, bool> condemned)
    {
        return values.RemoveAll(value => condemned(value));
    }
}
