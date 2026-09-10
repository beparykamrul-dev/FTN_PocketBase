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
  async function save(note,{title,body,pass,folder='',tags='',favorite=false,archived=false}){
    if(!token()||!user().id)throw Error('Sign in required');
    const t=await seal(title,pass),b=await seal(body,pass);
    const payload={user:user().id,title_cipher:t.cipher,salt:t.salt,iv:t.iv,body_cipher:b.cipher,body_salt:b.salt,body_iv:b.iv,folder:folder||'',tags:String(tags||'').slice(0,1000),favorite:!!favorite,archived:!!archived};
    const url=note?'/api/collections/notes/records/'+encodeURIComponent(note):'/api/collections/notes/records';
    const r=await fetch(PB+url,{method:note?'PATCH':'POST',headers:H(),body:JSON.stringify(payload)}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||'Note save failed');return d;
  }
  async function load(id,pass){const r=await fetch(PB+'/api/collections/notes/records/'+encodeURIComponent(id),{headers:{Authorization:token()}}),n=await r.json();if(!r.ok)throw Error(n.message||'Note load failed');return {id:n.id,title:await openBox(n.title_cipher,n.salt,n.iv,pass),body:n.body_cipher?await openBox(n.body_cipher,n.body_salt,n.body_iv,pass):'',folder:n.folder||'',tags:n.tags||'',favorite:!!n.favorite,archived:!!n.archived,created:n.created,updated:n.updated};}
  async function remove(id){if(!token())throw Error('Sign in required');const r=await fetch(PB+'/api/collections/notes/records/'+encodeURIComponent(id),{method:'DELETE',headers:{Authorization:token()}});if(!r.ok)throw Error('Note delete failed');return true}
  window.FTNNoteEditor={seal,openBox,save,load,remove};
})();
