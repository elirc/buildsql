// d17_template_literal_types / ex2 - reference solution (author only).

export type GetterName<K extends string> = `get${Capitalize<K>}`;
