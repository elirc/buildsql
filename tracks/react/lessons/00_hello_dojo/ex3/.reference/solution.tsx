// 00_hello_dojo / ex3 - reference solution.

export function IconButton({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: string;
  onPress: () => void;
}) {
  return (
    <button type="button" aria-label={label} onClick={onPress}>
      {glyph}
    </button>
  );
}
