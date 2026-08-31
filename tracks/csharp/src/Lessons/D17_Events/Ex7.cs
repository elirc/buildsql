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
        throw new NotImplementedException("ex7: AllVotes is not implemented yet - edit this file.");
    }

    /// <summary>The sum of every handler's answer; zero when nobody voted.</summary>
    public int Total()
    {
        throw new NotImplementedException("ex7: Total is not implemented yet - edit this file.");
    }
}
