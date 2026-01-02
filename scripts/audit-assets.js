#!/usr/bin/env node
/**
 * Asset Audit Script - Finds large files in project
 * Usage: node scripts/audit-assets.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function walkDir(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          // Skip node_modules and .git
          if (!['node_modules', '.git', 'dist', '.next'].includes(file)) {
            walkDir(filePath, fileList);
          }
        } else {
          fileList.push({
            path: filePath,
            size: stat.size,
            ext: path.extname(file).toLowerCase(),
          });
        }
      } catch (e) {
        // Skip files we can't read
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  return fileList;
}

function main() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║       AKORD APP - ASSET AUDIT          ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');

  const projectRoot = process.cwd();
  const allFiles = walkDir(projectRoot);

  // Find large files (> 500KB)
  const largeFiles = allFiles
    .filter(f => f.size > 500 * 1024)
    .sort((a, b) => b.size - a.size);

  // Find image files
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
  const imageFiles = allFiles
    .filter(f => imageExtensions.includes(f.ext))
    .sort((a, b) => b.size - a.size);

  // Find PDF files (shouldn't be in repo)
  const pdfFiles = allFiles.filter(f => f.ext === '.pdf');

  // Summary
  log('\n📁 Statistika projekta', 'cyan');
  log(`   Ukupno datoteka: ${allFiles.length}`);
  log(`   Ukupna veličina: ${formatBytes(allFiles.reduce((sum, f) => sum + f.size, 0))}`);

  // Large files report
  log('\n🔴 Velike datoteke (> 500KB)', largeFiles.length > 0 ? 'yellow' : 'green');
  if (largeFiles.length === 0) {
    log('   Nema velikih datoteka', 'green');
  } else {
    largeFiles.forEach(f => {
      const relPath = path.relative(projectRoot, f.path);
      log(`   ${formatBytes(f.size).padStart(10)} | ${relPath}`, 'yellow');
    });
  }

  // Image files report
  log('\n🖼️ Slike (> 100KB)', 'cyan');
  const largeImages = imageFiles.filter(f => f.size > 100 * 1024);
  if (largeImages.length === 0) {
    log('   Nema velikih slika', 'green');
  } else {
    largeImages.forEach(f => {
      const relPath = path.relative(projectRoot, f.path);
      log(`   ${formatBytes(f.size).padStart(10)} | ${relPath}`, 'yellow');
    });
  }

  // PDF files report
  log('\n📄 PDF datoteke u repo-u', pdfFiles.length > 0 ? 'red' : 'green');
  if (pdfFiles.length === 0) {
    log('   Nema PDF datoteka', 'green');
  } else {
    pdfFiles.forEach(f => {
      const relPath = path.relative(projectRoot, f.path);
      log(`   ${formatBytes(f.size).padStart(10)} | ${relPath}`, 'red');
    });
    log('   ⚠️ PDF datoteke ne bi trebale biti u repo-u', 'red');
  }

  // Recommendations
  log('\n💡 Preporuke', 'cyan');
  if (largeFiles.length > 0) {
    log('   • Komprimirajte velike datoteke');
  }
  if (largeImages.length > 0) {
    log('   • Koristite SVG za logotipe i ikone');
    log('   • Smanjite dimenzije slika na max 1200px');
    log('   • Konvertirajte PNG u WebP gdje je moguće');
  }
  if (pdfFiles.length > 0) {
    log('   • Uklonite PDF datoteke iz repo-a');
  }
  if (largeFiles.length === 0 && largeImages.length === 0 && pdfFiles.length === 0) {
    log('   ✓ Projekt izgleda optimizirano!', 'green');
  }

  log('');
}

main();
