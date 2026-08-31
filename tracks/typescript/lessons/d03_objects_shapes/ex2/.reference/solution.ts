// d03_objects_shapes / ex2 - reference solution (author only).

export interface AlbumInput {
  title: string;
  year?: number;
  label?: string;
}

export function describeAlbum(input: AlbumInput): string {
  const { title, label = "independent", year } = input;
  const yearText = year === undefined ? "unknown" : String(year);
  return `${title} [${label}] ${yearText}`;
}
