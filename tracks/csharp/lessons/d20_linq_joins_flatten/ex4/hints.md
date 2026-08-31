## Hint 1

Flattening loses the parent - once you have a line, the invoice it came from is
gone. `SelectMany` has an overload for exactly that: a second lambda that
receives both the original item and the flattened one.

For the numbering, ask yourself which sequence the index has to be counted
over.

## Hint 2

```csharp
invoices.SelectMany(invoice => invoice.Lines, (invoice, line) => $"{invoice.Number}/{line}");
```

`NumberedLines` cannot use that overload, because the number restarts inside
each invoice. Do the numbering in the inner sequence instead:

```csharp
invoices.SelectMany(invoice => invoice.Lines
    .Select((line, index) => $"{invoice.Number}#{index + 1}: {line}"));
```

An index taken over the flattened result would number the third line 3 even
though it is the first line of its invoice - which is the bug this exercise is
built to catch.

`Blank` exists to make a point: an invoice with no lines contributes zero rows
to a flatten and therefore cannot be seen in one. Finding it needs a separate,
unflattened pass.
