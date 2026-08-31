## Hint 1

A type alias may refer to itself through an array:

```ts
export type TextNode = string | number | readonly TextNode[];
```

Then the body has three cases, and two of them are leaves that return
immediately. Whatever is left after two `typeof` checks is the array.

## Hint 2

Recurse into each child, and drop the renderings that come out empty *before*
joining. Joining first and cleaning up afterwards is how you end up with double
spaces, which the gate checks for.

`parts.join(" ")` on an empty list is `""`, so the empty array case needs no
branch of its own.

Left to you: recursion, or an explicit stack. Recursion is four lines; the stack
version is what you reach for when the tree might be ten thousand deep.
