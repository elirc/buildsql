// d17_events / ex7 - collecting answers from every handler.
// See lessons/d17_events/README.md, "Exercise 7".

namespace CSharpDojo.D17_Events;

public class Poll
{
    /// <summary>Each subscriber contributes one vote.</summary>
    public event Func<int>? Votes;

    /// <summary>
    /// Written for you, and deliberately wrong: invoking a multicast delegate
    /// that returns a value gives you only the LAST handler's answer. Every
    /// other handler ran and its result was thrown away.
    /// </summary>
    public int NaiveTotal()
    {
        return Votes?.Invoke() ?? 0;
    }

    /// <summary>Every handler's answer, in subscription order.</summary>
    public List<int> AllVotes()
    {
        List<int> results = new List<int>();
        Func<int>? handlers = Votes;
        if (handlers is null)
        {
            return results;
        }

        foreach (Delegate entry in handlers.GetInvocationList())
        {
            results.Add(((Func<int>)entry)());
        }

        return results;
    }

    /// <summary>The sum of every handler's answer; zero when nobody voted.</summary>
    public int Total()
    {
        int total = 0;
        foreach (int vote in AllVotes())
        {
            total += vote;
        }

        return total;
    }
}
