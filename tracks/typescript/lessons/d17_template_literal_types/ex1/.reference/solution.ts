// d17_template_literal_types / ex1 - reference solution (author only).

export type Prefixed<P extends string, K extends string> = `${P}:${K}`;
