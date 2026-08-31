// d01_jsx_rendering / ex5 - reference solution.

export function Excerpt({ text, limit }: { text: string; limit: number }) {
  const shown = text.length > limit ? `${text.slice(0, limit).trimEnd()}...` : text;

  return <p>{shown}</p>;
}
