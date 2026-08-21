## Hint 1

Three tiny methods, and each one is three statements written in the order the
doc comment gives them. Do not reorder them, do not simplify: the ordering is
what makes the answer interesting.

Two of the three are the same code with one keyword different, exactly as in
lesson 01.

## Hint 2

```csharp
object boxed = counter;      // the box gets a COPY
counter.Value = 99;          // the original moves
return ((Counter)boxed).Value;   // unbox and read
```

For the list versions:

```csharp
List<Counter> counters = new List<Counter> { new Counter { Value = 1 } };
Counter copy = counters[0];
copy.Value = 99;
return counters[0].Value;
```

and the same again with `CounterObject`.

## Hint 3

Before you run the gate, write down your three predictions. The middle one is
the one people get wrong, and the reason is worth saying out loud: a `List<T>`
indexer returns a **copy** for a struct, so `counters[0].Value = 99` does not
even compile — the compiler knows the assignment would be thrown away.

(An *array* of structs behaves differently: `array[0].Value = 99` does compile,
because array indexing produces a real reference into the array's storage. Same
line, two containers, two behaviours.)

Left to you: try writing `counters[0].Value = 99;` in the list version and read
the compiler error. It is one of the clearest error messages in C#.
