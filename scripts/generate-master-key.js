#!/usr/bin/env node

/**
 * Script to generate a secure Master Key for encryption
 * Usage: node scripts/generate-master-key.js
 */

const crypto = require('crypto');

// Generate a 32-character hex string (16 bytes)
const masterKey = crypto.randomBytes(16).toString('hex');

console.log('\n🔑 Master Key Generated:\n');
console.log('='.repeat(50));
console.log(masterKey);
console.log('='.repeat(50));
console.log('\n📝 Instructions:');
console.log('1. Copy the key above');
console.log('2. Go to Vercel Dashboard → Project Settings → Environment Variables');
console.log('3. Add new variable:');
console.log('   Name: MASTER_KEY');
console.log('   Value: (paste the key above)');
console.log('4. Save and redeploy your project');
console.log('\n⚠️  IMPORTANT: Keep this key secure! If you lose it, you cannot decrypt existing data.\n');

