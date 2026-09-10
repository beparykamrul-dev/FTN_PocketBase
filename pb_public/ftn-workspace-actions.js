/* FTN Local workspace actions — safe UI orchestration around owner-scoped APIs. */
(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const ws=()=>window.FTNWorkspace;
  async function folders(){return ws()?await ws().listFolders():[]}
  function renderTree(items,current='root'){
    const root=$('workspaceTree'); if(!root)return;
    const nodes=ws().tree(items); root.replaceChildren();
    const add=(n,depth=0)=>{
      const b=document.createElement('button'); b.type='button'; b.className='tree-item '+(n.id===current?'active':'');
      b.style.paddingLeft=(9+depth*15)+'px'; b.textContent=(n.id==='root'?'▦ ':'▣ ')+n.name;
      b.dataset.folder=n.id; b.onclick=()=>{window.FTNWorkspaceActions.current=n.id;renderTree(items,n.id);window.dispatchEvent(new CustomEvent('ftn:folder',{detail:n}))}; root.appendChild(b);
      (n.children||[]).forEach(x=>add(x,depth+1));
    }; add(nodes);
  }
  async function refresh(){try{const items=await folders();renderTree(items,window.FTNWorkspaceActions.current||'root');return items}catch(e){if($('workspaceTree'))$('workspaceTree').innerHTML='<div class="small danger">'+esc(e.message)+'</div>';return[]}}
  async function newFolder(){const parent=window.FTNWorkspaceActions.current||'';const name=prompt('New folder name');if(!name)return;try{await ws().createFolder(name,parent==='root'?'':parent);await ws().audit('folder.create','folder','',{parent:parent==='root'?'':parent});await refresh()}catch(e){alert(e.message)}}
  async function renameFolder(){const id=window.FTNWorkspaceActions.current;if(!id||id==='root')return alert('Select a folder first');const items=await folders();const f=items.find(x=>x.id===id);if(!f)return;const name=prompt('Rename folder',f.name);if(!name||name===f.name)return;try{await ws().renameFolder(id,name);await ws().audit('folder.rename','folder',id);await refresh()}catch(e){alert(e.message)}}
  async function deleteFolder(){const id=window.FTNWorkspaceActions.current;if(!id||id==='root')return alert('Select a folder first');if(!confirm('Delete this folder?'))return;try{await ws().deleteFolder(id);await ws().audit('folder.delete','folder',id);window.FTNWorkspaceActions.current='root';await refresh()}catch(e){alert(e.message)}}
  function bind(){
    $('newFolder')?.addEventListener('click',newFolder);$('renameFolder')?.addEventListener('click',renameFolder);$('deleteFolder')?.addEventListener('click',deleteFolder);
    window.FTNWorkspaceActions={current:'root',refresh,newFolder,renameFolder,deleteFolder};refresh();
  }
  document.addEventListener('DOMContentLoaded',bind);
})();
