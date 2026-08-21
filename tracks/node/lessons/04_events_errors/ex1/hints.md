## Hint 1

Three methods and one piece of state: the array of jobs. Put the array on the
instance (a field, or a `#private` field if you like the privacy) and the
methods almost write themselves.

The part that is new is `this.emit(name, ...args)`, which you inherit from
`EventEmitter`. It calls every listener registered for that name, right now,
in order, with the arguments you pass - and then returns.

## Hint 2

`add` does three things in this order: record the job, announce it, return the
new size. The announcement carries two arguments, the job and the size the
queue has *after* the addition, so emit after you push.

`flush` has a subtlety: you have to hand out the jobs and empty the queue, and
if you empty it by mutating the same array (`this.jobs.length = 0`) the caller
is holding an array you just emptied. Take a reference to the old array and
give the instance a fresh one instead.

## Hint 3

```ts
add(job: string): number {
  this.#jobs.push(job);
  this.emit("added", /* what two arguments? */);
  return this.#jobs.length;
}

flush(): string[] {
  const jobs = this.#jobs;
  this.#jobs = [];
  this.emit(/* which event, with what payload? */);
  return jobs;
}
```

Two decisions left: the exact payloads. Reread the gate's assertions for the
shapes - one event carries two separate arguments, the other carries a single
array - and remember that flushing an empty queue must still emit.
