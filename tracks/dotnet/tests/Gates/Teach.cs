// Harness, not content. Assertion helpers that make a failure teach.
//
// xUnit's Assert.Equal gives you a good diff but no room for a sentence, and
// Assert.True gives you a sentence but no diff. Teach.Equal gives you both:
// the teaching line first, then the evidence.
using System.Collections;
using System.Net;
using Xunit.Sdk;

namespace DotnetDojo.Gates;

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

    /// <summary>Assert an HTTP status, showing the body when it does not match.</summary>
    public static async Task Status(HttpStatusCode expected, HttpResponseMessage response, string because)
    {
        if (response.StatusCode == expected)
        {
            return;
        }

        string body = await response.Content.ReadAsStringAsync();
        throw new XunitException(
            $"{because}\n\n  expected: {(int)expected} {expected}\n"
            + $"  actual:   {(int)response.StatusCode} {response.StatusCode}\n"
            + $"  body:     {Truncate(body)}");
    }

    private static string Truncate(string s) => s.Length <= 500 ? s : s[..500] + " ...";

    private static string Show(object? value) => value switch
    {
        null => "null",
        string s => $"\"{s}\"",
        IEnumerable items and not string => "[" + string.Join(", ", items.Cast<object?>().Select(Show)) + "]",
        _ => value.ToString() ?? "null",
    };
}
