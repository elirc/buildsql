## Hint 1

Three small bodies and one keyword.

The two `Render` overrides are interpolated strings built from the properties
each class already has — note that `Recipient` lives on the base and is
available to both.

`RenderAll` is a loop that does not care what kind of notification it is
holding. If you catch yourself testing the type, stop: that is the code
`abstract` exists to delete.

## Hint 2

The two formats, exactly:

```
email to ada@example.com: Welcome
sms to 07700900123: Your code is 1234
```

For `RenderAll`, collect each `notification.Render()` into a `List<string>` and
finish with `string.Join(" | ", lines)` — the same collect-then-join shape as
lesson 02 ex1, which also gives you the empty case for free.

The keyword the gate checks for goes on the `SmsNotification` *class*
declaration, not on any member.

## Hint 3

```csharp
public static string RenderAll(IEnumerable<Notification> notifications)
{
    List<string> lines = new List<string>();
    foreach (Notification notification in notifications)
    {
        // one line each
    }
    return /* joined */;
}
```

`IEnumerable<Notification>` is the loosest thing you can ask for — anything you
can `foreach` over. Taking the loosest parameter type your code actually needs
is a habit worth starting now; lesson 08 explains what else it buys you.

The class modifier is the one that means "no further derivation". If you cannot
remember it, the gate's failure message names the property it checks
(`IsSealed`), which is a strong hint.
