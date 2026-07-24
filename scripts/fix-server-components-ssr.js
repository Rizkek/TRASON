/**
 * fix-server-components-ssr.js
 * 
 * Finds all .tsx files that:
 *   1. Do NOT have 'use client' at the top (= they are Server Components or shared components)
 *   2. Import from '@phosphor-icons/react' (main package, which calls createContext)
 * 
 * Replaces those imports with '@phosphor-icons/react/dist/ssr' which is the
 * Context-free version safe for Server Components.
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob') || {};

// Fallback: manual file walker if glob not available
function walkDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
      walkDir(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const allTsxFiles = walkDir(srcDir);

let patchedCount = 0;
let skippedCount = 0;

for (const filePath of allTsxFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if it's a client component
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
    skippedCount++;
    continue;
  }
  
  // Skip if it doesn't import from phosphor at all
  if (!content.includes("from '@phosphor-icons/react'")) {
    continue;
  }
  
  // Skip if it already uses /dist/ssr
  if (!content.includes("from '@phosphor-icons/react'")) {
    continue;
  }
  
  // Replace all occurrences of the main package import with ssr subpath
  const patched = content.replaceAll(
    "from '@phosphor-icons/react'",
    "from '@phosphor-icons/react/dist/ssr'"
  );
  
  if (patched !== content) {
    fs.writeFileSync(filePath, patched, 'utf8');
    console.log(`✅ Patched: ${path.relative(srcDir, filePath)}`);
    patchedCount++;
  }
}

console.log(`\nDone. Patched ${patchedCount} server component files. Skipped ${skippedCount} client components.`);
