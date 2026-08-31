// d02_components_props / ex1 - reference solution.

export function WelcomeLine({
  name,
  salutation = "Hello",
}: {
  name: string;
  salutation?: string;
}) {
  return (
    <p>
      {salutation}, {name}!
    </p>
  );
}
