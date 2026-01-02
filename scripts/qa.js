#!/usr/bin/env node
/**
 * QA Script - Runs typecheck, lint, and build checks
 * Usage: node scripts/qa.js
 */

const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(name, command) {
  log(`\n▶ ${name}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${name} passed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name} failed`, 'red');
    return false;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║        AKORD APP - QA PROVJERA         ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');

  const startTime = Date.now();
  const results = [];

  // 1. TypeScript check
  results.push({
    name: 'TypeScript',
    passed: runCommand('TypeScript provjera', 'npx tsc --noEmit'),
  });

  // 2. ESLint check
  results.push({
    name: 'ESLint',
    passed: runCommand('ESLint provjera', 'npx eslint src --ext .ts,.tsx --max-warnings 50'),
  });

  // 3. Build check
  results.push({
    name: 'Build',
    passed: runCommand('Build provjera', 'npx vite build'),
  });

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║              SAŽETAK                   ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');
  
  results.forEach(r => {
    const icon = r.passed ? '✓' : '✗';
    const color = r.passed ? 'green' : 'red';
    log(`  ${icon} ${r.name}`, color);
  });

  log(`\nVrijeme: ${elapsed}s`, 'cyan');
  log(`Rezultat: ${passed}/${results.length} provjera prošlo`, passed === results.length ? 'green' : 'yellow');

  if (failed > 0) {
    log('\n⚠ Neke provjere nisu prošle. Pregledajte greške iznad.', 'red');
    process.exit(1);
  } else {
    log('\n✓ Sve QA provjere su prošle!', 'green');
    process.exit(0);
  }
}

main();
