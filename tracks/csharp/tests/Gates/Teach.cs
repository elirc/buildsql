// Harness, not content. Assertion helpers that make a failure teach.
//
// xUnit's Assert.Equal gives you a good diff but no room for a sentence, and
// Assert.True gives you a sentence but no diff. Teach.Equal gives you both:
// the teaching line first, then the evidence.
using System.Collections;
using Xunit.Sdk;

namespace CSharpDojo.Gates;

public static class Teach
{
    /// <summary>Assert equality, leading with a sentence that says what to reread.</summary>
    public static void Equal<T>(T expected, T actual, string because)
    {
        if (EqualityComparer<T>.Default.Equals(expected, actual))
        {
            return;
        }

        throw new XunitException(
            $"{because}\n\n  expected: {Show(expected)}\n  actual:   {Show(actual)}");
    }

    /// <summary>Assert a condition, leading with a sentence that says what to reread.</summary>
    public static void True(bool condition, string because)
    {
        if (!condition)
        {
            throw new XunitException(because);
        }
    }

    /// <summary>Assert that calling <paramref name="action"/> throws <typeparamref name="T"/>.</summary>
    public static T Throws<T>(Action action, string because) where T : Exception
    {
        try
        {
            action();
        }
        catch (T expected)
        {
            return expected;
        }
        catch (Exception other)
        {
            throw new XunitException(
                $"{because}\n\n  expected: {typeof(T).Name}\n  actual:   {other.GetType().Name}: {other.Message}");
        }

        throw new XunitException($"{because}\n\n  expected: {typeof(T).Name}\n  actual:   no exception was thrown");
    }

    /// <summary>Assert that awaiting <paramref name="action"/> throws <typeparamref name="T"/>.</summary>
    public static async Task<T> ThrowsAsync<T>(Func<Task> action, string because) where T : Exception
    {
        try
        {
            await action();
        }
        catch (T expected)
        {
            return expected;
        }
        catch (Exception other)
        {
            throw new XunitException(
                $"{because}\n\n  expected: {typeof(T).Name}\n  actual:   {other.GetType().Name}: {other.Message}");
        }

        throw new XunitException($"{because}\n\n  expected: {typeof(T).Name}\n  actual:   no exception was thrown");
    }

    private static string Show(object? value) => value switch
    {
        null => "null",
        string s => $"\"{s}\"",
        IEnumerable items and not string => "[" + string.Join(", ", items.Cast<object?>().Select(Show)) + "]",
        _ => value.ToString() ?? "null",
    };
}
