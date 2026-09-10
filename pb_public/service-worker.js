const CACHE='ftn-local-shell-v1';
const SHELL=['/','/workspace.html','/note-editor.html','/ftn-workspace.css','/ftn-workspace.js','/ftn-note-editor.js','/ftn-preview.js','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;event.respondWith(fetch(r).then(res=>{if(res.ok&&r.url.includes('/ftn-')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>caches.match(r).then(c=>c||caches.match('/'))))});
