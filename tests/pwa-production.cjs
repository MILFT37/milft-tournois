const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const app='MILFT_Tournois_V1_1_PRODUCTION_PRETE_2026-11-17.html';
const html=fs.readFileSync(app,'utf8');
const sw=fs.readFileSync('sw.production.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.production.webmanifest','utf8'));
assert.match(html,/serviceWorker\.register\('\.\/sw\.production\.js'/);
assert.equal(manifest.display,'standalone');
assert.equal(manifest.scope,'./');
assert.ok(manifest.icons.some(i=>i.sizes==='192x192'));
assert.ok(manifest.icons.some(i=>i.sizes==='512x512'));
const handlers={},cached=new Map(),scope='https://milft37.github.io/milft-tournois/';
const cache={addAll:async paths=>{for(const p of paths){assert.ok(fs.existsSync(p.replace(/^\.\//,'')),p);cached.set(new URL(p,scope).href,{path:p,offline:true})}},match:async req=>cached.get(typeof req==='string'?new URL(req,scope).href:req.url)};
const ctx={URL,console,self:{location:{origin:new URL(scope).origin},registration:{scope},addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:()=>{},clients:{claim:()=>{}}},caches:{open:async()=>cache,match:cache.match,keys:async()=>[],delete:async()=>true},fetch:async()=>{throw Error('offline')}};
vm.runInNewContext(sw,ctx);
(async()=>{
let installing;handlers.install({waitUntil:p=>installing=p});await installing;
assert.equal(cached.size,5);
for(const path of ['','index.html',app]){
let response;handlers.fetch({request:{url:new URL(path,scope).href,method:'GET',mode:'navigate'},respondWith:p=>response=p});
assert.ok(response,'missing navigation handler: '+path);
assert.equal((await response).offline,true,'offline fallback: '+path);
}
let intercepted=false;handlers.fetch({request:{url:new URL('private-backup.json',scope).href,method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
console.log('Production PWA checks OK: manifest, offline shell, root and index, backup isolation');
})().catch(err=>{console.error(err);process.exitCode=1});
