// d14_sets_queues_stacks / ex7 - browser history: two stacks.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 7".

namespace CSharpDojo.D14_SetsQueuesStacks;

public class History
{
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
        throw new NotImplementedException("ex7: Visit is not implemented yet - edit this file.");
    }

    /// <summary>Steps back one page; false (staying put) when there is nowhere back to go.</summary>
    public bool Back()
    {
        throw new NotImplementedException("ex7: Back is not implemented yet - edit this file.");
    }

    /// <summary>Re-steps forward after a Back; false (staying put) when there is nothing ahead.</summary>
    public bool Forward()
    {
        throw new NotImplementedException("ex7: Forward is not implemented yet - edit this file.");
    }
}
