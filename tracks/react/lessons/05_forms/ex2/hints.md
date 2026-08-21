## Hint 1
Two more controls, two more pieces of state, and one difference worth
memorising: a text box and a `<select>` are controlled through `value`, but a
checkbox is controlled through `checked`. Its `value` is the string `"on"`
whether it is ticked or not.

## Hint 2
```tsx
<select id="theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
<input id="emails" type="checkbox" checked={emails} onChange={(event) => setEmails(/* … */)} />
```

In React you put `value` on the `<select>` itself rather than marking an
`<option selected>` — that is a deliberate departure from plain HTML, and it
keeps the whole control in one place.

## Hint 3
The summary reads exactly `Theme: dark, emails on`, with the theme being the
option's `value` (lower case) rather than its visible label. The on/off word is
a decision made from the boolean, the same shape as the plural in lesson 00.
