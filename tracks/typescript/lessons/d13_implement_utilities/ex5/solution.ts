// d13_implement_utilities / ex5 - rebuild InstanceType<C> from scratch.
// See lessons/d13_implement_utilities/README.md, "ex5".
//
// A construct signature is a function type with `new` in front. What it
// builds is the type this alias should produce - unknown is a placeholder.

export type MyInstanceType<C extends new (...args: any[]) => unknown> = unknown;
