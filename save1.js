// Usage: node save1.js <content_txt_path> <output_path>
const fs = require('fs');
const src = process.argv[2], out = process.argv[3];
const raw = fs.readFileSync(src, 'utf8').trim();
const m = raw.match(/^Result:\s*"([\s\S]*)"$/);
const b64 = m ? m[1] : raw;
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('saved', out, fs.statSync(out).size, 'bytes');
