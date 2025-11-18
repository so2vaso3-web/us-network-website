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

// Function to add 20GB to a value
function add20GB(value) {
  if (value === 'Unlimited' || value === 'None') {
    return value;
  }
  const gb = extractGB(value);
  if (gb !== null) {
    return `${gb + 20}GB`;
  }
  return value;
}

let updatedCount = 0;
const updates = [];

// Process each package
packages.forEach(pkg => {
  const oldPrice = pkg.price;
  const oldData = pkg.data;
  const oldHotspot = pkg.hotspot;
  
  // 1. Tăng giá thêm $20
  pkg.price = pkg.price + 20;
  
  // 2. Tăng data thêm 20GB
  if (pkg.data !== 'Unlimited') {
    pkg.data = add20GB(pkg.data);
  }
  
  // 3. Tăng hotspot thêm 20GB
  if (pkg.hotspot !== 'None') {
    pkg.hotspot = add20GB(pkg.hotspot);
  }
  
  // 4. Update features array
  if (pkg.features && Array.isArray(pkg.features)) {
    pkg.features = pkg.features.map(feature => {
      // Update hotspot mentions in features
      const hotspotMatch = feature.match(/(\d+)GB\s+hotspot/i);
      if (hotspotMatch) {
        const oldGB = parseInt(hotspotMatch[1], 10);
        const newGB = oldGB + 20;
        return feature.replace(/(\d+)GB\s+hotspot/i, `${newGB}GB hotspot`);
      }
      
      // Update mobile hotspot mentions
      const mobileHotspotMatch = feature.match(/(\d+)GB\s+mobile\s+hotspot/i);
      if (mobileHotspotMatch) {
        const oldGB = parseInt(mobileHotspotMatch[1], 10);
        const newGB = oldGB + 20;
        return feature.replace(/(\d+)GB\s+mobile\s+hotspot/i, `${newGB}GB mobile hotspot`);
      }
      
      // Update data mentions (only for non-unlimited packages)
      if (pkg.data !== 'Unlimited') {
        const dataMatch = feature.match(/(\d+)GB\s+high-speed\s+data/i);
        if (dataMatch) {
          const oldGB = parseInt(dataMatch[1], 10);
          const newGB = oldGB + 20;
          return feature.replace(/(\d+)GB\s+high-speed\s+data/i, `${newGB}GB high-speed data`);
        }
      }
      
      return feature;
    });
  }
  
  // Track changes
  if (oldPrice !== pkg.price || oldData !== pkg.data || oldHotspot !== pkg.hotspot) {
    updates.push({
      carrier: pkg.carrier,
      name: pkg.name,
      price: `$${oldPrice} → $${pkg.price}`,
      data: `${oldData} → ${pkg.data}`,
      hotspot: `${oldHotspot} → ${pkg.hotspot}`
    });
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
console.log('║   CẬP NHẬT: +$20 VÀ +20GB CHO TẤT CẢ GÓI          ║');
console.log('╚════════════════════════════════════════════════════╝\n');

Object.keys(byCarrier).sort().forEach(carrier => {
  console.log(`📱 ${carrier.toUpperCase()}: ${byCarrier[carrier].length} gói`);
  // Show first 3 examples
  byCarrier[carrier].slice(0, 3).forEach(u => {
    console.log(`   • ${u.name}`);
    console.log(`     Giá: ${u.price}`);
    console.log(`     Data: ${u.data}`);
    console.log(`     Hotspot: ${u.hotspot}`);
  });
  if (byCarrier[carrier].length > 3) {
    console.log(`   ... và ${byCarrier[carrier].length - 3} gói khác`);
  }
  console.log('');
});

console.log(`✅ Đã cập nhật ${updatedCount} gói cước!`);
console.log(`   • Tất cả giá tăng thêm $20`);
console.log(`   • Tất cả data/hotspot tăng thêm 20GB`);

