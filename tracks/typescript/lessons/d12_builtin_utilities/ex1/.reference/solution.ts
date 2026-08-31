// d12_builtin_utilities / ex1 - reference solution (author only).

export interface JobDraft {
  title?: string;
  salary?: number;
  remote?: boolean;
}

export function complete(draft: JobDraft): Required<JobDraft> {
  return {
    title: draft.title ?? "untitled",
    salary: draft.salary ?? 0,
    remote: draft.remote ?? false,
  };
}
