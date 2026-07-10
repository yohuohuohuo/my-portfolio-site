import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.join(process.cwd(), '.next', 'server', 'pages-manifest.json');
const requiredRoutes = ['/', '/mint-forest'];
const forbiddenRouteFragments = ['/home', '/components/', '/sections/', '/views/', '/lucky-spin/'];

if (!fs.existsSync(manifestPath)) {
  console.error(`Missing pages manifest: ${manifestPath}. Run npm run build first.`);
  process.exit(1);
}

let manifest;

try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`Unable to read pages manifest: ${error.message}`);
  process.exit(1);
}

const routes = Object.keys(manifest);
const missingRoutes = requiredRoutes.filter((route) => !routes.includes(route));
const forbiddenRoutes = routes.filter((route) =>
  forbiddenRouteFragments.some((fragment) => route.includes(fragment)),
);

if (missingRoutes.length > 0 || forbiddenRoutes.length > 0) {
  if (missingRoutes.length > 0) {
    console.error(`Missing required routes: ${missingRoutes.join(', ')}`);
  }

  if (forbiddenRoutes.length > 0) {
    console.error(`Forbidden page routes: ${forbiddenRoutes.join(', ')}`);
  }

  process.exit(1);
}

console.log(`Route verification passed (${routes.length} routes).`);
