const fs = require("fs");
const path = require("path");
const { getAllAdocFiles } = require("./utils");

// ========================
// PATHS
// ========================
const MANUAL_PATH = path.join(__dirname, "../data/riscv-isa-manual/src");
const JSON_PATH = path.join(__dirname, "../data/instr_dict.json");
const OUTPUT_PATH = path.join(__dirname, "../output/tier2_report.txt");

// ========================
// LOAD DATA
// ========================
const files = getAllAdocFiles(MANUAL_PATH);
const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

// ========================
// NORMALIZATION
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
// STEP 1: JSON EXTENSIONS
// ========================
const jsonExtensions = new Set();

for (const insn of Object.values(data)) {
  for (const ext of insn.extension || []) {
    jsonExtensions.add(normalize(ext));
  }
}

// ========================
// STEP 2: MANUAL EXTENSIONS (FIXED)
// ========================
const manualExtensions = new Set();

for (const file of files) {
  const name = path.basename(file, ".adoc").toLowerCase();

  // keep only extension-like files
  if (
    !name.startsWith("z") &&
    !name.startsWith("m") &&
    !name.startsWith("f") &&
    !name.startsWith("c") &&
    !name.startsWith("v") &&
    !name.startsWith("a") &&
    !name.startsWith("d")
  ) {
    continue;
  }

  manualExtensions.add(name);
}

// ========================
// STEP 3: NORMALIZED SETS
// ========================
const jsonSet = new Set([...jsonExtensions].map(x => x.toLowerCase()));
const manualSet = new Set([...manualExtensions].map(x => x.toLowerCase()));

// ========================
// STEP 4: CROSS COMPARISON
// ========================
const matched = [...jsonSet].filter(x => manualSet.has(x));
const jsonOnly = [...jsonSet].filter(x => !manualSet.has(x));
const manualOnly = [...manualSet].filter(x => !jsonSet.has(x));

// ========================
// STEP 5: CLI OUTPUT (SAMPLE ONLY)
// ========================
console.log("=== RISC-V TIER 2 REPORT ===\n");

console.log(`Matched Extensions: ${matched.length}`);
console.log(`JSON only Extensions: ${jsonOnly.length}`);
console.log(`Manual only Extensions: ${manualOnly.length}`);

console.log("\n============================");
console.log("MATCHED (sample 20):");
console.log("============================");
console.log(matched.slice(0, 20).join(", "));

console.log("\nJSON ONLY (sample 20):");
console.log(jsonOnly.slice(0, 20).join(", "));

console.log("\nMANUAL ONLY (sample 20):");
console.log(manualOnly.slice(0, 20).join(", "));

// ========================
// STEP 6: REPORT (FULL DATA ONLY)
// ========================
let report = "";

function log(line = "") {
  report += line + "\n";
}

log("=== RISC-V TIER 2 REPORT ===\n");

log(`Matched Extensions: ${matched.length}`);
log(`JSON only Extensions: ${jsonOnly.length}`);
log(`Manual only Extensions: ${manualOnly.length}`);

log("\n============================");
log("MATCHED:");
log("============================");
log(matched.join(", "));

log("\n============================");
log("JSON ONLY:");
log("============================");
log(jsonOnly.join(", "));

log("\n============================");
log("MANUAL ONLY:");
log("============================");
log(manualOnly.join(", "));

// write file LAST
fs.writeFileSync(OUTPUT_PATH, report);

console.log(`\nReport written to: ${OUTPUT_PATH}`);