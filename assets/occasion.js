'use strict';
document.querySelectorAll('.copy-wish').forEach(button=>{
  button.addEventListener('click',async ()=>{
    try {
      await navigator.clipboard.writeText(button.dataset.copy || '');
      const status=document.getElementById('copied');
      status.textContent=document.documentElement.lang==='gu'?'સંદેશ કૉપી થયો':document.documentElement.lang==='hi'?'संदेश कॉपी हो गया':'Wish copied to clipboard';
      status.classList.add('visible');setTimeout(()=>status.classList.remove('visible'),2400);
    } catch {
      const selection=window.getSelection();const range=document.createRange();
      range.selectNodeContents(button.parentElement.querySelector('blockquote'));
      selection.removeAllRanges();selection.addRange(range);
      document.getElementById('copied').textContent='Select and copy the highlighted wish';
      document.getElementById('copied').classList.add('visible');
    }
  });
});
