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

// Copy schema, migrations, seed, sql from prisma/ to dist/generated/prisma/
const rootPrismaDir = path.join(__dirname, '..', 'prisma');
const distGeneratedPrismaDir = path.join(__dirname, '..', 'dist', 'generated', 'prisma');

if (fs.existsSync(rootPrismaDir)) {
  fs.mkdirSync(distGeneratedPrismaDir, { recursive: true });
  // copy schema.prisma
  if (fs.existsSync(path.join(rootPrismaDir, 'schema.prisma'))) {
    fs.copyFileSync(
      path.join(rootPrismaDir, 'schema.prisma'),
      path.join(distGeneratedPrismaDir, 'schema.prisma')
    );
  }
  // copy seed.ts
  if (fs.existsSync(path.join(rootPrismaDir, 'seed.ts'))) {
    fs.copyFileSync(
      path.join(rootPrismaDir, 'seed.ts'),
      path.join(distGeneratedPrismaDir, 'seed.ts')
    );
  }
  // copy migrations/
  if (fs.existsSync(path.join(rootPrismaDir, 'migrations'))) {
    copyDirSync(path.join(rootPrismaDir, 'migrations'), path.join(distGeneratedPrismaDir, 'migrations'));
  }
  // copy sql/
  if (fs.existsSync(path.join(rootPrismaDir, 'sql'))) {
    copyDirSync(path.join(rootPrismaDir, 'sql'), path.join(distGeneratedPrismaDir, 'sql'));
  }
  console.log('Copied database schema, migrations, seed scripts, SQL to dist/generated/prisma/');
}

