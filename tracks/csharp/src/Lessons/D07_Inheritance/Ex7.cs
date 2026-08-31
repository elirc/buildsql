// d07_inheritance / ex7 - three levels, and base at every step.
// See lessons/d07_inheritance/README.md, "Exercise 7".

namespace CSharpDojo.D07_Inheritance;

public abstract class Message
{
    protected Message(string body)
    {
        Body = body;
    }

    public string Body { get; }

    /// <summary>Which channel this goes out on.</summary>
    public abstract string Channel { get; }

    /// <summary>"sms: hello" - the channel, a colon, a space, the body.</summary>
    public virtual string Envelope() => $"{Channel}: {Body}";
}

public class SmsMessage : Message
{
    public SmsMessage(string body)
        : base(body)
    {
    }

    /// <summary>"sms". Envelope is NOT overridden here.</summary>
    public override string Channel =>
        throw new NotImplementedException("ex7: SmsMessage.Channel is not implemented yet - edit this file.");
}

public class EmailMessage : Message
{
    public EmailMessage(string body, string subject)
        : base(body)
    {
        Subject = subject;
    }

    public string Subject { get; }

    /// <summary>"email".</summary>
    public override string Channel =>
        throw new NotImplementedException("ex7: EmailMessage.Channel is not implemented yet - edit this file.");

    /// <summary>"[subject] " in front of whatever the base produced.</summary>
    public override string Envelope()
    {
        throw new NotImplementedException("ex7: EmailMessage.Envelope is not implemented yet - edit this file.");
    }
}

public class UrgentEmailMessage : EmailMessage
{
    public UrgentEmailMessage(string body, string subject)
        : base(body, subject)
    {
    }

    /// <summary>
    /// "!! " and " !!" around whatever the base produced. Channel is left
    /// alone - it is already right.
    /// </summary>
    public override string Envelope()
    {
        throw new NotImplementedException("ex7: UrgentEmailMessage.Envelope is not implemented yet - edit this file.");
    }
}
