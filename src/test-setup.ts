import "@testing-library/jest-dom";

if (typeof window !== "undefined") {
  Object.defineProperty(window, "scrollTo", {
    value: () => undefined,
    writable: true,
  });
}
