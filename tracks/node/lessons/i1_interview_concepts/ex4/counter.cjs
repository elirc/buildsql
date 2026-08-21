// A CommonJS module, shipped with the lesson. Do not edit it.
//
// It counts its own evaluations on globalThis, so you can see - by identity
// and by number - whether the require cache handed you the old instance or
// the module body ran again.
"use strict";

const scope = globalThis;
scope.__dojoCounterLoads = (scope.__dojoCounterLoads ?? 0) + 1;

module.exports = { loads: scope.__dojoCounterLoads };
