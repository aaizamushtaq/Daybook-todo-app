// Basic build/test checks for the Daybook To-Do List app.
// These run in GitHub Actions CI on every push to main.

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");

function readFile(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

console.log("Running Daybook CI checks...");

// 1. Required files must exist
["index.html", "style.css", "script.js"].forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);
  console.log(`  [ok] ${file} exists`);
});

// 2. index.html must reference the stylesheet and script
const html = readFile("index.html");
assert.ok(html.includes('href="style.css"'), "index.html must link style.css");
assert.ok(html.includes('src="script.js"'), "index.html must link script.js");
assert.ok(html.includes('id="task-form"'), "index.html must contain the task form");
assert.ok(html.includes('id="task-list"'), "index.html must contain the task list");
console.log("  [ok] index.html references style.css and script.js, and has core elements");

// 3. script.js must be syntactically valid JavaScript
const js = readFile("script.js");
try {
  new vm.Script(js, { filename: "script.js" });
  console.log("  [ok] script.js is syntactically valid");
} catch (err) {
  throw new Error(`script.js has a syntax error: ${err.message}`);
}

// 4. style.css should not be empty and should define the base page styles
const css = readFile("style.css");
assert.ok(css.length > 0, "style.css should not be empty");
assert.ok(css.includes(".task-list"), "style.css must style .task-list");
console.log("  [ok] style.css contains expected rules");

console.log("All checks passed.");
