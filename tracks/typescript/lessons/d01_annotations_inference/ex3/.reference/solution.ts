// d01_annotations_inference / ex3 - reference solution (author only).

export function splitStationId(id: string): [site: string, index: number] {
  const dash = id.lastIndexOf("-");
  if (dash === -1) {
    return [id, 0];
  }
  const tail = id.slice(dash + 1);
  if (tail === "" || !/^\d+$/.test(tail)) {
    return [id, 0];
  }
  return [id.slice(0, dash), Number(tail)];
}
