// d07_inheritance / ex8 - a hierarchy that contains itself.
// See lessons/d07_inheritance/README.md, "Exercise 8".

namespace CSharpDojo.D07_Inheritance;

public abstract class Expr
{
    /// <summary>The number this expression works out to.</summary>
    public abstract int Evaluate();

    /// <summary>The expression written out, fully bracketed.</summary>
    public abstract string ToText();

    /// <summary>How many Expr objects this expression is made of, itself included.</summary>
    public abstract int NodeCount();
}

public class Literal : Expr
{
    public Literal(int value)
    {
        Value = value;
    }

    public int Value { get; }

    public override int Evaluate()
    {
        throw new NotImplementedException("ex8: Literal.Evaluate is not implemented yet - edit this file.");
    }

    /// <summary>Just the number.</summary>
    public override string ToText()
    {
        throw new NotImplementedException("ex8: Literal.ToText is not implemented yet - edit this file.");
    }

    /// <summary>A literal is one node.</summary>
    public override int NodeCount()
    {
        throw new NotImplementedException("ex8: Literal.NodeCount is not implemented yet - edit this file.");
    }
}

// Written for you: the shared shape of every two-sided operation.
public abstract class BinaryExpr : Expr
{
    protected BinaryExpr(Expr left, Expr right)
    {
        Left = left;
        Right = right;
    }

    public Expr Left { get; }

    public Expr Right { get; }

    /// <summary>The operator character used by ToText.</summary>
    protected abstract char Symbol { get; }

    /// <summary>"(1 + 2)" - always bracketed, spaces around the symbol.</summary>
    public override string ToText() => $"({Left.ToText()} {Symbol} {Right.ToText()})";

    /// <summary>This node plus everything below it, on both sides.</summary>
    public override int NodeCount()
    {
        throw new NotImplementedException("ex8: BinaryExpr.NodeCount is not implemented yet - edit this file.");
    }
}

public class Add : BinaryExpr
{
    public Add(Expr left, Expr right)
        : base(left, right)
    {
    }

    protected override char Symbol =>
        throw new NotImplementedException("ex8: Add.Symbol is not implemented yet - edit this file.");

    public override int Evaluate()
    {
        throw new NotImplementedException("ex8: Add.Evaluate is not implemented yet - edit this file.");
    }
}

public class Multiply : BinaryExpr
{
    public Multiply(Expr left, Expr right)
        : base(left, right)
    {
    }

    protected override char Symbol =>
        throw new NotImplementedException("ex8: Multiply.Symbol is not implemented yet - edit this file.");

    public override int Evaluate()
    {
        throw new NotImplementedException("ex8: Multiply.Evaluate is not implemented yet - edit this file.");
    }
}
