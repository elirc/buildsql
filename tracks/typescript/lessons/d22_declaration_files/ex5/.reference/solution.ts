// d22_declaration_files / ex5 - reference solution (author only).

export interface RequestContext {
  requestId: string;
}

export interface RequestContext {
  locale: string;
}

export function describeContext(context: RequestContext): string {
  return context.requestId + "@" + context.locale;
}
