// A CommonJS module with state. Its body runs once per cache entry, so every
// fresh require() of it starts with an empty list.
"use strict";

const entries = [];

module.exports = {
  entries,
  add(name) {
    entries.push(name);
    return entries.length;
  },
};
