const fs = require("fs");
const path = require("path");

// Paths
const INPUT_PATH = path.join(__dirname, "../data/instr_dict.json");
const OUTPUT_PATH = path.join(__dirname, "../output/report.txt");

// Load dataset
const raw = fs.readFileSync(INPUT_PATH, "utf-8");
const data = JSON.parse(raw);

// Data structures
const extensionMap = {};
const multiExtensionInstructions = [];

// Helper logger (console + report)
let report = "";

function log(line = "") {
  console.log(line);
  report += line + "\n";
}

// Process instructions
for (const [mnemonic, info] of Object.entries(data)) {
  const extensions = info.extension;

  if (!Array.isArray(extensions)) continue;

  // detect multi-extension instructions
  if (extensions.length > 1) {
    multiExtensionInstructions.push({
      instruction: mnemonic,
      extensions
    });
  }

  // group by extension
  for (const ext of extensions) {
    if (!extensionMap[ext]) {
      extensionMap[ext] = {
        count: 0,
        example: mnemonic
      };
    }

    extensionMap[ext].count += 1;
  }
}

// ========================
// BUILD REPORT
// ========================

log("=================================");
log("   RISC-V EXTENSION REPORT (TIER 1)");
log("=================================\n");

log("[EXTENSION SUMMARY]\n");

for (const [ext, info] of Object.entries(extensionMap)) {
  log(`${ext} | ${info.count} instructions | e.g. ${info.example}`);
}

log("\n=================================");
log("[MULTI-EXTENSION INSTRUCTIONS]");
log("=================================\n");

if (multiExtensionInstructions.length === 0) {
  log("None found");
} else {
  for (const item of multiExtensionInstructions) {
    log(
      `${item.instruction} → ${item.extensions.join(", ")}`
    );
  }
}

// Summary stats
log("\n=================================");
log("[STATS]");
log("=================================\n");

log(`Total extensions: ${Object.keys(extensionMap).length}`);
log(`Multi-extension instructions: ${multiExtensionInstructions.length}`);

// Write to file
fs.writeFileSync(OUTPUT_PATH, report);

console.log(`\nReport written to ${OUTPUT_PATH}`);