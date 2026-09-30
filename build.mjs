import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','study.html','edit.html','inner-world.html','panels.html','style.css','app.js','favicon.svg']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
await mkdir('dist/supabase',{recursive:true});
await copyFile('supabase/adapter.js','dist/supabase/adapter.js');
try { await copyFile('supabase/config.js','dist/supabase/config.js'); } catch {}
console.log('Built static app in dist/');
