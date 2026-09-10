/* FTN Local editor helpers — plaintext remains in browser memory only. */
(()=>{
  const TE=new TextEncoder();
  function clear(...els){els.forEach(el=>{if(el)el.value=''})}
  function bindAutosave(textarea,indicator){if(!textarea)return;let timer;textarea.addEventListener('input',()=>{clearTimeout(timer);if(indicator)indicator.textContent='Unsaved changes';timer=setTimeout(()=>{if(indicator)indicator.textContent='Local draft only'},700)});}
  function wipe(textarea){if(textarea)textarea.value='';}
  function bytes(text){return TE.encode(text||'').byteLength}
  window.FTNEditor={clear,bindAutosave,wipe,bytes};
})();
