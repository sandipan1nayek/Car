#!/usr/bin/env node

/**
 * PRE-DEPLOYMENT VERIFICATION SCRIPT
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 UBAR Deployment Verification\n');
console.log('=' .repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check 1: Backend package.json
console.log('\n✅ Checking backend configuration...');
const backendPkg = require('./backend/package.json');
if (!backendPkg.scripts.start) {
  console.error('❌ ERROR: backend/package.json missing "start" script');
  hasErrors = true;
} else if (backendPkg.scripts.start !== 'node src/server.js') {
  console.warn('⚠️  WARNING: start script is not "node src/server.js"');
  hasWarnings = true;
} else {
  console.log('   ✓ Start script: ' + backendPkg.scripts.start);
}

// Check 2: Mobile package.json
console.log('\n✅ Checking mobile configuration...');
const mobilePkg = require('./mobile/package.json');
if (!mobilePkg.dependencies.expo) {
  console.error('❌ ERROR: Expo not found in mobile/package.json');
  hasErrors = true;
} else {
  console.log('   ✓ Expo version: ' + mobilePkg.dependencies.expo);
}

// Check 3: app.json
console.log('\n✅ Checking app.json...');
const appJson = require('./mobile/app.json');
if (!appJson.expo.android?.package) {
  console.error('❌ ERROR: Android package not defined in app.json');
  hasErrors = true;
} else {
  console.log('   ✓ Package: ' + appJson.expo.android.package);
}
if (!appJson.expo.android?.permissions) {
  console.warn('⚠️  WARNING: Android permissions not defined');
  hasWarnings = true;
} else {
  console.log('   ✓ Permissions: ' + appJson.expo.android.permissions.join(', '));
}

// Check 4: eas.json
console.log('\n✅ Checking EAS configuration...');
const easJson = require('./mobile/eas.json');
if (!easJson.build?.production) {
  console.error('❌ ERROR: Production build profile not found in eas.json');
  hasErrors = true;
} else {
  console.log('   ✓ Production profile configured');
}

// Check 5: API config file
console.log('\n✅ Checking API configuration...');
const apiConfigPath = './mobile/src/config/api.config.js';
if (!fs.existsSync(apiConfigPath)) {
  console.error('❌ ERROR: API config file not found');
  hasErrors = true;
} else {
  const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  if (apiConfig.includes('192.168.') && apiConfig.includes('USE_PRODUCTION = true')) {
    console.error('❌ ERROR: API config still has local IP with production enabled');
    hasErrors = true;
  } else if (apiConfig.includes('your-app.up.railway.app') && apiConfig.includes('USE_PRODUCTION = true')) {
    console.error('❌ ERROR: API config has placeholder URL with production enabled');
    hasErrors = true;
  } else {
    console.log('   ✓ API config file exists');
  }
}

// Check 6: .env files not in git
console.log('\n✅ Checking .env security...');
const gitignore = fs.readFileSync('./.gitignore', 'utf8');
if (!gitignore.includes('.env')) {
  console.error('❌ ERROR: .env not in .gitignore');
  hasErrors = true;
} else {
  console.log('   ✓ .env files are ignored');
}

// Check 7: .env.example exists
if (!fs.existsSync('./backend/.env.example')) {
  console.warn('⚠️  WARNING: backend/.env.example not found (helpful for Railway)');
  hasWarnings = true;
} else {
  console.log('   ✓ .env.example exists');
}

// Check 8: Backend has required files
console.log('\n✅ Checking backend structure...');
const requiredFiles = [
  './backend/src/server.js',
  './backend/src/config/database.js',
  './backend/package.json'
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ ERROR: Required file missing: ${file}`);
    hasErrors = true;
  }
}
console.log('   ✓ All required backend files present');

// Check 9: Mobile has required files
console.log('\n✅ Checking mobile structure...');
const requiredMobileFiles = [
  './mobile/App.js',
  './mobile/app.json',
  './mobile/eas.json',
  './mobile/package.json'
];
for (const file of requiredMobileFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ ERROR: Required file missing: ${file}`);
    hasErrors = true;
  }
}
console.log('   ✓ All required mobile files present');

// Final report
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ VERIFICATION FAILED - Fix errors before deploying!');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
  console.log('   Review warnings above, but safe to proceed.');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log('\n📝 Next steps:');
  console.log('   1. Read DEPLOYMENT_GUIDE.md');
  console.log('   2. Deploy backend to Railway');
  console.log('   3. Update api.config.js with Railway URL');
  console.log('   4. Test on Expo Go FIRST');
  console.log('   5. Build production APK');
  process.exit(0);
}
