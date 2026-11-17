/* Website navigation helpers. Game state is created only by its existing deck picker. */
(()=>{'use strict';
 window.addEventListener('hashchange',()=>{
  const raw=location.hash.slice(1),page=raw==='practice'?'learn':raw||'home';
  if(!['home','learn','decks','rules','battle'].includes(page))return;
  if(document.getElementById(page)?.classList.contains('hide'))document.querySelector('header [data-page="'+page+'"]')?.click();
 });
 for(const button of document.querySelectorAll('[data-start-deck]'))button.addEventListener('click',()=>{
  const picker=document.getElementById('battleDeckChoice');if(!picker)return;
  picker.value=button.dataset.startDeck;picker.dispatchEvent(new Event('change',{bubbles:true}));
 });
 document.querySelector('[data-first-lesson]')?.addEventListener('click',()=>document.querySelector('#chapterNav button')?.click());
 document.querySelector('[data-learn-reference]')?.addEventListener('click',()=>{
  const reference=document.getElementById('referenceSetup');if(!reference)return;
  reference.open=true;reference.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 });
})();
