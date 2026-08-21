// 04_inheritance_polymorphism / ex4 - one loop, many implementations; and sealed.
// See lessons/04_inheritance_polymorphism/README.md, "Exercise 4".

namespace CSharpDojo.L04_InheritancePolymorphism;

public abstract class Notification
{
    protected Notification(string recipient)
    {
        Recipient = recipient;
    }

    public string Recipient { get; }

    /// <summary>One line, ready to send.</summary>
    public abstract string Render();
}

public class EmailNotification : Notification
{
    public EmailNotification(string recipient, string subject)
        : base(recipient)
    {
        Subject = subject;
    }

    public string Subject { get; }

    /// <summary>"email to ada@example.com: Welcome"</summary>
    public override string Render()
    {
        throw new NotImplementedException("ex4: EmailNotification.Render is not implemented yet - edit this file.");
    }
}

/// <summary>
/// The last word on SMS. Nobody may derive from this class - add the modifier
/// that says so.
/// </summary>
public class SmsNotification : Notification
{
    public SmsNotification(string recipient, string text)
        : base(recipient)
    {
        Text = text;
    }

    public string Text { get; }

    /// <summary>"sms to 07700900123: Your code is 1234"</summary>
    public override string Render()
    {
        throw new NotImplementedException("ex4: SmsNotification.Render is not implemented yet - edit this file.");
    }
}

public static class Notifier
{
    /// <summary>
    /// Render every notification, in order, joined by " | ". One loop, no type
    /// checks: that is the point.
    /// </summary>
    public static string RenderAll(IEnumerable<Notification> notifications)
    {
        throw new NotImplementedException("ex4: RenderAll is not implemented yet - edit this file.");
    }
}
