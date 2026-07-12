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
  ['Mint Chain RPC/explorer/bridge/swap URL', /https?:\/\/[^\s'"`]*(?:rpc|explorer|bridge|swap)\.mintchain\.io[^\s'"`]*/i],
  ['Mint Chain RPC/explorer/bridge/swap host', /(?:rpc|explorer|bridge|swap)\.mintchain\.io/i],
  ['NFTScan', /nftscan/i],
  ['RainbowKit', /@rainbow-me\/rainbowkit|\brainbowkit\b/i],
  ['wagmi', /\bwagmi\b/i],
  ['viem', /\bviem\b/i],
  ['WalletConnect', /walletconnect/i],
  ['ethers', /\bethers(?:\.js)?\b/i],
  ['OAuth', /\boauth\b|useConnectModal|useSignMessage/i],
  ['social verification URL', /https?:\/\/[^\s'"`]*(?:twitter\.com|x\.com|discord\.com)(?:[^\s'"`]*)/i],
  ['Twitter SDK', /twitter-api-sdk/i],
  ['Google reCAPTCHA', /recaptcha/i],
  ['Google Analytics', /google-analytics|googletagmanager|\bgtag\b/i],
  ['contract ABI import', /(?:from|import\()\s*['"][^'"]*(?:\/abi|ethers|wagmi|viem)(?:\/|['"])/i],
  ['writeContract', /\bwriteContract\b/],
  ['sendTransaction', /\bsendTransaction\b/],
  ['waitForTransactionReceipt', /\bwaitForTransactionReceipt\b/],
  ['chain execution identifier', /GreenIdAddress|MintForestContract|ForestContract|shouldMintChain|Mint(?:Main|Test)/i],
  ['remote static URL identifier', /staticUrl|greenIdTokenUrl|\bBaseApi\b/],
  ['legacy asset prefix', /["'`]\/forest\//],
  ['direct Axios usage', /(?:from\s*['"]axios['"]|require\(\s*['"]axios['"]\s*\)|axios\s*\.create|\baxios\s*\()/i],
  ['shared runtime import', /@\/shared(?:\/|['"])/],
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

  const relativePath = path.relative(process.cwd(), filePath);
  if (relativePath.startsWith('src/') && !relativePath.endsWith('local-storage.repository.ts')) {
    if (/\b(?:window\.)?localStorage\b|\bsessionStorage\b/.test(source)) {
      findings.push({ filePath: relativePath, rule: 'direct browser storage access' });
    }
  }
}

const sharedRoot = path.join(process.cwd(), 'src/shared');
if (fs.existsSync(sharedRoot)) {
  findings.push({ filePath: 'src/shared', rule: 'shared runtime tree remains' });
}

const appPath = path.join(process.cwd(), 'src/pages/_app.tsx');
if (fs.existsSync(appPath)) {
  const appSource = fs.readFileSync(appPath, 'utf8');
  for (const match of appSource.matchAll(/from\s*['"](@\/projects\/mint-forest\/[^'"]+)['"]/g)) {
    if (!match[1].endsWith('.css')) {
      findings.push({ filePath: 'src/pages/_app.tsx', rule: `Mint runtime import in _app: ${match[1]}` });
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
