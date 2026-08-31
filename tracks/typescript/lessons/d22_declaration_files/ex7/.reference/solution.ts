// d22_declaration_files / ex7 - reference solution (author only).

export interface CommandRegistry {}

export interface CommandRegistry {
  build: { target: string };
}

export interface CommandRegistry {
  test: { pattern: string };
}

export type CommandName = keyof CommandRegistry;

const handlers = {
  build: (payload: CommandRegistry["build"]): string => "build:" + payload.target,
  test: (payload: CommandRegistry["test"]): string => "test:" + payload.pattern,
};

export function dispatch<K extends CommandName>(name: K, payload: CommandRegistry[K]): string {
  const handler = handlers[name] as (value: CommandRegistry[K]) => string;
  return handler(payload);
}
