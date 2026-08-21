// 05_interfaces / ex3 - a default interface method, and overriding it.
// See lessons/05_interfaces/README.md, "Exercise 3".

namespace CSharpDojo.L05_Interfaces;

public interface IAuditEvent
{
    string Actor { get; }

    string Action { get; }

    /// <summary>
    /// "ada performed login". A default implementation living in the interface
    /// itself: implementers get it for free unless they say otherwise.
    /// </summary>
    string Describe()
    {
        throw new NotImplementedException("ex3: the IAuditEvent.Describe default is not implemented yet - edit this file.");
    }
}

/// <summary>Takes the default Describe as it stands.</summary>
public class LoginEvent : IAuditEvent
{
    public LoginEvent(string actor)
    {
        Actor = actor;
    }

    public string Actor { get; }

    public string Action => "login";
}

/// <summary>Wants its own wording.</summary>
public class AdminEvent : IAuditEvent
{
    public AdminEvent(string actor, string action)
    {
        Actor = actor;
        Action = action;
    }

    public string Actor { get; }

    public string Action { get; }

    /// <summary>"[ADMIN] root performed delete-user"</summary>
    public string Describe()
    {
        throw new NotImplementedException("ex3: AdminEvent.Describe is not implemented yet - edit this file.");
    }
}
