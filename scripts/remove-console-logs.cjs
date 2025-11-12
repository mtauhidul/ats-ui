#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript and TSX files
const files = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

let totalRemoved = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const originalContent = content;
  
  // Remove console statements - handles multi-line
  content = content.replace(/console\.(log|debug|info|warn|error)\s*\([^;]*\);?\s*/g, '');
  
  // Clean up empty lines (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalRemoved++;
    console.log(`✅ Cleaned: ${file}`);
  }
});

console.log(`\n🎉 Removed console statements from ${totalRemoved} files`);
