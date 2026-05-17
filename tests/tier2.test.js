// tests/tier2.test.js

const test = require("node:test");
const assert = require("node:assert/strict");

// ========================
// FUNCTIONS UNDER TEST
// ========================

function normalize(ext) {
  return ext
    .toLowerCase()
    .replace(/^rv32_/, "")
    .replace(/^rv64_/, "")
    .replace(/^rv_/, "")
    .trim();
}

function isValidExtension(name) {
  return /^(z[a-z0-9_]+|[mfdcvaqhsu])$/.test(name);
}

// ========================
// normalize()
// ========================

test("normalize() removes rv32_ prefix", () => {
  assert.equal(normalize("rv32_zba"), "zba");
});

test("normalize() removes rv64_ prefix", () => {
  assert.equal(normalize("rv64_zicsr"), "zicsr");
});

test("normalize() removes rv_ prefix", () => {
  assert.equal(normalize("rv_m"), "m");
});

test("normalize() converts to lowercase", () => {
  assert.equal(normalize("RV32_ZBA"), "zba");
});

test("normalize() trims whitespace", () => {
  assert.equal(normalize("  zbb  "), "zbb");
});

// ========================
// isValidExtension()
// ========================

test("isValidExtension() accepts standard single-letter extensions", () => {
  assert.equal(isValidExtension("m"), true);
  assert.equal(isValidExtension("f"), true);
  assert.equal(isValidExtension("d"), true);
  assert.equal(isValidExtension("a"), true);
  assert.equal(isValidExtension("v"), true);
});

test("isValidExtension() accepts z-extensions", () => {
  assert.equal(isValidExtension("zba"), true);
  assert.equal(isValidExtension("zicsr"), true);
  assert.equal(isValidExtension("zifencei"), true);
});

test("isValidExtension() rejects non-extension documentation files", () => {
  assert.equal(isValidExtension("contributors"), false);
  assert.equal(isValidExtension("intro"), false);
  assert.equal(isValidExtension("crypto"), false);
  assert.equal(isValidExtension("machine"), false);
});

test("isValidExtension() rejects invalid filenames", () => {
  assert.equal(isValidExtension("images"), false);
  assert.equal(isValidExtension("vector-common"), false);
  assert.equal(isValidExtension("code-examples"), false);
});

// ========================
// CROSS-REFERENCE LOGIC
// ========================

test("detects matched extensions", () => {
  const jsonSet = new Set(["zba", "m", "f"]);
  const manualSet = new Set(["zba", "f", "zicsr"]);

  const matched = [...jsonSet].filter(x => manualSet.has(x));

  assert.deepEqual(matched, ["zba", "f"]);
});

test("detects json-only extensions", () => {
  const jsonSet = new Set(["zba", "m"]);
  const manualSet = new Set(["zba"]);

  const jsonOnly = [...jsonSet].filter(x => !manualSet.has(x));

  assert.deepEqual(jsonOnly, ["m"]);
});

test("detects manual-only extensions", () => {
  const jsonSet = new Set(["zba"]);
  const manualSet = new Set(["zba", "zicsr"]);

  const manualOnly = [...manualSet].filter(x => !jsonSet.has(x));

  assert.deepEqual(manualOnly, ["zicsr"]);
});