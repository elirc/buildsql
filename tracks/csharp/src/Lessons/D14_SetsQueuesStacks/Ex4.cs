// d14_sets_queues_stacks / ex4 - an undo stack.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 4".

namespace CSharpDojo.D14_SetsQueuesStacks;

public class Draft
{
    /// <summary>The current text. Starts empty.</summary>
    public string Text { get; private set; } = "";

    /// <summary>Whether there is anything to undo.</summary>
    public bool CanUndo
    {
        get { throw new NotImplementedException("ex4: CanUndo is not implemented yet - edit this file."); }
    }

    /// <summary>Appends to the text, remembering the previous text for Undo.</summary>
    public void Type(string addition)
    {
        throw new NotImplementedException("ex4: Type is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Restores the text as it was before the most recent Type. Returns false
    /// (changing nothing) when there is nothing left to undo.
    /// </summary>
    public bool Undo()
    {
        throw new NotImplementedException("ex4: Undo is not implemented yet - edit this file.");
    }
}
