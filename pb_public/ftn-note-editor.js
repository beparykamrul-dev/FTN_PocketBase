/* FTN Local encrypted note editor — plaintext exists only in browser memory. */
(()=>{
  const PB=location.origin;
  const token=()=>localStorage.getItem('ftn_pb_token')||'';
  const user=()=>{try{return JSON.parse(localStorage.getItem('ftn_pb_user')||'{}')}catch{return{}}};
  const H=()=>token()?{Authorization:token(),'Content-Type':'application/json'}:{'Content-Type':'application/json'};
  const b64=u8=>btoa(String.fromCharCode(...u8));
  const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function key(pass,salt){return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
  async function seal(text,pass){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await key(pass,salt),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(text));return {cipher:b64(new Uint8Array(data)),salt:b64(salt),iv:b64(iv)}}
  async function openBox(cipher,salt,iv,pass){const k=await key(pass,unb64(salt));const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},k,unb64(cipher));return new TextDecoder().decode(data)}
  async function encryptAttachment(file,pass){const data=new Uint8Array(await file.arrayBuffer()),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await key(pass,salt),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,data));const pkg={format:'FTN-FILE-AES-GCM',version:1,name:file.name,type:file.type||'application/octet-stream',size:data.byteLength,salt:b64(salt),iv:b64(iv),data:b64(cipher)};return new Blob([JSON.stringify(pkg)],{type:'application/json'})}
  async function save(note,{title,body,pass,folder='',tags='',favorite=false,archived=false,attachment=null}){
    if(!token()||!user().id)throw Error('Sign in required');
    const t=await seal(title,pass),b=await seal(body,pass);
    const payload={user:user().id,title_cipher:t.cipher,salt:t.salt,iv:t.iv,body_cipher:b.cipher,body_salt:b.salt,body_iv:b.iv,folder:folder||'',tags:String(tags||'').slice(0,1000),favorite:!!favorite,archived:!!archived};
    const url=note?'/api/collections/notes/records/'+encodeURIComponent(note):'/api/collections/notes/records';
    if(!attachment){const r=await fetch(PB+url,{method:note?'PATCH':'POST',headers:H(),body:JSON.stringify(payload)}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||'Note save failed');return d}
    const form=new FormData();Object.entries(payload).forEach(([k,v])=>form.append(k,String(v)));form.append('attachment',await encryptAttachment(attachment,pass),attachment.name+'.ftnenc');
    const r=await fetch(PB+url,{method:note?'PATCH':'POST',headers:{Authorization:token()},body:form}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||'Note attachment save failed');return d;
  }
  async function load(id,pass){const r=await fetch(PB+'/api/collections/notes/records/'+encodeURIComponent(id),{headers:{Authorization:token()}}),n=await r.json();if(!r.ok)throw Error(n.message||'Note load failed');return {id:n.id,title:await openBox(n.title_cipher,n.salt,n.iv,pass),body:n.body_cipher?await openBox(n.body_cipher,n.body_salt,n.body_iv,pass):'',folder:n.folder||'',tags:n.tags||'',favorite:!!n.favorite,archived:!!n.archived,attachment:n.attachment||'',created:n.created,updated:n.updated};}
  async function remove(id){if(!token())throw Error('Sign in required');const r=await fetch(PB+'/api/collections/notes/records/'+encodeURIComponent(id),{method:'DELETE',headers:{Authorization:token()}});if(!r.ok)throw Error('Note delete failed');return true}
  window.FTNNoteEditor={seal,openBox,encryptAttachment,save,load,remove};
})();
