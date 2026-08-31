// d14_sets_queues_stacks / ex4 - an undo stack.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 4".

namespace CSharpDojo.D14_SetsQueuesStacks;

public class Draft
{
    private readonly Stack<string> _history = new Stack<string>();

    /// <summary>The current text. Starts empty.</summary>
    public string Text { get; private set; } = "";

    /// <summary>Whether there is anything to undo.</summary>
    public bool CanUndo
    {
        get { return _history.Count > 0; }
    }

    /// <summary>Appends to the text, remembering the previous text for Undo.</summary>
    public void Type(string addition)
    {
        _history.Push(Text);
        Text += addition;
    }

    /// <summary>
    /// Restores the text as it was before the most recent Type. Returns false
    /// (changing nothing) when there is nothing left to undo.
    /// </summary>
    public bool Undo()
    {
        if (_history.Count == 0)
        {
            return false;
        }

        Text = _history.Pop();
        return true;
    }
}
