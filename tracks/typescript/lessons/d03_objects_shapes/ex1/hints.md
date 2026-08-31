## Hint 1

Two jobs. Give `explicit` a real type - it is an optional boolean, so its type
inside the body is `boolean | undefined`. Then decide the suffix.

The prompt says `explicit: false` and a missing `explicit` render identically,
so the question you ask is about the *value*, not about the key.

## Hint 2

`"explicit" in track` asks whether the key exists, which answers the wrong
question. `track.explicit === true` (or plain truthiness) answers the right one.

Build the suffix into its own `const` and the return becomes one template
literal.

Left to you: `=== true` or plain truthiness. They agree here; say which you
would use in a codebase where the flag might be a string.
