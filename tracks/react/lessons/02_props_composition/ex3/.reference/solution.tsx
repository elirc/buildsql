// 02_props_composition / ex3 - reference solution.
import type { ReactNode } from "react";

export function Panel({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="panel-header">{header}</div>
      <div className="panel-body">{children}</div>
      <div className="panel-footer">{footer}</div>
    </section>
  );
}
