// 00_hello_dojo / ex3 - an accessible name, and a function passed as a prop.
// See tracks/react/lessons/00_hello_dojo/README.md, "Exercise 3".

export function IconButton({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: string;
  onPress: () => void;
}) {
  return <button type="button">TODO</button>;
}
