## Hint 1

The shipped handler is not wrong about *what* to do - it sweeps the right loans
in the right order. It is wrong about *whom to ask*. A dependency created with
`new` inside a method can never be substituted, so the effect happens somewhere
no test can observe.

## Hint 2

`IOverdueNotifier` is registered in `Model.cs`, mapped to `DeskLogNotifier`.
Take an `IOverdueNotifier notifier` parameter instead of constructing one, and
leave the rest of the loop alone. The gate registers its own implementation of
that interface for its host, and your handler never learns the difference.
