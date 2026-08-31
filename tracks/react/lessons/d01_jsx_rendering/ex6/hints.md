## Hint 1
The stub reaches for the escape hatch. Ask what the plain version does with a
string that happens to contain angle brackets - JSX has a rule about that, and
the rule is the whole answer.

## Hint 2
A value interpolated into JSX is inserted as a text node, never parsed as
markup. That is React's built-in defence against injected HTML, and the fix
here is to delete code rather than write it.
