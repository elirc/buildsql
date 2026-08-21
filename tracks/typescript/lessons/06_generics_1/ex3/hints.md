## Hint 1

Two separate type parameters live in this exercise, and telling them apart is
the whole lesson. One belongs to the *interface* - what this box holds. The
other belongs to the *method* - what the transform turns it into, decided fresh
at every `map` call.

## Hint 2

An interface takes type parameters the same way a function does, and a method
inside it can declare its own:

```ts
interface Cell<T> {
  readonly value: T;
  replace<U>(next: U): Cell<U>;
}
```

`box` itself is a generic function returning `Box<T>`. Its body returns an
object literal with the value and a `map` method - and the easiest `map` calls
`box` again with the transformed value.

## Hint 3

Declare `interface Box<T>` with `readonly value: T` and
`map<U>(transform: (value: T) => U): Box<U>`. Then
`export function box<T>(value: T): Box<T>` returning
`{ value, map: ... }` where `map` builds a new box from `transform(value)`.

Left to you: whether `map` is a method shorthand or an arrow property, and
whether the returned box is built by recursion into `box` or by another object
literal. One of those choices makes adding a second method much cheaper later.
