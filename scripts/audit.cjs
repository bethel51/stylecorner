const fs = require('fs');
const path = require('path');

console.log('=== STYLE CORNER COMPREHENSIVE STATIC BUG CHECK ===\n');

function getFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('dist')) {
        results = results.concat(getFiles(full, exts));
      }
    } else {
      if (exts.some(ext => full.endsWith(ext))) results.push(full);
    }
  });
  return results;
}

// 1. ROUTE INTEGRITY CHECK
const appContent = fs.readFileSync('src/App.jsx', 'utf8');
const definedRoutes = new Set();
const routeRegex = /path=["']([^"']+)["']/g;
let rm;
while ((rm = routeRegex.exec(appContent)) !== null) {
  definedRoutes.add(rm[1]);
}
console.log(`✓ App defines ${definedRoutes.size} routes:`, Array.from(definedRoutes).sort());

const srcFiles = getFiles('src', ['.jsx', '.js']);
let brokenNavigations = [];
const navRegex = /navigate\(\s*[`"']([^`"'$?#]+)/g;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let nm;
  while ((nm = navRegex.exec(content)) !== null) {
    const target = nm[1];
    if (target === '-1' || target === '1' || target.startsWith('http') || target === '') continue;
    // Check if target matches any defined route (exact or parameter)
    const matches = Array.from(definedRoutes).some(r => {
      if (r === target) return true;
      if (r.includes(':')) {
        const base = r.split('/:')[0];
        if (target.startsWith(base)) return true;
      }
      return false;
    });
    if (!matches) {
      brokenNavigations.push({ file, target });
    }
  }
});

if (brokenNavigations.length > 0) {
  console.log('\n⚠️ POTENTIAL UNMATCHED NAVIGATION PATHS:');
  brokenNavigations.forEach(b => console.log(`  ${b.file} -> ${b.target}`));
} else {
  console.log('✓ All navigate(...) destinations match defined routes!');
}

// 2. MISSING LUCIDE ICONS CHECK
const knownLucideNames = new Set([
  'Check', 'CheckCircle', 'CheckCircle2', 'X', 'XCircle', 'AlertCircle', 'AlertTriangle',
  'Info', 'Search', 'Filter', 'Calendar', 'Clock', 'MapPin', 'Phone', 'Mail', 'User', 'Users',
  'Lock', 'Key', 'Eye', 'EyeOff', 'ChevronRight', 'ChevronLeft', 'ChevronDown', 'ChevronUp',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Plus', 'Minus', 'Trash', 'Trash2',
  'Edit', 'Edit2', 'Edit3', 'Camera', 'Upload', 'Download', 'Share', 'Share2', 'Heart',
  'Star', 'ShoppingBag', 'ShoppingCart', 'CreditCard', 'DollarSign', 'Shield', 'ShieldCheck',
  'Sparkles', 'Scissors', 'Sliders', 'SlidersHorizontal', 'Menu', 'LogOut', 'RefreshCw',
  'FileText', 'HelpCircle', 'MessageSquare', 'Send', 'Gift', 'Tag', 'History', 'Landmark', 'Wand'
]);

let missingIcons = [];
srcFiles.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  const importedIcons = new Set(
    lucideMatch ? lucideMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]) : []
  );

  const tagRegex = /<([A-Z][A-Za-z0-9]+)[\s/>]/g;
  let tm;
  while ((tm = tagRegex.exec(content)) !== null) {
    const tag = tm[1];
    if (knownLucideNames.has(tag) && !importedIcons.has(tag)) {
      // Make sure it wasn't imported from another component
      const isLocallyImported = content.includes(`import { ${tag}`) || content.includes(`import ${tag}`) || content.includes(`const ${tag}`);
      if (!isLocallyImported) {
        missingIcons.push({ file, tag });
      }
    }
  }
});

if (missingIcons.length > 0) {
  console.log('\n🚨 MISSING LUCIDE ICON IMPORTS:');
  missingIcons.forEach(m => console.log(`  ${m.file}: <${m.tag} /> used without import`));
} else {
  console.log('✓ Zero missing Lucide icon imports found across all JSX files!');
}

// 3. API METHOD COHERENCE CHECK
const apiContent = fs.readFileSync('src/services/api.js', 'utf8');
const serverContent = fs.readFileSync('server/server.js', 'utf8');

const apiEndpoints = [];
const fetchRegex = /fetchWithTimeout\(`?\${API_BASE}([^`"'\s?]+)/g;
let fm;
while ((fm = fetchRegex.exec(apiContent)) !== null) {
  apiEndpoints.push(fm[1]);
}
console.log(`\n✓ Checking ${apiEndpoints.length} frontend API endpoints against server...`);

let missingServerRoutes = [];
apiEndpoints.forEach(ep => {
  // Convert endpoint to route regex pattern (e.g. /bookings/:id)
  const base = ep.split('/')[1]; // e.g. 'bookings', 'products', 'wallet'
  if (!serverContent.includes(`/api/${base}`) && !serverContent.includes(`'/api/${base}'`)) {
    missingServerRoutes.push(ep);
  }
});

if (missingServerRoutes.length > 0) {
  console.log('⚠️ UNMATCHED API ENDPOINTS ON SERVER:', missingServerRoutes);
} else {
  console.log('✓ All frontend API base paths exist in server.js!');
}

console.log('\n=== STATIC AUDIT COMPLETE ===');
