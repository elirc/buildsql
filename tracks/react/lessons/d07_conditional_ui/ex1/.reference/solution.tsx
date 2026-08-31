// d07_conditional_ui / ex1 - reference solution.

export function AuthNav({ user }: { user: { name: string } | null }) {
  if (user === null) {
    return <button type="button">Sign in</button>;
  }

  return (
    <>
      <span>Hi, {user.name}</span>
      <button type="button">Sign out</button>
    </>
  );
}
