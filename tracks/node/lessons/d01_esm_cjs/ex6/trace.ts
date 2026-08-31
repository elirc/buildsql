// The shared notebook the other three fixtures write to as they are evaluated.
export const trace: string[] = [];

export function note(label: string): void {
  trace.push(label);
}
