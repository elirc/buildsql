// d08_polymorphism / ex7 - a chain where each link decides what happens next.
// See lessons/d08_polymorphism/README.md, "Exercise 7".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Middleware
{
    protected Middleware(Middleware? next)
    {
        Next = next;
    }

    /// <summary>The next link, or null at the end of the chain.</summary>
    protected Middleware? Next { get; }

    /// <summary>Handle the request - and decide whether to pass it on.</summary>
    public abstract string Handle(string request);

    /// <summary>
    /// Hand the request to the next link, or give it straight back when this is
    /// the last link.
    /// </summary>
    protected string Continue(string request)
    {
        return Next is null ? request : Next.Handle(request);
    }
}

public class UpperMiddleware : Middleware
{
    public UpperMiddleware(Middleware? next)
        : base(next)
    {
    }

    /// <summary>Upper-cases the request (invariant) and passes it on.</summary>
    public override string Handle(string request) => Continue(request.ToUpperInvariant());
}

public class TagMiddleware : Middleware
{
    public TagMiddleware(Middleware? next)
        : base(next)
    {
    }

    /// <summary>Passes the request on unchanged, then wraps the ANSWER in &lt; and &gt;.</summary>
    public override string Handle(string request) => "<" + Continue(request) + ">";
}

public class BlockMiddleware : Middleware
{
    public BlockMiddleware(Middleware? next)
        : base(next)
    {
    }

    /// <summary>
    /// A request containing "bad" (ignoring case) never reaches the rest of the
    /// chain: the answer is "BLOCKED". Anything else is passed on.
    /// </summary>
    public override string Handle(string request)
    {
        if (request.Contains("bad", StringComparison.OrdinalIgnoreCase))
        {
            return "BLOCKED";
        }

        return Continue(request);
    }
}
