## Hint 1

Two bodies, in two very different places. One lives *inside the interface* —
that is the new thing — and one lives in the class that wants different
wording.

`LoginEvent` gets no new code at all. If you find yourself adding a `Describe`
to it, you have missed the point of the exercise.

## Hint 2

Inside the interface, a member with a body is a *default implementation*. It
can read the interface's other members, because every implementer promises to
have them:

```csharp
string Describe()
{
    return $"{Actor} performed {Action}";
}
```

`AdminEvent.Describe` is an ordinary public method on the class returning
`"[ADMIN] "` in front of the same sentence.

## Hint 3

The detail that trips everyone up: a default interface member is only reachable
through the **interface** type. `new LoginEvent("ada").Describe()` does not
compile; `((IAuditEvent)new LoginEvent("ada")).Describe()` does. Look at how the
gate declares its variables — `IAuditEvent login = new LoginEvent("ada");` — and
you can see it working around exactly that.

`AdminEvent`'s own `Describe` *is* on the class, so it is reachable both ways.
Whether that asymmetry is a feature or a wart is a genuine debate; knowing it
exists is what interviews are checking for.
