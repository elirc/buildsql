## Hint 1

Every method body here is a single string literal. There is nothing to work out
in the implementation at all - the exercise is reading the gate afterwards and
being able to predict every answer.

So: write the five one-liners, run the gate, and then for each assertion say
out loud *why* the compiler chose that overload before you accept the green.

## Hint 2

The rules the gate is exercising, in the order the compiler applies them:

1. Collect the applicable candidates - the ones whose parameters the arguments
   convert to implicitly.
2. Prefer a method applicable in **normal** form over one applicable only in
   **expanded** (params) form. That is why `Describe(1)` is not "params".
3. Among the rest, pick the one whose parameter type is most specific: a
   conversion exists from `int` to `long` and to `double`, so `int` is better
   than both, and any of them beats `object`.

`(short)3` is applicable to `int`, `long`, `double` and `object`, and `int`
wins by rule 3. `1.5f` is applicable to `double` and `object`, and widening
beats boxing. `true` converts to nothing but `object`.

If you can also say why `Describe(null)` would not compile against this set,
you have understood it properly.
