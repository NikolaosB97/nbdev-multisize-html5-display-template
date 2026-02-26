import fs from "fs";
import path from "path";
import archiver from "archiver";

const format = process.argv[2];
if (!format) {
  console.error("Usage: node tools/zip.js <format-folder>");
  process.exit(1);
}

const root = process.cwd();
const srcDir = path.join(root, "formats", format);
const outDir = path.join(root, "zips");
const outZip = path.join(outDir, `${format}.zip`);

if (!fs.existsSync(srcDir)) {
  console.error("Format not found:", srcDir);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const output = fs.createWriteStream(outZip);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.on("error", (err) => { throw err; });
output.on("close", () => console.log("Created:", outZip, "bytes:", archive.pointer()));

archive.pipe(output);

// include format folder
archive.directory(srcDir, false);

// include core folder (needed for module imports)
archive.directory(path.join(root, "core"), "core");

archive.finalize();