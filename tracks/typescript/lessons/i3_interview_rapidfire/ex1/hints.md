## Hint 1

`any` in a signature is the thing this whole part of the track is against.
Change it to `unknown` and let the compiler tell you which checks are missing.

Three questions decide the body: is it already a number, is it a string that
means a number, and is `NaN` a number for this purpose.

## Hint 2

`Number.isFinite` answers the third question: it is `false` for `NaN` and for
both infinities, and unlike the global `isFinite` it does not coerce its
argument.

Watch `Number("")`, which is `0` - an empty string is not a number for this
function, so trim and check before you convert.

## Hint 3

`unknown` in. If `typeof value === "number"`, return it when finite and `null`
otherwise. If it is a non-empty string, convert with `Number(...)` and apply the
same finite check. Everything else is `null`.

Left to you: whether `"0x1f"`, `"1e3"` and `" 42 "` should parse. `Number()`
accepts all three; `parseInt` and `parseFloat` behave differently again - and
naming that difference is the follow-up question.
