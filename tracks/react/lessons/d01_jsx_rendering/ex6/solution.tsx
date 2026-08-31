// d01_jsx_rendering / ex6 - show the string, do not run it.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 6".

export function LiteralNotice({ text }: { text: string }) {
  return <p dangerouslySetInnerHTML={{ __html: text }} />;
}
