// 03_objects_interfaces / ex4 - reference solution (author only).

export interface RunOptions {
  retries?: number;
  verbose?: boolean;
  label?: string;
}

export interface ResolvedOptions {
  retries: number;
  verbose: boolean;
  label: string;
}

export function resolveOptions(options: RunOptions): ResolvedOptions {
  return {
    retries: options.retries ?? 1,
    verbose: options.verbose ?? false,
    label: options.label ?? "run",
  };
}
