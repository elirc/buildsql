// The same idea in CommonJS. Note that add() keeps the exported property up to
// date - so the exports OBJECT is always current, whatever a caller did with
// the value it once read off it.
"use strict";

let total = 0;

exports.total = total;

exports.add = function add(n) {
  total += n;
  exports.total = total;
};
