# Reading - csharp/d23_async_tasks

## Notes

The skill being drilled is treating a `Task` as an ordinary value. It is an
object you can hold, pass, store in a list, ask about, and wait on more than
once - and almost every async mistake comes from forgetting that and treating
`await` as a way of making code synchronous again.

The pattern uniting these eight problems is **start first, wait later**. A
method that returns a `Task` has already started the work by the time you have
the task in your hand; `await` only decides when you want the answer. So
`await A(); await B();` is two operations one after the other, while
`var a = A(); var b = B(); await a; await b;` is two at once, and the
difference is entirely in where the awaits go. Everything else here follows:
`WhenAny` gives you back a task rather than a result, `WhenAll` collects
failures onto the tasks rather than into what it throws, and a task you already
hold can be handed to a second caller instead of doing the work twice.

Every task in this set is a `TaskCompletionSource` the gate completes by hand.
That is not only for determinism in the test - it is the tool you reach for
whenever you need to turn something that is not task-shaped (a callback, an
event, a queue) into something that is.

## ex1

Really testing: where the awaits go. Calling the second factory before awaiting
the first is what makes the two operations concurrent, and the gate can see the
difference because it records the moment each factory is called. The other half
of the exercise is the pair of already-completed tasks. `Task.FromResult` and
`Task.FromException` build a finished task with no async machinery, no thread
and no allocation of a state machine - the right answers for a cache hit and a
validation failure respectively. Note what `AlreadyFailed` proves: a method can
*return* a failure rather than throwing it, which is what a caller holding a
`Task` expects.

## ex2

Really testing: that an async method runs synchronously until its first
`await`. The `"before"` line has already been written when the caller gets the
task back - the method did not go anywhere else to start. That is worth knowing
for two reasons: it means work before the first await happens on the caller's
thread, and it means an exception thrown before the first await *still* ends up
in the task rather than at the call. Which is exactly why `GreetAsync` cannot
be an `async` method: argument validation belongs at the call, so the pattern
is a plain method that validates and then returns an async local function's
task.

## ex3

Really testing: `Task.WhenAny`, and the thing it does not do. It hands back the
`Task` that finished - not its result - so getting the value needs a second
`await` and finding out *which* one won needs a reference comparison. The part
people miss is the loser: it is still pending, its work is still running, and
nothing about `WhenAny` cancels or tidies it. In a real timeout that matters -
you have stopped waiting, not stopped working, and if the loser eventually
fails with nobody observing it you have an unobserved task exception. A first
task that finished by *failing* still wins, which is the last assertion.

## ex4

Really testing: where `Task.WhenAll` puts the failures. The task it returns
faults with an `AggregateException` holding every failure, but `await`
deliberately rethrows only the first one, because rethrowing an aggregate would
make every `catch (SqlException)` in the world stop working. So a try/catch
around `await Task.WhenAll(...)` sees one failure and silently loses the rest.
The remaining failures are not gone - each one is on its own task - and reading
them off afterwards is the whole technique. (The other route is
`Task.WhenAll(...).Exception`, which gives the aggregate directly.)

## ex5

Really testing: composing asynchronous steps without ever blocking. Both
methods are two lines, and the point is what the gate measures: the mapping
function has not run while the task is still pending, and the second step has
not been *started*. `await` on the first line gives you both properties for
free, including the failure behaviour - an exception from the first step
propagates and the second step simply never happens, with no `if` anywhere.
This is `Task.ContinueWith` written the readable way, and the reason
`ContinueWith` has largely disappeared from modern code.

## ex6

Really testing: inspecting a task rather than waiting on it. The three terminal
states are distinct - `IsCompleted` is true for all of them, so the order of
the checks matters, and cancellation is not a kind of fault. `Exception` on a
faulted task is always an `AggregateException`, so the message worth logging is
one level in. The second method exists to make one point: `task.Result` on a
pending task *blocks the calling thread* until somebody else completes it,
which is the classic way to deadlock a UI or an ASP.NET request.
`IsCompletedSuccessfully` is the one test that excludes pending, faulted and
cancelled in a single call.

## ex7

Really testing: a `WhenAny` loop, which is the standard shape for "keep waiting
until something good happens". The list of pending tasks shrinks by one each
time round, and a task that finished by failing is dropped rather than
returned - which is exactly the behaviour plain `WhenAny` does not give you.
Two details are worth care. `finished.Status == TaskStatus.RanToCompletion` is
the success test, because `IsCompleted` is true for failures too. And the
give-up path reports the failures in *task* order rather than completion
order, because the caller is trying to understand a system, not a race.

## ex8

Really testing: everything above, in the shape real code needs. The key insight
is that the cached thing is the `Task`, not the value - which is what makes the
coalescing work, because a caller who arrives while the work is in flight can
be handed the same in-flight task. A cache that stores the *result* can only
help callers who arrive after it finishes, so the stampede it was built to
prevent goes straight through. The failure rule is the other half of the
design: caching a faulted task means one unlucky moment poisons the value for
the lifetime of the process, so a faulted task is dropped and the next caller
retries. (This version is deliberately not thread-safe; the real one wraps the
check in a lock or uses `Lazy<Task<T>>`, and knowing that you have not solved
that is better than assuming you have.)

## Further reading

- [Asynchronous programming with async and await](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/) - the model, and what await really does.
- [`Task.WhenAll`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenall) and [`Task.WhenAny`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenany) - including what each one does with failures.
- [`TaskCompletionSource<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcompletionsource-1) - turning anything into a task, and the tool this whole lesson is tested with.
- [Task-based asynchronous pattern (TAP)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap) - the conventions, including where argument validation goes.
- [`Task.Status`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.status) - the full state machine behind ex6.
- [Async guidance: avoid blocking on async code](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices#avoid-blocking-calls) - why `.Result` on a pending task is a deadlock.
