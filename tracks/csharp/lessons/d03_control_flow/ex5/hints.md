## Hint 1

One switch expression, eight arms, tried top to bottom. The whole exercise is
ordering them so the specific cases get their turn before the general ones.

Four pattern kinds appear: the constant pattern (`null`, `0`), the type pattern
(`int`, `string`), the property pattern (`string { Length: 0 }`) and a
relational pattern combined with a type (`int and < 0`).

## Hint 2

The order that works:

```
null                    // first: no type pattern ever matches null
0                       // constant beats type
int and < 0             // still more specific than plain int
int n                   // captures the value for the message
string { Length: 0 }    // property pattern
string s
int[] a
_
```

`int and < 0` combines a type pattern with a relational one without declaring a
variable you never use.

The `3.5` case is worth pausing on: patterns do **not** perform numeric
conversions, so a boxed `double` never matches `int` even when the value is a
whole number. That is the same rule that makes `(object)1 is long` false, and
it surprises people who expect pattern matching to behave like `==`.
