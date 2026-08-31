// A CommonJS module from the era before this codebase had a build step.
// Do not edit it: the point of the problem is the code you cannot change.
"use strict";

const RULES = {
  double: (n) => n * 2,
  half: (n) => n / 2,
  negate: (n) => -n,
};

function apply(name, n) {
  const rule = RULES[name];
  if (typeof rule !== "function") {
    throw new Error(`unknown rule: ${name}`);
  }
  return rule(n);
}

module.exports = { VERSION: "1.4.0", RULES, apply };
