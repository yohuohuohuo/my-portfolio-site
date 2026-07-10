import fs from 'node:fs';
import path from 'node:path';

const scanTargets = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'next.config.js'),
  path.join(process.cwd(), 'package.json'),
];

const prohibitedPatterns = [
  ['Mint Forest API', /api\.mintforest\.io/i],
  ['Mint Forest CDN', /static\.mintchain\.io/i],
  ['Mint Chain RPC URL', /https?:\/\/[^\s'"`]*mintchain\.io[^\s'"`]*/i],
  ['RainbowKit', /@rainbow-me\/rainbowkit|\brainbowkit\b/i],
  ['wagmi', /\bwagmi\b/i],
  ['viem', /\bviem\b/i],
  ['WalletConnect', /walletconnect/i],
  ['Twitter SDK', /twitter-api-sdk/i],
  ['Google reCAPTCHA', /recaptcha/i],
  ['Google Analytics', /google-analytics|googletagmanager|\bgtag\b/i],
  ['contract ABI import', /(?:from|import\()\s*['"][^'"]*\/abi(?:\/|['"])/i],
  ['writeContract', /\bwriteContract\b/],
  ['sendTransaction', /\bsendTransaction\b/],
];

function collectFiles(target) {
  const stat = fs.statSync(target);

  if (stat.isFile()) {
    return [target];
  }

  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(target, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : entry.isFile() ? [entryPath] : [];
  });
}

const findings = [];

for (const filePath of scanTargets.flatMap(collectFiles)) {
  const source = fs.readFileSync(filePath, 'utf8');

  for (const [rule, pattern] of prohibitedPatterns) {
    if (pattern.test(source)) {
      findings.push({ filePath: path.relative(process.cwd(), filePath), rule });
    }
  }
}

if (findings.length > 0) {
  console.error('Runtime dependency audit failed:');
  for (const { filePath, rule } of findings) {
    console.error(`- ${filePath}: ${rule}`);
  }
  process.exit(1);
}

console.log('Runtime dependency audit passed.');
