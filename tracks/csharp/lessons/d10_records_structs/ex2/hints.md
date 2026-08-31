## Hint 1

`booking with { Nights = 5 }` makes a copy of the record with one component
replaced. It never modifies the original, and it is an expression - so it can
be returned directly.

The two computed properties go in the record's body, after the positional
parameter list, in braces.

## Hint 2

```csharp
public record Booking(string Guest, int Nights, int NightlyRate)
{
    public int Total => Nights * NightlyRate;
}
```

and

```csharp
return booking with { Nights = booking.Nights + extraNights };
```

`Total` is computed, so it follows the copy automatically - there is nothing to
keep in step.

The validation is worth noticing: `with` performs no checks at all. It calls
the copy constructor, not your primary constructor's body, so any invariant you
enforce has to live either in an `init` accessor (as in d06 ex7) or in the
method doing the copying. That is the one real gap in records-as-immutable-data,
and interviewers like asking about it.
