## Hint 1

There are two strings here and the stub only has one. What the user typed
belongs in the box exactly as they typed it; what the server is going to be
sent is that string trimmed and upper-cased. Everything else — the message, the
disabled button — is a question about the second one.

## Hint 2

Normalising inside `onChange` and storing that is the tempting shortcut, and it
means the user cannot type a space at all. Keep the raw value in state and
derive the code during render.
