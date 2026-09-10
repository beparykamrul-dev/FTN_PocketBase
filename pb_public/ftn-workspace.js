/* FTN Local workspace helpers — owner-scoped PocketBase REST only. */
(()=>{
  const PB=location.origin;
  const token=()=>localStorage.getItem('ftn_pb_token')||'';
  const user=()=>{try{return JSON.parse(localStorage.getItem('ftn_pb_user')||'{}')}catch{return{}}};
  const headers=()=>token()?{Authorization:token(),'Content-Type':'application/json'}:{'Content-Type':'application/json'};
  async function api(path,options={}){const r=await fetch(PB+path,{...options,headers:{...headers(),...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||'Request failed');return d}
  async function listFolders(){return (await api('/api/collections/file_folders/records?sort=path&perPage=200')).items||[]}
  async function createFolder(name,parentId=''){
    name=String(name||'').trim();if(!name)throw Error('Folder name required');
    const clean=name.replace(/[\\/]+/g,' ').replace(/\s+/g,' ').trim();if(!clean)throw Error('Invalid folder name');
    const items=await listFolders();const parent=items.find(x=>x.id===parentId);if(parentId&&!parent)throw Error('Parent folder not found');
    const path=(parent?parent.path+'/':'')+clean;
    return api('/api/collections/file_folders/records',{method:'POST',body:JSON.stringify({user:user().id,name:clean,parent:parent?parent.id:'',path})});
  }
  async function renameFolder(id,name){name=String(name||'').trim();if(!name)throw Error('Folder name required');return api('/api/collections/file_folders/records/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({name})})}
  async function deleteFolder(id){return api('/api/collections/file_folders/records/'+encodeURIComponent(id),{method:'DELETE',headers:{Authorization:token()}})}
  async function audit(action,resource_type,resource_id='',metadata={}){if(!token())return null;try{return await api('/api/collections/security_events/records',{method:'POST',body:JSON.stringify({user:user().id,category:'workspace',action:String(action).slice(0,120),metadata:JSON.stringify({resource_type,resource_id,...metadata}).slice(0,4000)})})}catch{return null}}
  function tree(items){const root={id:'root',name:'All encrypted files',children:[]},map={root};for(const f of items){map[f.id]={...f,children:[]}}for(const f of items){const p=f.parent&&map[f.parent]?map[f.parent]:root;p.children.push(map[f.id])}return root}
  window.FTNWorkspace={api,listFolders,createFolder,renameFolder,deleteFolder,audit,tree};
})();
