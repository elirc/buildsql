// d16_infer_patterns / ex4 - reference solution (author only).

export type LastOf<T> = T extends readonly [...unknown[], infer Last] ? Last : never;
