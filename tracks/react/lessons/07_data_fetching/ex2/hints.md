## Hint 1
The stub only handles the happy path, so a rejected promise leaves `loading`
stuck at `true` forever and the user stares at a spinner that will never stop.
Add the third piece of state, and make sure loading stops on *both* outcomes.

## Hint 2
```tsx
fetchUser(userId)
  .then((result) => setUser(result))
  .catch((problem: unknown) => /* … */)
  .finally(() => setLoading(false));
```

`.finally` runs either way, which is exactly the guarantee "the spinner always
stops" needs. Doing it in both branches by hand works too, and is one more
place to forget.

## Hint 3
The gate wants the error's own message on screen, so pull it out of what you
caught — and note that in TypeScript a caught value is `unknown`, not `Error`,
because anything can be thrown. `problem instanceof Error ? problem.message : …`
narrows it safely. Render the error in a `role="alert"` region, and think about
what should happen to a *previous* error when the id changes and a new request
starts.
