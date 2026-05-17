const fs = require("fs");
const path = require("path");

/**
 * Builds an undirected graph:
 *   node = extension name (normalized)
 *   edge (A--B) exists if there is at least one instruction whose extension array contains both A and B.
 *
 * Outputs:
 *   - output/extensions_graph.dot
 *   - output/extensions_graph_edges.txt
 */

const JSON_PATH = path.join(__dirname, "../data/instr_dict.json");
const DOT_OUT_PATH = path.join(__dirname, "../output/extensions_graph.dot");
const EDGES_OUT_PATH = path.join(
  __dirname,
  "../output/extensions_graph_edges.txt"
);

function normalize(ext) {
  return String(ext)
    .toLowerCase()
    .replace(/^rv32_/, "")
    .replace(/^rv64_/, "")
    .replace(/^rv_/, "")
    .trim();
}

function addUndirectedEdge(pairKey, pair, edgeMap) {
  if (!edgeMap.has(pairKey)) {
    edgeMap.set(pairKey, { a: pair[0], b: pair[1], count: 0 });
  }
  edgeMap.get(pairKey).count += 1;
}

function pairKey(a, b) {
  // stable ordering already applied by caller
  return `${a}--${b}`;
}

function buildGraph(data) {
  const edgeMap = new Map();

  // extensions present across instructions (not strictly needed for edges, but useful for DOT)
  const extensionSet = new Set();

  for (const info of Object.values(data)) {
    const extensions = info?.extension;
    if (!Array.isArray(extensions)) continue;

    const normalized = extensions
      .map(normalize)
      .filter(Boolean);

    // de-dupe per instruction to avoid self-edges/count inflation
    const unique = [...new Set(normalized)];

    for (const ext of unique) extensionSet.add(ext);

    // only meaningful when instruction has 2+ extensions
    if (unique.length < 2) continue;

    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const a = unique[i];
        const b = unique[j];
        const [x, y] = a < b ? [a, b] : [b, a];
        addUndirectedEdge(pairKey(x, y), [x, y], edgeMap);
      }
    }
  }

  return { extensionSet, edgeMap };
}

function writeDot({ extensionSet, edgeMap }) {
  // Keep DOT reasonably readable:
  // - omit isolated nodes (extensions that never co-occur)
  // - draw nodes that appear in at least one edge
  const connected = new Set();
  for (const edge of edgeMap.values()) {
    connected.add(edge.a);
    connected.add(edge.b);
  }

  // Sort for deterministic output
  const nodes = [...connected].sort();
  const edges = [...edgeMap.values()].sort((e1, e2) =>
    `${e1.a}-${e1.b}`.localeCompare(`${e2.a}-${e2.b}`)
  );

  let dot = "";
  dot += "graph Extensions {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box, style=filled, fillcolor=\"#f3f3f3\", fontname=\"Helvetica\"];\n";

  for (const n of nodes) {
    // DOT quoting: escape double-quotes
    dot += `  "${n}";\n`;
  }

  for (const e of edges) {
    // label count; if graph is too dense, you can remove label
    dot += `  "${e.a}" -- "${e.b}" [label="${e.count}"];\n`;
  }

  dot += "}\n";

  fs.writeFileSync(DOT_OUT_PATH, dot, "utf-8");
}

function writeEdgeList({ edgeMap }) {
  // Sorted by count desc then lexical
  const edges = [...edgeMap.values()].sort((e1, e2) => {
    if (e2.count !== e1.count) return e2.count - e1.count;
    return `${e1.a}-${e1.b}`.localeCompare(`${e2.a}-${e2.b}`);
  });

  let out = "";
  out += "ext1\text2\tsharedInstructionCount\n";
  for (const e of edges) {
    out += `${e.a}\t${e.b}\t${e.count}\n`;
  }

  fs.writeFileSync(EDGES_OUT_PATH, out, "utf-8");
}

function runCli() {
  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const data = JSON.parse(raw);

  const { extensionSet, edgeMap } = buildGraph(data);

  writeDot({ extensionSet, edgeMap });
  writeEdgeList({ edgeMap });

  const edgesSorted = [...edgeMap.values()].sort(
    (e1, e2) => e2.count - e1.count
  );

  console.log("=== RISC-V EXTENSIONS SHARING-INSTRUCTIONS GRAPH ===");
  console.log(`Input instructions: ${Object.keys(data).length}`);
  console.log(`Total unique extensions (from instruction arrays): ${extensionSet.size}`);
  console.log(`Unique extension pairs sharing >=1 instruction: ${edgeMap.size}`);
  console.log(
    "Top 20 pairs by shared instruction count:"
  );
  console.log(
    edgesSorted
      .slice(0, 20)
      .map((e) => `${e.a} -- ${e.b} (${e.count})`)
      .join("\n")
  );

  console.log(`\nDOT graph written to: ${DOT_OUT_PATH}`);
  console.log(`Edge list written to: ${EDGES_OUT_PATH}`);
}

if (require.main === module) {
  runCli();
}

module.exports = { buildGraph, normalize };
