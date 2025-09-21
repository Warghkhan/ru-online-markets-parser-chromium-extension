const { defineConfig } = require('esbuild');
const typescript = require('esbuild-plugin-typescript');
const fs = require('fs');
const path = require('path');

const contentScripts = [
  'src/content/parser.ts',
  //'src/content/test.ts'
];

module.exports = defineConfig({
  entryPoints: [
    ...contentScripts,
    'src/popup/script.ts',
  ],
  outdir: 'build',
  bundle: true,
  platform: 'browser',
  minify: false,
  plugins: [typescript()],

  async buildStart() {
    const srcPopup = 'src/popup/';
    const destPopup = 'build/popup/';

    if (!fs.existsSync(destPopup)) {
      fs.mkdirSync(destPopup, { recursive: true });
    }

    fs.copyFileSync(
      path.join(srcPopup, 'index.html'),
      path.join(destPopup, 'index.html')
    );

    fs.copyFileSync(
      path.join(srcPopup, 'styles/style.css'),
      path.join(destPopup, 'styles/style.css')
    );
  },
});