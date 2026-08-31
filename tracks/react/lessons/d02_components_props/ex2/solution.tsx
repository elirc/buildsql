// d02_components_props / ex2 - one prop, two attributes, and a default size.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 2".

export function Avatar({ src, name, size }: { src: string; name: string; size?: number }) {
  return <img src={src} alt="" width={size} height={size} />;
}
