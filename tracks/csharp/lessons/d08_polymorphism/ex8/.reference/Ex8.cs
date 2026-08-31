// d08_polymorphism / ex8 - a registry that dispatches by name.
// See lessons/d08_polymorphism/README.md, "Exercise 8".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Command
{
    /// <summary>The word that selects this command. Lower case.</summary>
    public abstract string Name { get; }

    /// <summary>Do the thing. The argument may be "".</summary>
    public abstract string Execute(string argument);
}

public class EchoCommand : Command
{
    /// <summary>"echo".</summary>
    public override string Name => "echo";

    /// <summary>The argument, unchanged.</summary>
    public override string Execute(string argument) => argument;
}

public class UpperCommand : Command
{
    /// <summary>"upper".</summary>
    public override string Name => "upper";

    /// <summary>The argument, upper-cased with the invariant culture.</summary>
    public override string Execute(string argument) => argument.ToUpperInvariant();
}

public class HelpCommand : Command
{
    private readonly CommandBus _bus;

    public HelpCommand(CommandBus bus)
    {
        _bus = bus;
    }

    /// <summary>"help".</summary>
    public override string Name => "help";

    /// <summary>Every registered name, sorted ordinally, joined with ", ".</summary>
    public override string Execute(string argument) => string.Join(", ", _bus.Names);
}

public class CommandBus
{
    private readonly Dictionary<string, Command> _commands = new Dictionary<string, Command>();

    /// <summary>
    /// Add a command, replacing any earlier one with the same name.
    /// Returns this bus so registrations can be chained.
    /// </summary>
    public CommandBus Register(Command command)
    {
        _commands[command.Name] = command;
        return this;
    }

    /// <summary>Every registered name, sorted ordinally.</summary>
    public IReadOnlyList<string> Names =>
        _commands.Keys.OrderBy(name => name, StringComparer.Ordinal).ToList();

    /// <summary>
    /// Split the line at the FIRST space: the first word (lower-cased) selects
    /// the command and the rest is its argument, trimmed. A line with no space
    /// is a command with an empty argument. A blank line, or a word that is not
    /// registered, gives "unknown command: WORD" (with the word as typed, or ""
    /// for a blank line).
    /// </summary>
    public string Run(string line)
    {
        string trimmed = line.Trim();
        int space = trimmed.IndexOf(' ');
        string word = space < 0 ? trimmed : trimmed.Substring(0, space);
        string argument = space < 0 ? "" : trimmed.Substring(space + 1).Trim();

        if (_commands.TryGetValue(word.ToLowerInvariant(), out Command? command))
        {
            return command.Execute(argument);
        }

        return $"unknown command: {word}";
    }
}
