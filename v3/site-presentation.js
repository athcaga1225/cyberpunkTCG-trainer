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
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const button of document.querySelectorAll('[data-rule-section]'))button.addEventListener('click',()=>{
  const section=document.getElementById(button.dataset.ruleSection);if(!section)return;
  section.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});section.focus({preventScroll:true});
 });
 const search=document.getElementById('ruleSearch'),entries=[...document.querySelectorAll('#rules .term-entry')];
 const clear=document.getElementById('ruleSearchClear'),status=document.getElementById('ruleSearchStatus'),empty=document.getElementById('ruleSearchEmpty');
 function filterTerms(){
  const query=search.value.trim().toLocaleLowerCase();let count=0;
  for(const entry of entries){entry.hidden=!entry.textContent.toLocaleLowerCase().includes(query);if(!entry.hidden)count++;}
  clear.hidden=!query;empty.hidden=count>0;
  status.textContent=query?'找到 '+count+' 個術語':'16 個術語；點選名稱展開說明。';
 }
 search?.addEventListener('input',filterTerms);
 clear?.addEventListener('click',()=>{search.value='';filterTerms();search.focus()});
})();
