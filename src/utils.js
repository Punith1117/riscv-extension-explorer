const fs = require("fs");
const path = require("path");

function getAllAdocFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllAdocFiles(fullPath, files);
    } else if (entry.endsWith(".adoc")) {
      files.push(fullPath);
    }
  }

  return files;
}

module.exports = { getAllAdocFiles };