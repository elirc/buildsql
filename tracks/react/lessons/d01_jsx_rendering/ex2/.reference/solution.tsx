// d01_jsx_rendering / ex2 - reference solution.

export function Thumbnail({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure>
      <img src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
