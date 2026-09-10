/* FTN Local safe preview — never inject decrypted data as HTML. */
(()=>{
  const TEXT=new Set(['text/plain','text/csv','application/json','application/xml','text/xml','text/markdown']);
  const IMAGE=new Set(['image/png','image/jpeg','image/webp','image/gif']);
  const MEDIA=new Set(['audio/mpeg','audio/ogg','audio/wav','video/mp4','video/webm']);
  function kind(mime=''){if(TEXT.has(mime))return'text';if(IMAGE.has(mime))return'image';if(MEDIA.has(mime))return'media';return'unsupported'}
  async function preview(blob,mime,container){if(!container)throw Error('Preview container required');container.replaceChildren();const k=kind(mime);if(k==='text'){const pre=document.createElement('pre');pre.className='pre';pre.textContent=await blob.text();container.appendChild(pre);return}if(k==='image'){const img=document.createElement('img');img.alt='Decrypted image preview';img.style.maxWidth='100%';img.style.borderRadius='10px';img.src=URL.createObjectURL(blob);img.onload=()=>URL.revokeObjectURL(img.src);container.appendChild(img);return}if(k==='media'){const el=mime.startsWith('video/')?document.createElement('video'):document.createElement('audio');el.controls=true;el.style.maxWidth='100%';el.src=URL.createObjectURL(blob);container.appendChild(el);return}const p=document.createElement('div');p.className='muted small';p.textContent='Preview unavailable for this file type. Decrypt/download is still supported.';container.appendChild(p)}
  window.FTNPreview={kind,preview};
})();
