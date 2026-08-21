## Hint 1

Four members, and the private constructor at the top of the file already does
the real work. `Ok` and `Fail` just call it with different arguments — that is
the *static factory* pattern, and it exists so the two ways of making a
`Result` have names.

Read the constructor's parameter order before you write them.

## Hint 2

Inside a generic type, `Result<T>` is how you refer to yourself:

```csharp
public static Result<T> Ok(T value)
{
    return new Result<T>(true, value, "");
}
```

`Fail` has no value to pass. `default!` is the usual "there is nothing here and
I know it" for an unconstrained `T` — `default(T)` is `null` for classes and
`0` for numbers, and the `!` silences the nullable warning.

`Value` needs a full property body: check `IsOk`, throw if not, otherwise hand
back the field.

## Hint 3

The design decision worth noticing: `Value` throws instead of returning
`default(T)` on a failed result. A silent zero or null would let a failure
travel quietly through three more methods before something notices, and by then
the stack trace points at the wrong place. Making the wrong access loud is the
whole reason this type is better than returning `(bool, T)`.

Left to you: whether `Error` should also throw when the result succeeded. The
gate wants `""`, on the grounds that "was there a problem?" is a reasonable
question to ask of any result — but the opposite argument is defensible, and
real `Result` types in the wild do it both ways.
