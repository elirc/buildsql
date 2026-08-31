// d14_sets_queues_stacks / ex7 - browser history: two stacks.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 7".

namespace CSharpDojo.D14_SetsQueuesStacks;

public class History
{
    private readonly Stack<string> _back = new Stack<string>();
    private readonly Stack<string> _forward = new Stack<string>();

    public History(string home)
    {
        Current = home;
    }

    /// <summary>The page being shown right now.</summary>
    public string Current { get; private set; }

    /// <summary>
    /// Navigates to a new page. The old page becomes reachable with Back, and
    /// anything that was reachable with Forward is gone for good.
    /// </summary>
    public void Visit(string url)
    {
        _back.Push(Current);
        Current = url;
        _forward.Clear();
    }

    /// <summary>Steps back one page; false (staying put) when there is nowhere back to go.</summary>
    public bool Back()
    {
        if (_back.Count == 0)
        {
            return false;
        }

        _forward.Push(Current);
        Current = _back.Pop();
        return true;
    }

    /// <summary>Re-steps forward after a Back; false (staying put) when there is nothing ahead.</summary>
    public bool Forward()
    {
        if (_forward.Count == 0)
        {
            return false;
        }

        _back.Push(Current);
        Current = _forward.Pop();
        return true;
    }
}
