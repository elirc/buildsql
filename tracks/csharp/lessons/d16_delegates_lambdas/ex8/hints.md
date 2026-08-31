## Hint 1

A rule is a `Func<T, bool>` and a message is a string, and they belong
together - so store pairs, not two parallel lists. A `List<(string, Func<T,
bool>)>` is enough; the field initialiser runs per instance, which is what
keeps two validators apart.

Fix the polarity before you write anything: a rule answers `true` when the item
is *fine*, and its message is reported when it answers `false`.

## Hint 2

```csharp
public Validator<T> Require(string message, Func<T, bool> rule)
{
    _rules.Add((message, rule));
    return this;   // `this`, not a new Validator<T>
}
```

Returning a fresh validator is the mistake that makes the fluent chain compile,
run, and silently keep only the last rule.

`Check` walks `_rules` in order, adds the message of every rule that answered
false, and returns the list - it does not stop at the first failure, because
a form that reports one problem per attempt is worse than one that reports
them all.

`IsValid` should be expressed in terms of `Check` rather than repeating the
loop; decide for yourself whether that is worth the extra list allocation on
the happy path, and what you would do instead if it were not.
