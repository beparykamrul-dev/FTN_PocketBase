const CACHE='ftn-local-shell-v2';
const CORE=['/','/workspace.html','/note-editor.html','/ftn-workspace.css','/ftn-workspace.js','/ftn-note-editor.js','/ftn-preview.js','/ftn-ux.js','/ftn-ux.css','/pwa.js','/manifest.webmanifest','/ftn-icon.svg'];
const isSameOrigin=u=>u.origin===self.location.origin;
const isApi=u=>u.pathname.startsWith('/api/')||u.pathname.startsWith('/_/');
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ftn-local-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);if(!isSameOrigin(u)||isApi(u))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(()=>caches.match(req).then(r=>r||caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r})));
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
