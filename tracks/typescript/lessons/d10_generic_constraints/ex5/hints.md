## Hint 1

A default goes after the constraint: `K extends string | number = string`. That
is what makes `makeCache<number>()` legal with one type argument while
`makeCache<string, number>()` still lets a caller choose numeric keys.

Note the parameter order: the one you want to default comes last.

## Hint 2

The storage is a `Map<K, V>` declared inside `makeCache`, so every call gets its
own - the gate builds two caches and checks they do not share.

The four methods are one-line delegates to that map.

Left to you: an object literal of arrow functions, or a class. The literal keeps
`this` out of the conversation entirely.
