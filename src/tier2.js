const fs = require("fs");
const path = require("path");
const { getAllAdocFiles } = require("./utils");

// ========================
// PATHS
// ========================
const MANUAL_PATH = path.join(__dirname, "../data/riscv-isa-manual/src");
const JSON_PATH = path.join(__dirname, "../data/instr_dict.json");

// ========================
// LOAD DATA
// ========================
const files = getAllAdocFiles(MANUAL_PATH);
const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

// ========================
// NORMALIZATION FUNCTION
// ========================
function normalize(ext) {
  return ext
    .toLowerCase()
    .replace(/^rv32_/, "")
    .replace(/^rv64_/, "")
    .replace(/^rv_/, "")
    .trim();
}

// ========================
// STEP 1: EXTRACT JSON EXTENSIONS
// ========================
const jsonExtensions = new Set();

for (const insn of Object.values(data)) {
  for (const ext of insn.extension || []) {
    jsonExtensions.add(normalize(ext));
  }
}

// ========================
// STEP 2: EXTRACT MANUAL EXTENSIONS (CONTENT-BASED)
// ========================
const manualExtensions = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");

  // Extract RISC-V extension patterns
  const matches = content.match(/\b(Z[a-z0-9]+|M|F|D|C|V|A)\b/g);

  if (matches) {
    for (const m of matches) {
      manualExtensions.add(m.toLowerCase());
    }
  }
}

// ========================
// STEP 3: SET OPERATIONS
// ========================
const jsonSet = new Set([...jsonExtensions].map(x => x.toLowerCase()));
const manualSet = new Set([...manualExtensions].map(x => x.toLowerCase()));

const jsonOnly = [...jsonSet].filter(x => !manualSet.has(x));
const manualOnly = [...manualSet].filter(x => !jsonSet.has(x));
const matched = [...jsonSet].filter(x => manualSet.has(x));

// ========================
// STEP 4: OUTPUT REPORT
// ========================
console.log("=== RISC-V TIER 2 REPORT ===\n");

console.log(`Matched Extensions: ${matched.length}`);
console.log(`JSON only Extensions: ${jsonOnly.length}`);
console.log(`Manual only Extensions: ${manualOnly.length}`);

console.log("\n============================");
console.log("MATCHED (sample 20):");
console.log("============================");
console.log(matched.slice(0, 20).join(", "));

console.log("\n============================");
console.log("JSON ONLY (sample 20):");
console.log("============================");
console.log(jsonOnly.slice(0, 20).join(", "));

console.log("\n============================");
console.log("MANUAL ONLY (sample 20):");
console.log("============================");
console.log(manualOnly.slice(0, 20).join(", "));