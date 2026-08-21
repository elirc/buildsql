## Hint 1

Read the gate before you write anything: it starts two requests, lets both
suspend at an `await`, and only then lets them finish. That is not a contrived
setup - it is what every server looks like the moment two users arrive at
once.

So the question the exercise asks is: where does this request's state live?
There is exactly one right answer and it is not "at the top of the module".

## Hint 2

Create the state inside the function. A `const steps: string[] = []` declared
in the call frame belongs to that call and nothing else; a `let steps` at
module scope is shared by every call in the process (lesson 01 ex3 - modules
are singletons, and that cuts both ways).

The context object you hand to `work` closes over that array:

```ts
const steps: string[] = [];
const context = { userId, log: (step: string) => { steps.push(step); } };
```

## Hint 3

Three statements: build the context, `await work(context)`, return the userId
and the steps.

The decision left to you is what happens if `work` rejects - the gate does not
test it, and a real handler has to decide whether the steps collected so far
are worth reporting (a `try`/`finally` would do it). Worth thinking through,
because "what happens to your per-request state when the request fails" is a
natural interview follow-up.

If you ever need this state deep in a call stack without threading a context
argument through every function, the answer is
`AsyncLocalStorage` from `node:async_hooks` - name it and you have answered
the question most candidates cannot.
