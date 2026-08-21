## Hint 1
An array of elements is a legal thing to put in JSX — React renders each item
in turn. So the question is how to turn an array of strings into an array of
elements, and the answer is the array method you already know.

## Hint 2
```tsx
<ul>
  {tags.map((tag) => (
    <li>…</li>
  ))}
</ul>
```

Watch the arrow function's body: `(tag) => (<li/>)` returns the element, while
`(tag) => { <li/> }` returns `undefined` and renders nothing.

## Hint 3
That version renders correctly and still fails the second assertion, because
React needs a `key` on every element produced by a map — a stable string that
identifies *which* item this is, so it can match items up across renders. The
tags here are unique strings, which makes the choice easy; the interesting
question of what to use when they are not is exercise 2.
