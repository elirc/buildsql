// d22_declaration_files / ex1 - reference solution (author only).

export interface Tag {
  scope: string;
  name: string;
}

export function parseTag(raw: string): Tag {
  const separator = raw.indexOf(":");
  if (separator === -1) {
    return { scope: "", name: raw };
  }
  return { scope: raw.slice(0, separator), name: raw.slice(separator + 1) };
}

export namespace parseTag {
  export const VERSION: string = "1.0";

  export function isValid(raw: string): boolean {
    return raw.includes(":");
  }
}
