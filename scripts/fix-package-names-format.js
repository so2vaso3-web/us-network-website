const fs = require('fs');
const path = require('path');

// Read the packages.json file
const packagesPath = path.join(__dirname, '..', 'data', 'packages.json');
const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

let fixedCount = 0;

// Process each package to fix format
packages.forEach(pkg => {
  // Fix names with double parentheses like "Value Plus (Annual) (23GB Hotspot)"
  // Should be "Value Plus (Annual - 23GB Hotspot)"
  if (pkg.name.includes('(Annual) (') || pkg.name.includes('(12 months) (')) {
    const oldName = pkg.name;
    // Replace "(Annual) (" with "(Annual - " or "(12 months) (" with "(12 months - "
    pkg.name = pkg.name.replace(/\(Annual\)\s*\(/g, '(Annual - ').replace(/\(12 months\)\s*\(/g, '(12 months - ');
    console.log(`📝 ${pkg.carrier.toUpperCase()}: "${oldName}" → "${pkg.name}"`);
    fixedCount++;
  }
});

// Write the updated packages back to the file
fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2), 'utf8');

console.log(`\n✅ Đã sửa format cho ${fixedCount} tên gói!`);

