import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||5176);
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404).end('Not found');}});
server.on('error',error=>{if(error.code==='EADDRINUSE'){console.error(`Port ${port} is already in use. Open http://127.0.0.1:${port}/ or run with PORT=5177 npm run dev.`);process.exit(1);}throw error;});
server.listen(port,'127.0.0.1',()=>console.log(`Phos — http://127.0.0.1:${port}`));

