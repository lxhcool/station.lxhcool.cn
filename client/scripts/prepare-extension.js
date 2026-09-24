import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist-extension');
const manifestSrc = path.resolve(__dirname, '../public/manifest.json');
const manifestDest = path.resolve(distDir, 'manifest.json');

console.log('\n===========================================');
console.log('🎉 浏览器扩展打包完成！');
console.log(`📂 输出目录: ${distDir}`);
console.log('📌 安装说明:');
console.log(' 1. 打开 Chrome 或 Edge 浏览器');
console.log(' 2. 访问 chrome://extensions/ 或 edge://extensions/');
console.log(' 3. 开启右上角的 "开发者模式" (Developer mode)');
console.log(' 4. 点击 "加载已解压的扩展程序" (Load unpacked)');
console.log(` 5. 选择目录: ${distDir}`);
console.log(' 6. 打开新标签页即可体验 Station 柔光玻璃起始页！');
console.log('===========================================\n');
