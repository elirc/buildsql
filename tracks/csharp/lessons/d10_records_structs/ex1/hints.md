## Hint 1

The record itself is already declared for you. What you write is the three
methods - and all three are one line.

`Describe` must *deconstruct*: a positional record generates a `Deconstruct`,
so `(string name, string department, int level) = employee;` works.

## Hint 2

```csharp
(string name, string department, int level) = employee;
return $"{name} works in {department} at level {level}";
```

`Print` is `employee.ToString()`. Do not build the string yourself - the point
is to see what the compiler generated: the type name, a brace, `Name = value`
for each component, a closing brace.

`SamePerson` is `a == b`. A record overloads `==` to compare by value, which is
the one thing a record does that a class does not do for free. Note the gate
also checks `GetHashCode` agrees - you get that automatically, and it is what
makes records safe as dictionary keys.
