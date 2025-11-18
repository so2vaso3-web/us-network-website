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

// Process each package
packages.forEach(pkg => {
  // Update data field
  if (pkg.data !== 'Unlimited') {
    pkg.data = add20GB(pkg.data);
  }
  
  // Update hotspot field
  if (pkg.hotspot !== 'None') {
    pkg.hotspot = add20GB(pkg.hotspot);
  }
  
  // Update features array to reflect new hotspot values
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
});

// Write the updated packages back to the file
fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2), 'utf8');

console.log(`✅ Đã cập nhật ${packages.length} gói cước, thêm 20GB cho tất cả các gói!`);
console.log('\nVí dụ các thay đổi:');
console.log('- Gói có 5GB hotspot → 25GB hotspot');
console.log('- Gói có 10GB data → 30GB data');
console.log('- Gói Unlimited data → giữ nguyên Unlimited');

