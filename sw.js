const CACHE='soba-register-v3';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png','./read-log/','./read-log/index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(req,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;
    if(res)return res;
    if(req.mode==='navigate'){const idx=await c.match(new URL(req.url).pathname.includes('/read-log')?'./read-log/index.html':'./index.html');if(idx)return idx}
    return new Response('',{status:504});
  }));
});
