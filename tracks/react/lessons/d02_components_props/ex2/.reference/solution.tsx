// d02_components_props / ex2 - reference solution.

export function Avatar({
  src,
  name,
  size = 40,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  return <img src={src} alt={name} width={size} height={size} />;
}
