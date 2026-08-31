## Hint 1

One call turns a section into an instance of your class. You do not have to read
the keys individually, and you do not have to defend the defaults — the binder
only writes what it found.

There is a null to handle: a section that does not exist at all.

## Hint 2

```csharp
var settings = configuration.GetSection("Dojo:D08:Mailer").Get<MailerSettings>()
               ?? new MailerSettings();
```

`Get<T>` constructs the object — running the property initialisers that hold
your defaults — and then overwrites only the properties configuration mentions.
That is why `Retries` stays 3.

`Bind(existingInstance)` is the other spelling, and it is the one to use when
you already have an object to fill.
