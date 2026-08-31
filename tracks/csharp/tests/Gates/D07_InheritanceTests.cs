using CSharpDojo.D07_Inheritance;

namespace CSharpDojo.Gates;

public class D07_InheritanceTests
{
    [Fact]
    public void Ex1_ABaseConstructorAndAnAbstractMember()
    {
        Guitar guitar = new Guitar(6);

        Teach.Equal("guitar", guitar.Name,
            "The derived constructor passes the name UP with `: base(\"guitar\")` - reread "
                + "README ex1.");
        Teach.Equal(6, guitar.Strings, "...and keeps its own state as well.");
        Teach.Equal("strum", guitar.Play(), "The abstract method is filled in here.");
        Teach.Equal("guitar: strum", guitar.Announce(),
            "Announce lives in the base class and still reaches the derived Play - reread "
                + "README ex1.");

        Drum drum = new Drum();
        Teach.Equal("drum: boom", drum.Announce(),
            "A derived constructor with no parameters of its own still has to feed the base one.");

        Instrument asBase = guitar;
        Teach.Equal("guitar: strum", asBase.Announce(),
            "Through an Instrument-typed reference the answer is the same - which is the point "
                + "of the abstract method.");
    }

    [Fact]
    public void Ex2_OverrideAndThenCallBaseAnyway()
    {
        Teach.Equal("hi", new Logger().Format("hi"), "The base version passes the message through.");

        Teach.Equal("[t] hi", new TimestampLogger("t").Format("hi"),
            "The override adds the stamp in FRONT of what the base produced - reread README ex2.");

        Teach.Equal("[T] HI", new ShoutingLogger("t").Format("hi"),
            "Two levels of override, each calling base: the stamp is added first and then the "
                + "whole thing is upper-cased, so the brackets contain 'T' - reread README ex2.");

        Logger asBase = new ShoutingLogger("t");
        Teach.Equal("[T] HI", asBase.Format("hi"),
            "Virtual dispatch reaches the MOST derived override, however the reference is "
                + "typed - reread README ex2.");
    }

    [Fact]
    public void Ex3_AbstractMustBeSuppliedVirtualMayBe()
    {
        Teach.Equal("[INFO/3] disk is fine", new InfoAlert("disk is fine").Render(),
            "Severity is abstract so InfoAlert had to supply it; Priority is virtual with a "
                + "default of 3, so leaving it alone is a decision - reread README ex3.");

        Teach.Equal("[PAGE/1] db down", new PageAlert("db down").Render(),
            "PageAlert supplies both - reread README ex3.");

        Alert info = new InfoAlert("x");
        Teach.Equal(3, info.Priority, "The inherited default really is 3.");
        Teach.Equal("INFO", info.Severity, "...and the override is reached through the base type.");
    }

    [Fact]
    public void Ex4_SealedOverrideAndTheOnlyDoorItLeavesOpen()
    {
        Teach.Equal("signal", new Signal().Kind, "The virtual base version.");
        Teach.Equal("beacon", new Beacon().Kind, "The sealed override.");
        Teach.Equal("strobe", new Strobe().Kind,
            "Through a Strobe-typed reference, the `new` member is the one you see - reread "
                + "README ex4.");

        Teach.Equal("signal", Signals.KindOf(new Signal()), "Dispatch to the base.");
        Teach.Equal("beacon", Signals.KindOf(new Beacon()), "Dispatch to the override.");
        Teach.Equal("beacon", Signals.KindOf(new Strobe()),
            "And here is the whole point: through a Signal-typed reference a Strobe reports "
                + "\"beacon\", because `new` HIDES rather than overrides - there is no entry in "
                + "the virtual table for it - reread README ex4.");

        Beacon asBeacon = new Strobe();
        Teach.Equal("beacon", asBeacon.Kind,
            "One level up is enough to lose the hidden member - the STATIC type decides "
                + "- reread README ex4.");
    }

