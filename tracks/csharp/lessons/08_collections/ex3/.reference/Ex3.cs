// 08_collections / ex3 - Queue and Stack: two ends of the same idea.
// See lessons/08_collections/README.md, "Exercise 3".

namespace CSharpDojo.L08_Collections;

public static class Lines
{
    /// <summary>
    /// Take up to <paramref name="count"/> items off the front of the queue, in
    /// the order they are served. An empty queue serves nothing rather than
    /// throwing.
    /// </summary>
    public static List<string> Serve(Queue<string> queue, int count)
    {
        List<string> served = new List<string>();
        for (int i = 0; i < count; i++)
        {
            if (!queue.TryDequeue(out string? next))
            {
                break;
            }

            served.Add(next);
        }

        return served;
    }

    /// <summary>
    /// True when every bracket in the text is closed by the right partner in
    /// the right order. Only ( ) [ ] { } matter; every other character is
    /// ignored.
    /// </summary>
    public static bool IsBalanced(string text)
    {
        Stack<char> open = new Stack<char>();
        foreach (char c in text)
        {
            if (c is '(' or '[' or '{')
            {
                open.Push(c);
            }
            else if (c is ')' or ']' or '}')
            {
                if (!open.TryPop(out char last))
                {
                    return false;
                }

                char expected = c switch
                {
                    ')' => '(',
                    ']' => '[',
                    _ => '{',
                };

                if (last != expected)
                {
                    return false;
                }
            }
        }

        return open.Count == 0;
    }
}
