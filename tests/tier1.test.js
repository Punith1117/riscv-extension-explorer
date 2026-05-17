const test = require("node:test");
const assert = require("node:assert/strict");

const sampleData = {
  add: {
    extension: ["rv_i"]
  },
  sh1add: {
    extension: ["rv_zba"]
  },
  andn: {
    extension: ["rv_zbb", "rv_zkn"]
  },
  clmul: {
    extension: ["rv_zbc", "rv_zk", "rv_zkn"]
  }
};

// helper used in tier1 logic
function processInstructions(data) {
  const extensionMap = {};
  const multiExtensionInstructions = [];

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
          examples: []
        };
      }

      extensionMap[ext].count += 1;

      if (extensionMap[ext].examples.length < 3) {
        extensionMap[ext].examples.push(mnemonic);
      }
    }
  }

  return {
    extensionMap,
    multiExtensionInstructions
  };
}

test("groups instructions by extension correctly", () => {
  const { extensionMap } = processInstructions(sampleData);

  assert.equal(extensionMap["rv_i"].count, 1);
  assert.equal(extensionMap["rv_zba"].count, 1);
  assert.equal(extensionMap["rv_zbb"].count, 1);
  assert.equal(extensionMap["rv_zbc"].count, 1);
});

test("stores example mnemonics correctly", () => {
  const { extensionMap } = processInstructions(sampleData);

  assert.deepEqual(extensionMap["rv_i"].examples, ["add"]);
  assert.deepEqual(extensionMap["rv_zba"].examples, ["sh1add"]);
});

test("detects multi-extension instructions", () => {
  const { multiExtensionInstructions } = processInstructions(sampleData);

  assert.equal(multiExtensionInstructions.length, 2);

  assert.deepEqual(multiExtensionInstructions[0], {
    instruction: "andn",
    extensions: ["rv_zbb", "rv_zkn"]
  });

  assert.deepEqual(multiExtensionInstructions[1], {
    instruction: "clmul",
    extensions: ["rv_zbc", "rv_zk", "rv_zkn"]
  });
});

test("ignores invalid extension fields", () => {
  const invalidData = {
    fake1: {
      extension: null
    },
    fake2: {
      extension: "rv_fake"
    }
  };

  const { extensionMap, multiExtensionInstructions } =
    processInstructions(invalidData);

  assert.deepEqual(extensionMap, {});
  assert.deepEqual(multiExtensionInstructions, []);
});