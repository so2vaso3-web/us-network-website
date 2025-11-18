const fs = require('fs');
const path = require('path');

// Read the packages.json file
const packagesPath = path.join(__dirname, '..', 'data', 'packages.json');
const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

// Function to extract number from string like "5GB" or "10GB"
function extractGB(value) {
  if (value === 'Unlimited' || value === 'None') {
    return null;
  }
  const match = value.match(/(\d+)GB/i);
  return match ? parseInt(match[1], 10) : null;
}

let updatedCount = 0;

// Process each package
packages.forEach(pkg => {
  // Check if name contains a number with GB (e.g., "3GB Plan", "5GB Plan (12 months)")
  const nameMatch = pkg.name.match(/(\d+)GB/i);
  
  if (nameMatch) {
    const oldGB = parseInt(nameMatch[1], 10);
    
    // Get the actual data value
    const dataGB = extractGB(pkg.data);
    
    // If data is a number and different from name, update the name
    if (dataGB !== null && dataGB !== oldGB) {
      const newName = pkg.name.replace(/(\d+)GB/i, `${dataGB}GB`);
      console.log(`📝 ${pkg.carrier.toUpperCase()}: "${pkg.name}" → "${newName}"`);
      pkg.name = newName;
      updatedCount++;
    }
  }
});

// Write the updated packages back to the file
fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2), 'utf8');

console.log(`\n✅ Đã cập nhật ${updatedCount} tên gói cước!`);

