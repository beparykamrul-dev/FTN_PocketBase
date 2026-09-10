/* FTN Local UX extension. Enhances the existing vanilla UI without replacing core crypto/auth. */
(()=>{
  const $=id=>document.getElementById(id);
  let selected=null;
  function toast(message){let el=$('ftnToast');if(!el){el=document.createElement('div');el.id='ftnToast';el.className='ftn-toast';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}
  function inspector(note){
    selected=note;
    let el=$('fileInspector');
    if(!el){el=document.createElement('aside');el.id='fileInspector';el.className='file-inspector';document.body.appendChild(el)}
    const attachment=note.attachment||'';
    el.innerHTML='<button class="inspector-close" aria-label="Close">×</button><h3>Item details</h3>'+
      '<div class="kpi"><span>Record</span><span>'+esc(note.id)+'</span></div><div class="kpi"><span>Created</span><span>'+esc(new Date(note.created).toLocaleString())+'</span></div><div class="kpi"><span>Type</span><span>'+(attachment?'Encrypted attachment':'Secure note')+'</span></div><div class="kpi"><span>Attachment</span><span>'+esc(attachment||'None')+'</span></div><div class="kpi"><span>Encryption</span><span>AES-GCM</span></div>';
    el.querySelector('.inspector-close').onclick=()=>el.remove();
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function enhanceRows(){document.querySelectorAll('#notesList .file-row').forEach(row=>{if(row.dataset.ftnEnhanced)return;row.dataset.ftnEnhanced='1';const meta=row.querySelector('.file-meta');const id=(meta?.textContent||'').split(' · ')[0];const note=window.NOTES?.find?.(n=>n.id===id);if(!note)return;row.title='Open item details';row.addEventListener('click',e=>{if(e.target.closest('button'))return;document.querySelectorAll('.file-row.selected').forEach(x=>x.classList.remove('selected'));row.classList.add('selected');inspector(note)})})}
  function addBrowserTools(){const browser=document.querySelector('#notes .browser');if(!browser||browser.dataset.ftnTools)return;browser.dataset.ftnTools='1';const files=browser.querySelector('.files');if(!files)return;const crumb=document.createElement('div');crumb.className='breadcrumb';crumb.innerHTML='<button type="button">FTN Local</button><span>›</span><span>Notes & Files</span><span>›</span><strong>Encrypted</strong>';files.insertBefore(crumb,files.firstChild);const search=$('fileSearch');if(search)search.placeholder='Search encrypted records';toast('FTN Local file browser ready')}
  const observer=new MutationObserver(()=>enhanceRows());
  document.addEventListener('DOMContentLoaded',()=>{addBrowserTools();enhanceRows();observer.observe(document.body,{subtree:true,childList:true});document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('fileSearch')?.focus()}if(e.key==='Escape')$('fileInspector')?.remove()});const s=document.createElement('script');s.src='/pwa.js';s.defer=true;document.head.appendChild(s)});
  window.FTNLocalUX={toast,inspect:inspector};
})();
