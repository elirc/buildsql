## Hint 1
Two different things are being checked, and they live in two different places
in the tag: what the user reads (between the tags) and where the link goes (an
attribute). Both need a value from props, and both use braces — but for
different reasons.

## Hint 2
In children position, `{name}` splices a value into the text:
`<a>Open {name}</a>`. In attribute position, `href={href}` sets the attribute
to the *value* of the prop, whereas `href="href"` sets it to the literal
five-character string `href`. That second form is the mistake this exercise
is here to burn out of you.

## Hint 3
The visible text is `Open ` followed by the name — one literal word, one space,
one interpolation. Watch the space: `Open{name}` renders `OpenAda`, because
JSX only keeps whitespace that sits between text on the same line.
