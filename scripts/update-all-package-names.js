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
  
  // Check if name already contains a number with GB
  const nameMatch = pkg.name.match(/(\d+)GB/i);
  
  if (nameMatch) {
    // Name already has GB number, update it to match data
    const oldGB = parseInt(nameMatch[1], 10);
    if (dataGB !== null && dataGB !== oldGB) {
      const newName = pkg.name.replace(/(\d+)GB/i, `${dataGB}GB`);
      updates.push({
        carrier: pkg.carrier,
        old: pkg.name,
        new: newName,
        reason: `data: ${oldGB}GB → ${dataGB}GB`
      });
      pkg.name = newName;
      updatedCount++;
    }
  } else {
    // Name doesn't have GB number, add it if there's data/hotspot
    let newName = pkg.name;
    let shouldUpdate = false;
    
    // Priority: use data GB if available, otherwise use hotspot GB
    if (dataGB !== null) {
      // Add data GB to name (e.g., "5G Start" → "5G Start (25GB)")
      if (!pkg.name.includes(`${dataGB}GB`) && !pkg.name.includes('Unlimited')) {
        newName = `${pkg.name} (${dataGB}GB)`;
        shouldUpdate = true;
        updates.push({
          carrier: pkg.carrier,
          old: pkg.name,
          new: newName,
          reason: `thêm data: ${dataGB}GB`
        });
      }
    } else if (hotspotGB !== null && hotspotGB >= 20) {
      // If no data GB but has significant hotspot, add hotspot to name
      if (!pkg.name.includes(`${hotspotGB}GB`) && !pkg.name.includes('Unlimited')) {
        newName = `${pkg.name} (${hotspotGB}GB Hotspot)`;
        shouldUpdate = true;
        updates.push({
          carrier: pkg.carrier,
          old: pkg.name,
          new: newName,
          reason: `thêm hotspot: ${hotspotGB}GB`
        });
      }
    }
    
    if (shouldUpdate) {
      pkg.name = newName;
      updatedCount++;
    }
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
console.log('║   CẬP NHẬT TÊN GÓI CHO TẤT CẢ 6 NHÀ MẠNG        ║');
console.log('╚════════════════════════════════════════════════════╝\n');

Object.keys(byCarrier).sort().forEach(carrier => {
  console.log(`📱 ${carrier.toUpperCase()}:`);
  byCarrier[carrier].forEach(u => {
    console.log(`   "${u.old}" → "${u.new}" (${u.reason})`);
  });
  console.log('');
});

console.log(`✅ Đã cập nhật ${updatedCount} tên gói cước từ tất cả 6 nhà mạng!`);

