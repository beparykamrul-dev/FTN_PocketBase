/* FTN Local PWA runtime: install/update UX only; never stores auth or workspace data. */
(()=>{
  const show=()=>{
    if(document.getElementById('ftnNetworkStatus'))return;
    const el=document.createElement('div');el.id='ftnNetworkStatus';el.setAttribute('role','status');el.style.cssText='position:fixed;right:14px;bottom:14px;z-index:9999;padding:7px 10px;border:1px solid #1b344a;border-radius:999px;background:#0c1a29;color:#8da4b8;font:700 11px system-ui;box-shadow:0 8px 24px #0006;transition:opacity .25s';document.body.appendChild(el);return el;
  };
  const update=()=>{const el=show();if(!el)return;const online=navigator.onLine;el.textContent=online?'● Online':'○ Offline — local shell only';el.style.color=online?'#6ee7b7':'#fde68a';if(online)setTimeout(()=>{el.style.opacity='.45'},2200);else el.style.opacity='1'};
  const register=async()=>{if(!('serviceWorker' in navigator))return;try{const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/'});reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){const el=show();el.textContent='Update available — reload to apply';el.style.opacity='1';el.style.color='#38bdf8';el.onclick=()=>{w.postMessage({type:'SKIP_WAITING'});location.reload()}}})});}catch(e){console.warn('FTN PWA registration failed',e)}};
  window.addEventListener('online',update);window.addEventListener('offline',update);window.addEventListener('load',()=>{update();register()});
})();
