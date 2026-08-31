// d02_components_props / ex1 - a prop with a sensible default.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 1".

export function WelcomeLine({ name, salutation }: { name: string; salutation?: string }) {
  return (
    <p>
      {salutation}, {name}!
    </p>
  );
}
