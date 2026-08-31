## Hint 1

Write the grammar out before you write any code:

```
number := sign? digit* ( '.' digit+ )?
```

and then read it as instructions: consume an optional sign, consume digits,
optionally consume a point and *at least one* digit. Two facts have to be true
at the end - you reached the end of the string, and you saw at least one digit
somewhere.

## Hint 2

Keep one `index` and move it forward; never move it backwards. Each step is
"while the character here is what I want, advance".

```csharp
if (index < text.Length && (text[index] == '+' || text[index] == '-')) index++;
while (index < text.Length && char.IsAsciiDigit(text[index])) { index++; wholeDigits++; }
```

The final `return` is the part people forget:

```csharp
return index == text.Length && wholeDigits + fractionDigits > 0;
```

`index == text.Length` is what rejects `"1.2.3"`, `"1a"` and `" 1"` - the
scanner stops happily at the leftover character, and only the end-of-input
check notices. Without it your scanner recognises *prefixes*, which is a
different and much less useful function.

`char.IsAsciiDigit` is deliberate: `char.IsDigit` is true for digits in every
writing system, including ones no `Parse` in your program will accept.
