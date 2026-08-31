// d01_jsx_rendering / ex2 - a picture and the words that belong to it.
// See tracks/react/lessons/d01_jsx_rendering/README.md, "Exercise 2".

export function Thumbnail({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <div>
      <img src={src} alt="" />
      <p>{caption}</p>
    </div>
  );
}
