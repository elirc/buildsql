// d03_objects_shapes / ex8 - reference solution (author only).

export interface MetaRecord {
  [key: string]: string | number;
}

export function diffMeta(
  before: MetaRecord,
  after: MetaRecord,
): { added: string[]; removed: string[]; changed: string[] } {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  for (const key of Object.keys(after)) {
    if (!(key in before)) {
      added.push(key);
    } else if (before[key] !== after[key]) {
      changed.push(key);
    }
  }
  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      removed.push(key);
    }
  }
  return { added: added.sort(), removed: removed.sort(), changed: changed.sort() };
}
