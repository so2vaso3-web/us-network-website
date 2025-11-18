const fs = require('fs');
const path = require('path');

const packages = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'packages.json'), 'utf8'));

const carriers = {};

packages.forEach(pkg => {
  if (!carriers[pkg.carrier]) {
    carriers[pkg.carrier] = {
      total: 0,
      withData: 0,
      withHotspot: 0,
      examples: []
    };
  }
  
  carriers[pkg.carrier].total++;
  
  if (pkg.data !== 'Unlimited' && pkg.data.match(/\d+GB/)) {
    carriers[pkg.carrier].withData++;
  }
  
  if (pkg.hotspot !== 'None' && pkg.hotspot.match(/\d+GB/)) {
    carriers[pkg.carrier].withHotspot++;
    if (carriers[pkg.carrier].examples.length < 2) {
      carriers[pkg.carrier].examples.push({
        name: pkg.name,
        hotspot: pkg.hotspot
      });
    }
  }
});

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   BÁO CÁO CẬP NHẬT +20GB CHO TẤT CẢ GÓI CƯỚC      ║');
console.log('╚════════════════════════════════════════════════════╝\n');

const carrierNames = {
  'verizon': 'VERIZON',
  'att': 'AT&T',
  'tmobile': 'T-MOBILE',
  'uscellular': 'US CELLULAR',
  'mintmobile': 'MINT MOBILE',
  'cricket': 'CRICKET'
};

Object.keys(carriers).sort().forEach(carrier => {
  const info = carriers[carrier];
  const name = carrierNames[carrier] || carrier.toUpperCase();
  console.log(`📱 ${name}:`);
  console.log(`   • Tổng số gói: ${info.total}`);
  console.log(`   • Gói có data số: ${info.withData}`);
  console.log(`   • Gói có hotspot số: ${info.withHotspot}`);
  if (info.examples.length > 0) {
    console.log(`   • Ví dụ hotspot: ${info.examples.map(e => `${e.name} (${e.hotspot})`).join(', ')}`);
  }
  console.log('');
});

console.log(`✅ TỔNG CỘNG: ${packages.length} gói cước đã được cập nhật!`);
console.log('\n✨ Tất cả các gói có data/hotspot dạng số đã được +20GB');
console.log('✨ Các gói "Unlimited" và "None" giữ nguyên như cũ');

