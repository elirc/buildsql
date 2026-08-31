## Hint 1

The seam is one line: `const deps = { ...someDefaults, ...overrides }`. Spread
is a shallow merge, which is exactly right here — a caller either replaces a
whole dependency or does not mention it. Everything the service does afterwards
goes through `deps`, never through an import.

## Hint 2

The trap is where `someDefaults` comes from. Written as a module-level constant,
the store inside it is created once when the module is first imported, so every
service in the process appends to the same array — invisible until a second
test runs and finds the first one's data.

Make it a function that builds the defaults fresh, and call it inside
`createService`. The same reasoning applies to the default id counter: it has to
count per service, which means the `let` lives inside that function too.

`history()` returning a copy rather than the live array is the last decision,
and the reason is the same one as ex2's `names()`.
