// d07_inheritance / ex6 - what runs when, and the trap it sets.
// See lessons/d07_inheritance/README.md, "Exercise 6".

namespace CSharpDojo.D07_Inheritance;

public abstract class Widget
{
    /// <summary>Every step of construction appends a line here, in order.</summary>
    public List<string> Trace { get; } = new List<string>();

    /// <summary>
    /// Appends "Widget ctor" and then calls Configure - which is the classic
    /// mistake this exercise is about. Write it exactly that way round.
    /// </summary>
    protected Widget()
    {
        Trace.Add("Widget ctor");
        Configure();
    }

    /// <summary>Appends "Widget.Configure".</summary>
    protected virtual void Configure()
    {
        Trace.Add("Widget.Configure");
    }
}

public class Panel : Widget
{
    private string? _title;

    /// <summary>
    /// Sets the title IN THE BODY (after the base constructor has already run)
    /// and then appends "Panel ctor".
    /// </summary>
    public Panel(string title)
    {
        _title = title;
        Trace.Add("Panel ctor");
    }

    public string Title => _title ?? "";

    /// <summary>
    /// Appends "Panel.Configure sees title=" followed by the field's value, or
    /// the word "null" when it has not been set yet.
    /// </summary>
    protected override void Configure()
    {
        Trace.Add("Panel.Configure sees title=" + (_title ?? "null"));
    }
}
