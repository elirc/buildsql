// 05_literals_enums / ex3 - reference solution (author only).

export enum Status {
  Draft = "draft",
  Published = "published",
  Retired = "retired",
}

export function statusLabel(status: Status): string {
  switch (status) {
    case Status.Draft:
      return "Draft (not visible)";
    case Status.Published:
      return "Published";
    case Status.Retired:
      return "Retired (archived)";
  }
}
