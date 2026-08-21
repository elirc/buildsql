// 01_modules / ex3 - reference solution (author only, used by `dojo verify`).

let issued = 0;

export function nextId(): string {
  issued += 1;
  return `job-${issued}`;
}

export function idsIssued(): number {
  return issued;
}
