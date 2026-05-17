const fs = require("fs");
const path = require("path");

// ========================
// Pure logic (unit-testable)
// ========================

/**
 * Build:
 * - extensionMap: { [ext]: { count, examples[] } } (examples limited to 3)
 * - multiExtensionInstructions: [{ instruction, extensions }]
 */
function processTier1Instructions(data) {
  const extensionMap = {};
  const multiExtensionInstructions = [];

  for (const [mnemonic, info] of Object.entries(data)) {
    const extensions = info?.extension;

    if (!Array.isArray(extensions)) continue;

    // detect multi-extension instructions
    if (extensions.length > 1) {
      multiExtensionInstructions.push({ instruction: mnemonic, extensions });
    }

    // group by extension
    for (const ext of extensions) {
      if (!extensionMap[ext]) {
        extensionMap[ext] = { count: 0, examples: [] };
      }

      extensionMap[ext].count += 1;
      if (extensionMap[ext].examples.length < 3) {
        extensionMap[ext].examples.push(mnemonic);
      }
    }
  }

  return { extensionMap, multiExtensionInstructions };
}

function buildTier1Report({ extensionMap, multiExtensionInstructions }) {
  let report = "";

  function log(line = "") {
    report += line + "\n";
  }

  log("=================================");
  log("   RISC-V EXTENSION REPORT (TIER 1)");
  log("=================================\n");

  log("[EXTENSION SUMMARY]\n");
  for (const [ext, info] of Object.entries(extensionMap)) {
    log(
      `${ext} | ${info.count} instructions | e.g. ${info.examples.join(", ")}`
    );
  }

  log("\n=================================");
  log("[MULTI-EXTENSION INSTRUCTIONS]");
  log("=================================\n");

  if (multiExtensionInstructions.length === 0) {
    log("None found");
  } else {
    for (const item of multiExtensionInstructions) {
      log(`${item.instruction} → ${item.extensions.join(", ")}`);
    }
  }

  log("\n=================================");
  log("[STATS]");
  log("=================================\n");

  log(`Total extensions: ${Object.keys(extensionMap).length}`);
  log(`Multi-extension instructions: ${multiExtensionInstructions.length}`);

  return report;
}

// ========================
// CLI entrypoint
// ========================

function runCli() {
  // Paths
  const INPUT_PATH = path.join(__dirname, "../data/instr_dict.json");
  const OUTPUT_PATH = path.join(__dirname, "../output/report.txt");

  // Load dataset
  const raw = fs.readFileSync(INPUT_PATH, "utf-8");
  const data = JSON.parse(raw);

  const { extensionMap, multiExtensionInstructions } =
    processTier1Instructions(data);

  const report = buildTier1Report({ extensionMap, multiExtensionInstructions });

  // console output mirror (preserving original behavior)
  console.log(report);

  fs.writeFileSync(OUTPUT_PATH, report);
  console.log(`\nReport written to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  runCli();
}

module.exports = { processTier1Instructions, buildTier1Report };
