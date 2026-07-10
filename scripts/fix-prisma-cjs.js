const fs = require('fs');
const path = require('path');

function patchPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (pkg.type !== 'commonjs') {
    pkg.type = 'commonjs';
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
    return true;
  }
  return false;
}

function patchClientJs(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('import.meta.url')) {
    content = content.replace(
      /globalThis\['__dirname'\]\s*=\s*path\.dirname\(\(0,\s*node_url_1\.fileURLToPath\)\(import\.meta\.url\)\);?/,
      "globalThis['__dirname'] = __dirname;"
    );
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(__dirname, '..', 'generated', 'prisma');
const distDir = path.join(__dirname, '..', 'dist', 'generated', 'prisma');

// Patch source files
patchPackageJson(path.join(srcDir, 'package.json'));
patchClientJs(path.join(srcDir, 'client.js'));

// Copy entire directory to dist
if (fs.existsSync(distDir)) {
  copyDirSync(srcDir, distDir);
  console.log('Patched and copied Prisma CJS files to dist/generated/prisma/');
}
