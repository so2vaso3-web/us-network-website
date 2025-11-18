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
const updates = [];

// Process each package
packages.forEach(pkg => {
  const dataGB = extractGB(pkg.data);
  const hotspotGB = extractGB(pkg.hotspot);
  
  // Check if name already contains GB number
  const hasGBInName = /\d+GB/i.test(pkg.name);
  
  // If name doesn't have GB and has hotspot >= 20GB, add it
  if (!hasGBInName && hotspotGB !== null && hotspotGB >= 20) {
    const oldName = pkg.name;
    let newName = pkg.name;
    
    // If name has (Annual) or (12 months), insert before it
    if (pkg.name.includes('(Annual)')) {
      newName = pkg.name.replace('(Annual)', `(${hotspotGB}GB Hotspot - Annual)`);
    } else if (pkg.name.includes('(12 months)')) {
      newName = pkg.name.replace('(12 months)', `(${hotspotGB}GB Hotspot - 12 months)`);
    } else {
      newName = `${pkg.name} (${hotspotGB}GB Hotspot)`;
    }
    
    updates.push({
      carrier: pkg.carrier,
      old: oldName,
      new: newName
    });
    pkg.name = newName;
    updatedCount++;
  }
});

// Write the updated packages back to the file
fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2), 'utf8');

// Group updates by carrier
const byCarrier = {};
updates.forEach(u => {
  if (!byCarrier[u.carrier]) byCarrier[u.carrier] = [];
  byCarrier[u.carrier].push(u);
});

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CẬP NHẬT CÁC GÓI CÒN LẠI                       ║');
console.log('╚════════════════════════════════════════════════════╝\n');

Object.keys(byCarrier).sort().forEach(carrier => {
  console.log(`📱 ${carrier.toUpperCase()}:`);
  byCarrier[carrier].forEach(u => {
    console.log(`   "${u.old}" → "${u.new}"`);
  });
  console.log('');
});

console.log(`✅ Đã cập nhật thêm ${updatedCount} tên gói!`);

