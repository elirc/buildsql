## Hint 1

Use an indexed `for` loop, not a `foreach` - because the `"--key value"` form
has to *consume the next token*, and only an index lets you skip it.

At each token there are exactly three shapes: not an option (skip), an option
containing `=` (split it), an option without one (look ahead).

## Hint 2

```csharp
for (int i = 0; i < args.Length; i++)
{
    string token = args[i];
    if (!token.StartsWith("--", StringComparison.Ordinal)) continue;
    ...
    if (i + 1 < args.Length && !args[i + 1].StartsWith("--", StringComparison.Ordinal))
    {
        options[key] = args[i + 1];
        i++;                       // consumed, so do not read it again
    }
    else options[key] = "true";
}
```

The `i++` inside the loop body is what stops `"3"` in `--level 3` being treated
as a positional argument on the next pass. Incrementing the loop variable from
inside the body is normally a smell; in a hand-written scanner it is the
standard technique, and worth being able to defend.

`IndexOf('=')` rather than `Split('=')`: a value may legitimately contain an
`=` (think `--filter=a=b`), and splitting at the first one is the rule every
real parser uses.

Left to you: whether an unknown `--flag` at the very end should be `"true"` or
an error. The specification here says `"true"`; know that real tools differ.
