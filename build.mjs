import {mkdir,copyFile,cp,readdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
const pages=(await readdir('.')).filter(file=>file.endsWith('.html'));
for(const file of [...pages,'style.css','app.js','favicon.svg']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
await mkdir('dist/supabase',{recursive:true});
await copyFile('supabase/adapter.js','dist/supabase/adapter.js');
try { await copyFile('supabase/config.js','dist/supabase/config.js'); } catch {}
console.log('Built static app in dist/');
