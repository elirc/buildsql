## Hint 1

Walk the string from the END to the start. That removes the hardest part of
Luhn - "every second digit from the right" is a nuisance to work out from the
left when the length is unknown and separators are scattered through it.

Keep two counters: the running total, and how many *digits* you have seen
(which is not the same as how many characters you have visited).

## Hint 2

```csharp
for (int i = input.Length - 1; i >= 0; i--)
{
    char c = input[i];
    if (c == ' ' || c == '-') continue;
    if (!char.IsAsciiDigit(c)) return false;
    int digit = c - '0';
    if (seen % 2 == 1) { digit *= 2; if (digit > 9) digit -= 9; }
    total += digit;
    seen++;
}
```

`seen % 2 == 1` is the "every second digit" test, and it works because `seen`
counts digits rather than characters - so separators cannot shift the parity.

`c - '0'` converts a digit character to its value: `char` arithmetic promotes
to `int`, and the digits are contiguous in the character set.

Left to you: `digit -= 9` versus summing the two decimal digits of the doubled
value. They are the same for every input in range - be able to explain why.
