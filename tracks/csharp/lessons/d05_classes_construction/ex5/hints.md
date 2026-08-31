## Hint 1

`readonly` on a field means the *reference* cannot be reassigned after
construction. It says nothing at all about the object the reference points to -
a `readonly string[]` is an array whose elements anyone holding it can still
change.

So there are two leaks to close, and they are symmetrical: the array coming in,
and the array going out.

## Hint 2

`(string[])options.Clone()` makes a shallow copy; so does `options.ToArray()`.
Use one in the constructor and one in `Options()`.

For an array of `string` a shallow copy is enough, because strings are
immutable. If the elements were mutable objects you would have the same problem
one level down - which is the difference between a shallow and a deep copy, and
a question worth asking of any API that hands you a collection.

The alternative design is to return `IReadOnlyList<string>` and skip the copy.
That is cheaper and is what ex4 does; it is not what this exercise asks for,
because the point here is to see the copy. Be ready to say when you would
choose each.
