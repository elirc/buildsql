// 03_objects_interfaces / ex2 - reference solution (author only).

export interface Draft {
  readonly id: string;
  readonly title: string;
  readonly tags: readonly string[];
}

export function renameDraft(draft: Draft, title: string): Draft {
  return { ...draft, title };
}
