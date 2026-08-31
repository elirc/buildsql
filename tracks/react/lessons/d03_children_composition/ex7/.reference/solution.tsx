// d03_children_composition / ex7 - reference solution.
import { Children, isValidElement, type ReactNode } from "react";

export function Case({ when, children }: { when: string; children: ReactNode }) {
  return <>{children}</>;
}

export function Switcher({
  value,
  fallback,
  children,
}: {
  value: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const match = Children.toArray(children).find(
    (child) =>
      isValidElement<{ when: string }>(child) && child.type === Case && child.props.when === value,
  );

  if (isValidElement<{ children?: ReactNode }>(match)) {
    return <>{match.props.children}</>;
  }

  return <>{fallback}</>;
}