    [Fact]
    public void Ex5_ProtectedIsForYourChildren()
    {
        AuditedStock stock = new AuditedStock(10);

        Teach.Equal(10, stock.Units, "The opening balance came through the base constructor.");
        Teach.Equal(0, stock.Movements, "Nothing has moved yet.");

        stock.Receive(5);
        Teach.Equal(15, stock.Units,
            "Receive reaches the base class's protected Increase - reread README ex5.");
        Teach.Equal(1, stock.Movements, "...and counts the movement.");

        Teach.True(!stock.Ship(20), "There are not 20 units to ship.");
        Teach.Equal(15, stock.Units, "...so nothing left the shelf...");
        Teach.Equal(1, stock.Movements,
            "...and a REFUSED shipment is not a movement. The derived class has to read the "
                + "protected method's answer rather than assume it worked - reread README ex5.");

        Teach.True(stock.Ship(5), "Five is available.");
        Teach.Equal(10, stock.Units, "...so five leave...");
        Teach.Equal(2, stock.Movements, "...and that one counts.");

        Teach.True(stock.Ship(10), "Shipping every remaining unit is allowed...");
        Teach.Equal(0, stock.Units, "...and empties the shelf exactly.");

        Teach.Throws<ArgumentOutOfRangeException>(() => stock.Receive(-1),
            "The guard lives in the base class, so both subclasses inherit it - reread README ex5.");
        Teach.Throws<ArgumentOutOfRangeException>(() => stock.Ship(-1), "Both directions.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new AuditedStock(-1), "And the opening balance.");
    }

    [Fact]
    public void Ex6_WhatRunsWhenAndTheTrapItSets()
    {
        Panel panel = new Panel("Home");

        Teach.Equal("Widget ctor | Panel.Configure sees title=null | Panel ctor",
            string.Join(" | ", panel.Trace),
            "The base constructor runs FIRST and its call to the virtual Configure lands on "
                + "Panel's override - before Panel's own constructor body has set the field. "
                + "That is why calling a virtual method from a constructor is a trap - reread "
                + "README ex6.");

        Teach.Equal("Home", panel.Title,
            "By the time construction has finished the title is set - the object is fine, it "
                + "was only fine LATE - reread README ex6.");

        Panel second = new Panel("Other");
        Teach.Equal(3, second.Trace.Count,
            "Each object gets its own trace: the List field initialiser runs per instance.");
    }

    [Fact]
    public void Ex7_ThreeLevelsAndBaseAtEveryStep()
    {
        Teach.Equal("sms: hello", new SmsMessage("hello").Envelope(),
            "SmsMessage supplies only the channel and inherits the envelope - reread README ex7.");

        Teach.Equal("[Update] email: hello", new EmailMessage("hello", "Update").Envelope(),
            "EmailMessage puts the subject in front of the inherited envelope - reread README ex7.");

        Teach.Equal("!! [Update] email: hello !!",
            new UrgentEmailMessage("hello", "Update").Envelope(),
            "And the third level wraps the SECOND level's output, not the first's: each `base.` "
                + "call goes exactly one step up - reread README ex7.");

        Message asBase = new UrgentEmailMessage("hello", "Update");
        Teach.Equal("email", asBase.Channel,
            "UrgentEmailMessage inherits Channel from EmailMessage without restating it.");
        Teach.Equal("!! [Update] email: hello !!", asBase.Envelope(),
            "...and dispatch through the base type still reaches the most derived Envelope.");
    }

    [Fact]
    public void Ex8_AHierarchyThatContainsItself()
    {
        Expr leaf = new Literal(42);
        Teach.Equal(42, leaf.Evaluate(), "A literal evaluates to itself.");
        Teach.Equal("42", leaf.ToText(), "...and prints as itself.");
        Teach.Equal(1, leaf.NodeCount(), "...and is one node.");

        Expr sum = new Add(new Literal(1), new Multiply(new Literal(2), new Literal(3)));
        Teach.Equal(7, sum.Evaluate(),
            "1 + (2 * 3). Each node asks its children for their values and never looks at what "
                + "KIND of children they are - reread README ex8.");
        Teach.Equal("(1 + (2 * 3))", sum.ToText(),
            "Fully bracketed, with the nesting coming from the recursion rather than from any "
                + "precedence rule you wrote - reread README ex8.");
        Teach.Equal(5, sum.NodeCount(),
            "Two operators and three literals. NodeCount is 1 plus both sides, which is the "
                + "same recursion shape again - reread README ex8.");

        Expr product = new Multiply(new Add(new Literal(1), new Literal(2)), new Literal(3));
        Teach.Equal(9, product.Evaluate(), "(1 + 2) * 3 is 9, not 7 - the tree IS the precedence.");
        Teach.Equal("((1 + 2) * 3)", product.ToText(), "...and the brackets show it.");
        Teach.Equal(5, product.NodeCount(), "Same five nodes, different shape.");

        Expr deep = new Add(new Literal(1), new Add(new Literal(2), new Add(new Literal(3), new Literal(4))));
        Teach.Equal(10, deep.Evaluate(), "Depth costs nothing: the recursion does not care.");
        Teach.Equal(7, deep.NodeCount(), "Three adds and four literals.");
    }
}
