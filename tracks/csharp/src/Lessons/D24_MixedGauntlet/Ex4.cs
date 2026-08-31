// d24_mixed_gauntlet / ex4 - delegates in a dictionary, with the errors named.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 4".

namespace CSharpDojo.D24_MixedGauntlet;

public sealed class Commands
{
    private readonly Dictionary<string, Func<string, string>> _handlers =
        new Dictionary<string, Func<string, string>>();

    private readonly List<string> _names = new List<string>();

    /// <summary>The registered names, in registration order.</summary>
    public IReadOnlyList<string> Names => _names;

    /// <summary>
    /// Registers a handler. A name that is already registered is an
    /// ArgumentException, and nothing about the existing registration changes.
    /// </summary>
    public void Register(string name, Func<string, string> handler)
    {
        throw new NotImplementedException("ex4: Register is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Runs the named command on the argument. An unknown name is a
    /// KeyNotFoundException; anything the handler throws is wrapped in an
    /// InvalidOperationException whose message is "command failed: &lt;name&gt;"
    /// and whose InnerException is the original.
    /// </summary>
    public string Run(string name, string argument)
    {
        throw new NotImplementedException("ex4: Run is not implemented yet - edit this file.");
    }
}
