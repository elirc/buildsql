// A CommonJS module, exactly as it was written in 2016. Do not edit it: the
// point of ex2 is that you cannot always rewrite the code you depend on.
"use strict";

const RATES = { us: 0.07, de: 0.19, jp: 0.1 };

function priceWithTax(cents, region) {
  const rate = RATES[region];
  if (rate === undefined) {
    throw new Error(`unknown region: ${region}`);
  }
  return Math.round(cents * (1 + rate));
}

module.exports = { RATES, priceWithTax };
