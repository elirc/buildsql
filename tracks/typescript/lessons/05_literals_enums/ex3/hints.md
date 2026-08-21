## Hint 1

Finish the enum first - the gate uses `Status.Published` and `Status.Retired`,
and their string values matter because the gate compares them to `"published"`
and `"retired"`.

Then write the label function. Its three branches compare against the enum
members, not against raw strings.

## Hint 2

A string enum member is written `Name = "value"`:

```ts
enum Colour {
  Red = "red",
  Blue = "blue",
}
```

At runtime `Colour.Red` really is the string `"red"`, so `JSON.stringify` and
your database see something readable. At compile time it is *nominal*:
`const c: Colour = "red"` is an error, because the only things assignable to
`Colour` are its own members. That is the property this exercise is testing.

## Hint 3

Add `Published = "published"` and `Retired = "retired"`, then `switch (status)`
with `case Status.Draft:` and friends, returning the three labels from the
README - including the parenthesised suffixes on two of them.

Left to you: whether you would use an enum here at all in your own code. Write
the same thing as a literal union and compare - which one needs an import at
every call site, and which one survives `JSON.parse` without a cast?
