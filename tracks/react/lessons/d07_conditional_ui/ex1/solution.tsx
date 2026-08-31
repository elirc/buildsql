// d07_conditional_ui / ex1 - two states, one of them on screen.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 1".

export function AuthNav({ user }: { user: { name: string } | null }) {
  return (
    <>
      {user && <span>Hi, {user.name}</span>}
      <button type="button">Sign in</button>
      {user && <button type="button">Sign out</button>}
    </>
  );
}
