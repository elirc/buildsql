## Hint 1

A class already occupies two declaration spaces: `Money` is a value (the
constructor) and a type (an instance). Merging a namespace onto it adds a third,
which is what makes `Money.Currency` a type and `Money.zero` a value under one
name.

## Hint 2

The class body may refer to `Money.Currency` even though the namespace is
written below it - types are hoisted, and the merge happens before either
declaration is checked. The runtime members are a different matter: the
namespace has to come after the class, or the assignment has nothing to attach
to.

## Hint 3

`plus` needs two overload signatures above one implementation, the same shape as
ex2. The currency check belongs in the `Money` branch only - adding a bare number
cannot be a currency mismatch.

Left to you: whether `SYMBOLS` should be `Record<Currency, string>` or frozen
with `as const`. One of them fails to compile the moment a third currency is
added to the union, which is either the feature or the problem.
