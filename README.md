# RISC-V Extension Explorer

A JavaScript-based analysis tool that parses and cross-references RISC-V instruction extensions from:

- Instruction dataset (instr_dict.json)
- Official RISC-V ISA Manual (AsciiDoc source files)

It generates a coverage report showing how well the JSON instruction dataset aligns with the official ISA specification.

## Features
- Parses and groups instructions by extension
- Handles multi-extension instructions (e.g., Zkn + Zk + Zbb)
- Cross-references JSON dataset vs ISA manual
- Detects:
  - Extensions only in JSON
  - Extensions only in manual
  - Matched extensions
- Generates:
  - CLI summary (top 20 samples)
  - Full detailed report file
  - Normalizes extension naming differences (rv_zba -> zba)

## Installation
```
git clone https://github.com/Punith1117/riscv-extension-explorer.git
cd riscv-extension-explorer
```

No external dependencies required beyond Node.js (fs, path).

## How to Run
### Tier 1 – Instruction Parsing
```
node src/tier1.js
```

### Tier 2 – Cross Reference Analysis
```
node src/tier2.js
```
### Tier 3 – Tests
```
node --test
```

### Output Example (CLI)
```
=== RISC-V TIER 2 REPORT ===

Matched Extensions: 50
JSON only Extensions: 35
Manual only Extensions: 65

MATCHED (sample 20):
zba, zknd, zkn, zk, zbb, zicsr, ...

JSON ONLY (sample 20):
i, q, d_zfa, zfh_zfa, ...

MANUAL ONLY (sample 20):
zicntr, zicbom, ztso, zmmul, ...
📄 Output File

```
A full report is generated at:
output/tier2_report.txt

It contains:
- Full matched extension list
- Full JSON-only extensions
- Full manual-only extensions
- Summary counts

## Assumptions & Design Decisions
1. Extension Normalization

We normalize extensions to handle naming differences between sources:

```
rv32_zba -> zba
rv64_zbb -> zbb
```
Case-insensitive matching

2. ISA Manual Parsing Strategy

Instead of fragile regex-based parsing of full text, we extract extensions from:

```
.adoc filenames inside src/
```

This ensures:

- Stability across spec formatting changes
- No dependency on document wording

3. Multi-Extension Handling

Some instructions belong to multiple extensions (e.g., AES, SHA, vector crypto).

These are preserved and reported separately to reflect real ISA structure.

4. Matching Strategy

We use set-based comparison:

```
JSON Extensions and Manual Extensions -> Matched
JSON - Manual -> JSON Only
Manual - JSON -> Manual Only
```

## Project Structure
```
src/
 |-- tier1.js
 |-- tier2.js
 |-- utils.js

data/
 |-- instr_dict.json
 |-- riscv-isa-manual/

output/
 |-- tier2_report.txt
 |-- report.txt
```
(report.txt is for tier1.js)

## Why this project matters

This tool helps:

- Verify completeness of instruction datasets
- Detect missing ISA coverage
- Analyze extension fragmentation across specs
- Assist compiler / ISA tooling validation
