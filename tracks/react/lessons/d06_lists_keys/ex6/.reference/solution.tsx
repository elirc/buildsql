// d06_lists_keys / ex6 - reference solution.

export function AuthorLine({ names }: { names: string[] }) {
  const line =
    names.length === 0
      ? "Unknown author"
      : names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

  return <p>{line}</p>;
}
