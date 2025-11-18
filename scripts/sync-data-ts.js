const fs = require('fs');
const path = require('path');

// Read the updated packages.json
const packagesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'packages.json'), 'utf8'));

// Convert JSON packages to TypeScript format
function formatPackage(pkg) {
  const formatted = {
    id: `'${pkg.id}'`,
    carrier: `'${pkg.carrier}'`,
    name: `'${pkg.name.replace(/'/g, "\\'")}'`,
    price: pkg.price,
    period: `'${pkg.period}'`,
    data: `'${pkg.data}'`,
    speed: `'${pkg.speed}'`,
    hotspot: `'${pkg.hotspot}'`,
    features: `[${pkg.features.map(f => `'${f.replace(/'/g, "\\'")}'`).join(', ')}]`,
  };
  
  if (pkg.badge) {
    formatted.badge = `'${pkg.badge}'`;
  }
  
  return formatted;
}

// Group packages by carrier and period
const grouped = {};
packagesJson.forEach(pkg => {
  const key = `${pkg.carrier}-${pkg.period}`;
  if (!grouped[key]) {
    grouped[key] = [];
  }
  grouped[key].push(pkg);
});

// Generate TypeScript code
let tsCode = `import { Package } from '@/types';\n\n`;
tsCode += `export const defaultPackages: Package[] = [\n`;

// Carrier order
const carrierOrder = ['verizon', 'att', 'tmobile', 'uscellular', 'mintmobile', 'cricket'];
const periodOrder = ['month', 'year'];

carrierOrder.forEach(carrier => {
  periodOrder.forEach(period => {
    const key = `${carrier}-${period}`;
    const packages = grouped[key] || [];
    
    if (packages.length > 0) {
      // Add comment
      const carrierName = carrier.charAt(0).toUpperCase() + carrier.slice(1).replace('mobile', ' Mobile').replace('cellular', ' Cellular');
      const periodName = period === 'month' ? 'Monthly' : 'Annual';
      tsCode += `  // ${carrierName} - ${periodName} Plans (Giá rẻ hơn 55% so với giá thật, sắp xếp từ rẻ đến đắt)\n`;
      
      packages.forEach(pkg => {
        const formatted = formatPackage(pkg);
        tsCode += `  {\n`;
        tsCode += `    id: ${formatted.id},\n`;
        tsCode += `    carrier: ${formatted.carrier},\n`;
        tsCode += `    name: ${formatted.name},\n`;
        tsCode += `    price: ${formatted.price},\n`;
        tsCode += `    period: ${formatted.period},\n`;
        tsCode += `    data: ${formatted.data},\n`;
        tsCode += `    speed: ${formatted.speed},\n`;
        tsCode += `    hotspot: ${formatted.hotspot},\n`;
        tsCode += `    features: ${formatted.features},\n`;
        if (formatted.badge) {
          tsCode += `    badge: ${formatted.badge},\n`;
        }
        tsCode += `  },\n`;
      });
      
      tsCode += `\n`;
    }
  });
});

tsCode += `];\n`;

// Write to data.ts
const dataTsPath = path.join(__dirname, '..', 'src', 'lib', 'data.ts');
fs.writeFileSync(dataTsPath, tsCode, 'utf8');

console.log('✅ Đã đồng bộ dữ liệu từ packages.json sang data.ts!');
console.log(`   Tổng số gói: ${packagesJson.length}`);

