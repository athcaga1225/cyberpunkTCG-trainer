/* Visual tabletop: real CYBERDEX card art and official starter deck manifests.
   Not an actual game state. One source art URL is unavailable. */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('battleTour'),select=$('battleDeckChoice');
const decks=window.NCT_STARTER_DECKS,locale=window.NCTLocale,art={"heist":{"Viktor Vektor: Sit Down and Relax":{"id":"B001","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b001-viktor-vektor-sit-down-and-relax.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Dexter DeShawn: One Last Chance":{"id":"B002","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b002-dexter-deshawn-one-last-chance.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Heywood Ripperdoc":{"id":"B003","url":"https://cdn.tcg.online/public/cyberpunk/cards/theheistbetastarterdeck/b003.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Offduty Malfini":{"id":"B004","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b004-offduty-malfini.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Secondhand Bombus":{"id":"B005","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b005-secondhand-bombus.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"T-Bug: Amateur Philosopher":{"id":"B006","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b006-t-bug-amateur-philosopher.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Kiroshi Optics":{"id":"B007","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b007-kiroshi-optics.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Mandibular Upgrade":{"id":"B008","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b008-mandibular-upgrade.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Zetatech Faceplate":{"id":"B009","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b009-zetatech-faceplate.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Afterparty at Lizzie's":{"id":"B010","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b010-afterparty-at-lizzie-s.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Jackie Welles: Pour One Out For Me":{"id":"B011","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b011-jackie-welles-pour-one-out-for-me.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"V: Corporate Exile":{"id":"B012","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b012-v-corporate-exile.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Delamain Cab":{"id":"B013","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b013-delamain-cab.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Evelyn Parker: Scheming Siren":{"id":"B014","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b014-evelyn-parker-scheming-siren.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"MT0D12 Flathead":{"id":"B015","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b015-mt0d12-flathead.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Psycho Squad":{"id":"B016","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b016-psycho-squad.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Dying Night: V's Pistol":{"id":"B017","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b017-dying-night-v-s-pistol.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Tetratonic Rippler":{"id":"B018","url":"https://cdn.tcg.online/public/cyberpunk/cards/theheistbetastarterdeck/b018.webp","source":"https://tcg.online/cyberpunk/cards/tetratronic-rippler"},"Floor It":{"id":"B019","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b019-floor-it.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Reboot Optics":{"id":"B020","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b020-reboot-optics.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"}},"power":{"Yorinobu Arasaka: Embracing Destruction":{"id":"B001","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b001-yorinobu-arasaka-embracing-destruction.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Chrome Fang":{"id":"B002","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b002-chrome-fang.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Minotaur":{"id":"B003","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b003-minotaur.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Ruthless Lowlife":{"id":"B004","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b004-ruthless-lowlife.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Swordwise Huscle":{"id":"B005","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b005-swordwise-huscle.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Arasaka Emergency Radioport":{"id":"B006","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b006-arasaka-emergency-radioport.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Mantis Blades":{"id":"B007","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b007-mantis-blades.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Satori: Sword of Saburo":{"id":"B008","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b008-satori-sword-of-saburo.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Industrial Assembly":{"id":"B009","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b009-industrial-assembly.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Over the Edge":{"id":"B010","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b010-over-the-edge.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Shattered Memories":{"id":"B011","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b011-shattered-memories.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Goro Takemura: Hands Unclean":{"id":"B012","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b012-goro-takemura-hands-unclean.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Saburo Arasaka: Stubborn Patriarch":{"id":"B013","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b013-saburo-arasaka-stubborn-patriarch.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Corpo Security":{"id":"B014","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b014-corpo-security.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Emergency Atlus":{"id":"B015","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b015-emergency-atlus.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Field Operator":{"id":"B016","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b016-field-operator.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Goro Takemura: Losing His Way":{"id":"B017","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b017-goro-takemura-losing-his-way.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"MaxTac AV":{"id":"B018","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b018-maxtac-av.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Sandevistan":{"id":"B019","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b019-sandevistan.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Corporate Surveillance":{"id":"B020","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b020-corporate-surveillance.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"}}};
if(!root||!select||!decks)return;
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const nameOf=s=>locale?.cardTitle(s)||s;
const keyOf=k=>k==='theHeist'?'heist':'power';
let choice='theHeist',hand=[],showLegends=false;
try{const prev=localStorage.getItem('nct-preview-deck');if(decks[prev])choice=prev}catch{}
select.value=choice;
function lookup(k,name){return Object.entries(art[keyOf(k)]||{}).find(([n])=>norm(n)===norm(name)||(norm(name)==='tetratronicrippler'&&norm(n)==='tetratonicrippler'))?.[1]||null}
function shuffle(k){const pool=[];for(const c of decks[k].main)for(let n=0;n<c.qty;n++)pool.push(c.name);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,6)}


const hoverBox=$('battleCardHover'),hoverImage=$('battleHoverImage'),
      hoverName=$('battleHoverName'),hoverFallback=$('battleHoverFallback');
let hoverTarget=null, hoverToken=0, hoverLeaveTimer=null;
const previewCache=new Map();
function preloadPreview(src){
 if(!src)return Promise.resolve(false);
 if(previewCache.has(src))return previewCache.get(src);
 const promise=new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>resolve(true);
  img.onerror=()=>resolve(false);
  img.src=src;
 });
 previewCache.set(src,promise);
 return promise;
}
function cancelHoverLeave(){if(hoverLeaveTimer!==null){clearTimeout(hoverLeaveTimer);hoverLeaveTimer=null}}
function hideHover(){
 cancelHoverLeave();
 hoverToken++;
 hoverTarget=null;
 if(!hoverBox)return;
 hoverBox.classList.remove('hand-preview');
 hoverBox.hidden=true;
 hoverBox.setAttribute('aria-hidden','true');
}
function positionHover(anchor){
 if(!hoverBox||!anchor||hoverBox.hidden)return;
 const base=anchor.classList.contains('hand-card')?(anchor.closest('.preview-card-rail')||anchor):anchor;
 const rect=base.getBoundingClientRect();
 const width=hoverBox.getBoundingClientRect().width;
 const height=hoverBox.getBoundingClientRect().height;
 const pad=14;
 let left=rect.right+16;
 if(left+width>innerWidth-pad)left=rect.left-width-16;
 if(left<pad)left=Math.max(pad,Math.round((innerWidth-width)/2));
 const top=Math.max(pad,Math.min(rect.top-(height-rect.height)/2,innerHeight-height-pad));
 hoverBox.style.left=Math.round(left)+'px';
 hoverBox.style.top=Math.round(top)+'px';
}
function showHover(anchor,k,name,image){
 if(!hoverBox||!image?.url||!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
 cancelHoverLeave();
 if(hoverTarget===anchor&&!hoverBox.hidden)return;
 const token=++hoverToken;
 hoverTarget=anchor;
 const handPreview=anchor.classList.contains('hand-card');
 hoverBox.classList.toggle('hand-preview',handPreview);
 hoverName.textContent=nameOf(name);
 hoverBox.hidden=false;hoverBox.setAttribute('aria-hidden','false');
 // Keep the previous image on screen while the new image loads. Never blank
 // the floating preview when traversing 1 -> 2 -> 3 through overlapping cards.
 const src=image.url;
 preloadPreview(src).then(ok=>{
  if(token!==hoverToken||hoverTarget!==anchor)return;
  hoverImage.hidden=!ok;
  hoverFallback.hidden=ok;
  if(ok&&hoverImage.getAttribute('src')!==src)hoverImage.src=src;
  hoverImage.alt=nameOf(name)+' 放大卡面';
  requestAnimationFrame(()=>{if(token===hoverToken)positionHover(anchor)});
 });
 requestAnimationFrame(()=>{if(token===hoverToken)positionHover(anchor)});
}
function scheduleHandHoverLeave(rail){
 cancelHoverLeave();
 hoverLeaveTimer=setTimeout(()=>{
  hoverLeaveTimer=null;
  // Browser focus and child pointer changes can briefly emit a leave event;
  // hide only once the pointer truly leaves the entire hand rail.
  if(!rail.matches(':hover'))hideHover();
 },110);
}
window.addEventListener('scroll',()=>{if(!hoverTarget?.classList.contains('hand-card'))hideHover()},{passive:true});
window.addEventListener('resize',hideHover);

function card(k,name,back=false,kind='standard',isHand=false){
 const el=document.createElement('button');el.type='button';el.className='preview-art-card'+(back?' face-down':'');
 if(back){
  const isLegend=kind==='legend';
  const src=isLegend?'https://chromeandgigs.com/card-backs/legend.png':'https://chromeandgigs.com/card-backs/standard.png';
  el.disabled=true;
  el.classList.add(isLegend?'legend-back':'standard-back');
  el.setAttribute('aria-label',isLegend?'傳奇角色專用卡背':'一般卡牌卡背');
  const fallback=document.createElement('span');
  fallback.className='preview-back-design';
  fallback.textContent='CYBERPUNK TCG';
  el.append(fallback);
  const image=document.createElement('img');
  image.src=src;image.alt='';image.className='preview-card-back-image';
  image.loading='lazy';image.decoding='async';
  image.addEventListener('error',()=>{image.remove();el.classList.add('missing-back')});
  el.append(image);
  return el;
 }
 const image=lookup(k,name);
 el.title=nameOf(name);
 if(isHand){
  el.classList.add('hand-card');
  el.setAttribute('aria-label','選取手牌 '+nameOf(name));
  el.setAttribute('aria-pressed','false');
 }else{
  el.setAttribute('aria-label','放大查看 '+nameOf(name));
 }
 const fallback=document.createElement('span');fallback.className='preview-art-fallback';fallback.textContent=locale?.cardName(name)||name;el.append(fallback);
 if(image?.url){const img=document.createElement('img');img.src=image.url;img.alt=nameOf(name)+' 卡面';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{img.remove();el.classList.add('missing-art')});el.append(img)}else el.classList.add('missing-art');
 if(isHand){
   // Click/tap selects a card; no popup. Hover is delegated to the hand rail
   // so overlapping card hit regions never block switching to the next card.
   // Mouse clicks change focus too. Restrict focus-driven previews to
   // keyboard navigation so blur cannot hide the pointer preview mid-swipe.
   el.addEventListener('focus',()=>{
    if(el.matches(':focus-visible'))showHover(el,k,name,image);
   });
   el.addEventListener('blur',()=>{
    if(hoverTarget===el&&!el.closest('.preview-card-rail')?.matches(':hover'))scheduleHandHoverLeave(el.closest('.preview-card-rail'));
   });
   el.addEventListener('click',()=>selectHandCard(el));
 }else{
   el.addEventListener('pointerenter',()=>showHover(el,k,name,image));
   el.addEventListener('pointerleave',hideHover);
   el.addEventListener('focus',()=>showHover(el,k,name,image));
   el.addEventListener('blur',hideHover);
   el.addEventListener('click',()=>{hideHover();open(k,name,image)});
 }
 return el;
}
function open(k,name,image){hideHover();const dlg=$('battleCardDialog');if(!dlg?.showModal)return;const english=name||'卡牌預覽';const chinese=locale?.cardName(english)||english;$('battleCardTitle').textContent=chinese;$('battleCardEnglish').textContent=chinese===english?'':english;
 const img=$('battleCardFullImage'),fallback=$('battleCardNoImage'),link=$('battleCardSource');
 if(image?.url){img.src=image.url;img.alt=nameOf(name);img.hidden=false;fallback.hidden=true}else{img.removeAttribute('src');img.hidden=true;fallback.hidden=false;fallback.textContent='此卡在 CYBERDEX 的來源資料中暫無可用卡圖。'}
 if(image?.source){link.href=image.source;link.hidden=false}else link.hidden=true;if(window.NCTCardModal)window.NCTCardModal.open(dlg);else dlg.showModal()}
function legend(k,who){const node=root.querySelector('.'+who+'-legends .cardbacks');if(!node)return;node.replaceChildren();for(const c of decks[k].legends)node.append(card(k,c.name,who==='opponent'||!showLegends,'legend'))}

function fitPreviewRails(){
 for(const rail of root.querySelectorAll('.preview-card-rail')){
  const list=[...rail.querySelectorAll('.preview-art-card')];
  if(list.length===0||rail.clientWidth<=0)continue;
  const width=rail.clientWidth;
  const maxHeight=Math.max(56,rail.clientHeight);
  const cardHeight=Math.max(28,Math.min(maxHeight,(width-Math.max(0,list.length-1)*12)*7/5));
  const cardWidth=cardHeight*5/7;
  const overlapRequired=Math.max(0,(cardWidth*list.length-width)/Math.max(1,list.length-1));
  const overlap=Math.min(cardWidth-12,Math.max(overlapRequired,cardWidth*.55));
  rail.style.setProperty('--preview-stack-overlap',overlap.toFixed(2)+'px');
  list.forEach((el,i)=>{el.style.height=cardHeight+'px';el.style.width=cardWidth+'px';el.style.zIndex=String(i+1)});
 }
}
if(typeof ResizeObserver!=='undefined'){
 const resizer=new ResizeObserver(()=>requestAnimationFrame(fitPreviewRails));
 root.querySelectorAll('.preview-card-rail').forEach(el=>resizer.observe(el));
}
window.addEventListener('resize',()=>requestAnimationFrame(fitPreviewRails));


let selectedHandIndex=null;
function refreshHandSelection(){
 const nodes=[...root.querySelectorAll('.player-hand .hand-card')];
 nodes.forEach((el,i)=>{
  const selected=i===selectedHandIndex;
  el.classList.toggle('is-selected',selected);
  el.setAttribute('aria-pressed',String(selected));
 });
 const notice=$('battlePreviewStatus');
 if(!notice)return;
 if(selectedHandIndex===null){
  notice.textContent='目前為示意手牌。點擊可選取卡牌；正式出牌、費用與回合判定尚未啟用。';
 }else{
  const card=nodes[selectedHandIndex];
  notice.textContent=card?'已選取：'+(card.dataset.cardName||'手牌')+'。目前只能選取，尚未實作正式出牌。':'尚未選取卡牌。';
 }
}
function selectHandCard(el){
 const index=Number(el.dataset.handIndex);
 if(!Number.isInteger(index))return;
 selectedHandIndex=selectedHandIndex===index?null:index;
 refreshHandSelection();
}
// Use card slot x-coordinates, not event.target: stacked card DOM layers otherwise
// make moving from card 1 to card 2 randomly retrigger/lose the hover.

function hoverHandAt(rail,event){
 if(!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
 cancelHoverLeave();
 const nodes=[...rail.querySelectorAll('.hand-card')];
 if(!nodes.length)return;
 const rect=rail.getBoundingClientRect();
 const x=event.clientX;
 // Clamp inside the full rail. Card starts are stable; all six hit areas
 // are determined by their x slots and NOT by pointerover child elements.
 let i=0;
 for(let n=1;n<nodes.length;n++){
  if(x>=nodes[n].getBoundingClientRect().left)i=n;
 }
 const current=nodes[i];
 if(hoverTarget!==current||hoverBox.hidden){
  showHover(current,choice,current.dataset.cardName,lookup(choice,current.dataset.cardName));
 }
}
function bindHandHover(rail){
 if(rail.dataset.hoverBound)return;
 rail.dataset.hoverBound='true';
 rail.addEventListener('pointermove',event=>{
  if(event.pointerType==='mouse'||event.pointerType==='pen')hoverHandAt(rail,event);
 });
 rail.addEventListener('pointerenter',event=>{
  if(event.pointerType==='mouse'||event.pointerType==='pen')hoverHandAt(rail,event);
 });
 rail.addEventListener('pointerleave',()=>scheduleHandHoverLeave(rail));
}

function render(){hideHover();selectedHandIndex=null;const other=choice==='theHeist'?'embracingPower':'theHeist';legend(choice,'player');legend(other,'opponent');
 const my=root.querySelector('.player-hand .hand-placeholder'),rival=root.querySelector('.opponent-hand .placeholder-label');
 if(!my||!rival)return;my.replaceChildren();rival.replaceChildren();my.classList.add('preview-card-rail');rival.classList.add('preview-card-rail');
 hand.forEach((n,i)=>{
  const el=card(choice,n,false,'standard',true);
  el.dataset.handIndex=String(i);
  el.dataset.cardName=n;
  my.append(el);
 });
 bindHandHover(my);
 for(const n of hand){const image=lookup(choice,n);if(image?.url)preloadPreview(image.url)}
 for(let i=0;i<6;i++)rival.append(card(other,'',true));
 requestAnimationFrame(fitPreviewRails);
 $('battleSelectedDeck').textContent='玩家：'+decks[choice].name;$('battleOpponentDeck').textContent='對手：'+decks[other].name;
 for(const side of ['player','opponent']){const v=root.querySelector('.'+side+'-deck .deck-pile');if(v){v.replaceChildren(document.createTextNode('34'));const lbl=document.createElement('span');lbl.textContent='DECK';v.append(lbl)}}
 $('toggleBattleLegends').textContent=showLegends?'收起傳奇角色預覽':'預覽我的傳奇角色';
 refreshHandSelection();
}
select.onchange=()=>{if(!decks[select.value])return;choice=select.value;showLegends=false;hand=shuffle(choice);try{localStorage.setItem('nct-preview-deck',choice)}catch{}render()};


let redrawTimer=null;
$('redrawBattleHand').onclick=()=>{
 const button=$('redrawBattleHand');
 if(button.disabled)return;
 const handZone=root.querySelector('.player-hand');
 if(!handZone){hand=shuffle(choice);render();return}
 button.disabled=true;
 hideHover();
 hand=shuffle(choice);
 render();
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const rail=handZone.querySelector('.preview-card-rail');
 if(!reduced&&rail){
  // New cards deal in from left to right, with staggered 110ms starts.
  // Animation does not change draw order or the 6-card game preview.
  rail.classList.add('is-dealing');
 }
 clearTimeout(redrawTimer);
 redrawTimer=setTimeout(()=>{
  rail?.classList.remove('is-dealing');
  button.disabled=false;
 },reduced?0:1050);
};
$('toggleBattleLegends').onclick=()=>{showLegends=!showLegends;render()};
$('closeBattleCard').onclick=()=>$('battleCardDialog')?.close();
$('battleCardDialog').addEventListener('click',event=>{if(event.target.id==='battleCardDialog')event.target.close()});
hand=shuffle(choice);render();
})();