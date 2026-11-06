/* V3 Heist tabletop: resources, reactions and verified pending effect choices. */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.NCTV3TurnPractice,H=window.NCTV3Heist,A=window.NCTV3Actions,G=window.NCTV3Guide,D=window.NCTV3Dice,C=window.NCTV3Combat,E=window.NCTV3Effects;
const root=$('v3TurnPractice'),board=$('battleTour'),picker=$('battleDeckChoice');
if(!root||!board||!P||!H||!G||!D||!C||!E||!picker)return;
const openingRoot=document.createElement('section');
openingRoot.id='v3OpeningSetup';
openingRoot.className='v3-opening-setup';
openingRoot.setAttribute('aria-label','開局先後攻設定');
openingRoot.setAttribute('role','dialog');
openingRoot.setAttribute('aria-modal','true');
openingRoot.hidden=true;
root.before(openingRoot);


const toggleActions=$('toggleV3BattleActions');
// Compact tabletop controls live in PHASE. The old diagnostic tray stays
// available only through an explicit advanced-test action.
const tableControls=document.createElement('div');
tableControls.id='v3TableControls';
tableControls.className='v3-table-controls';
tableControls.setAttribute('aria-label','桌面操作');
let attackUnitId=null,modeOnTable=null;

// The turn controls live inside the game board, not in a second website toolbar.
const phaseZone=board.querySelector('.turn-info');
board.append(tableControls);
const guideRoot=document.createElement('aside');guideRoot.id='v3TableGuide';guideRoot.className='v3-live-guide';guideRoot.hidden=true;
guideRoot.setAttribute('aria-label','桌面操作引導');board.append(guideRoot);
let guideAnchor=null;
function positionGuide(){
 if(guideRoot.hidden||!guideAnchor?.isConnected)return;
 const gap=14,pad=12,w=guideRoot.offsetWidth,h=guideRoot.offsetHeight,a=guideAnchor.getBoundingClientRect();
 const clamp=(v,max)=>Math.max(pad,Math.min(v,Math.max(pad,max)));
 const blocks=[...board.querySelectorAll('.player-hand,.opponent-hand,.player-legends,.opponent-legends,.v3-played-card,#v3TableControls,.player-fixer,.player-gigs')].map(el=>el.getBoundingClientRect());
 blocks.push(a);
 const candidates=[[a.right+gap,a.top],[a.left-w-gap,a.top],[a.left,a.top-h-gap],[a.left,a.bottom+gap]];
 for(const field of board.querySelectorAll('.player-field,.opponent-field')){const r=field.getBoundingClientRect();candidates.push([r.right-w-gap,r.top+gap],[r.left+gap,r.top+gap],[r.right-w-gap,r.bottom-h-gap],[r.left+gap,r.bottom-h-gap]);}
 const overlap=(r,b)=>Math.max(0,Math.min(r.x+w,b.right)-Math.max(r.x,b.left))*Math.max(0,Math.min(r.y+h,b.bottom)-Math.max(r.y,b.top));
 const points=candidates.map(([x,y])=>({x:clamp(x,innerWidth-w-pad),y:clamp(y,innerHeight-h-pad)}));
 const score=r=>blocks.reduce((n,b)=>n+overlap(r,b),0)*1000+Math.hypot(r.x+w/2-(a.left+a.width/2),r.y+h/2-(a.top+a.height/2));
 points.sort((r,t)=>score(r)-score(t));
 const spot=points[0];guideRoot.style.left=Math.round(spot.x)+'px';guideRoot.style.top=Math.round(spot.y)+'px';
}
window.addEventListener('resize',positionGuide);
if(phaseZone&&toggleActions)phaseZone.append(toggleActions);
if(toggleActions)toggleActions.textContent='進階測試';
function setActionTray(open){
 if(open&&state.phase==='pregame')return;
 // The tutorial and turn controls are mutually exclusive overlays.
 // board-tour.js now initializes first; closing via its own control clears spotlight.
 if(open)document.getElementById('closeBoardTour')?.click();
 root.classList.toggle('is-open',open);
 toggleActions?.setAttribute('aria-expanded',String(open));
 toggleActions?.classList.toggle('active',open);
 if(open)hideHandHover();
}
toggleActions?.addEventListener('click',()=>setActionTray(!root.classList.contains('is-open')));
document.getElementById('startBoardTour')?.addEventListener('click',event=>{
 if(picker.value!=='theHeist')return;
 event.stopImmediatePropagation();guidanceOn=true;guideIntro=0;setActionTray(false);render();
},true);
// Activating a highlighted tour region must also dismiss the action tray.
board.addEventListener('click',event=>{
 if(event.target.closest('[data-tour-zone]')&&!event.target.closest('#v3TurnPractice'))setActionTray(false);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('is-open'))setActionTray(false)});

const initial='The Heist：先選擇開局方式，再擲骰決定先後攻。';
let scenario='random',defensePreset='none',opponentMode='mirror',state=H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),selectedId=null,selectedPayments=new Set(),targetId=null,gigId=null,gigSide='player',gigDelta=0,rivalUnitId=null,defeatGearId=null,defeatGearSide='player',message=initial;
// Card-deal motion uses transient visual clones; actual hand/game state never animates or changes.
let guidanceOn=true,guideIntro=0,opponentTimer=null,selectedDie=4;
let confirmConcede=false;
let selectedLegendId=null,effectChoiceId=null,effectChoices=new Set();
let pendingDeal=null;
let activeDeals=[];
let renderSequence=0;
let entryDealt=false;
function cancelDeals(){
 for(const item of activeDeals){item.animation?.cancel();item.clone.remove();if(item.target?.isConnected)item.target.style.visibility='';}
 document.querySelectorAll('[data-v3-deal-layer]').forEach(layer=>layer.remove());
 activeDeals=[];
}
function dealHand(mode){
 if(!mode||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const source=board.querySelector('.player-deck .deck-pile');
 const rail=board.querySelector('.player-hand .hand-placeholder');
 if(!source||!rail||typeof Element.prototype.animate!=='function')return;
 const start=source.getBoundingClientRect();
 if(!start.width||!start.height)return;
 const cards=[...rail.querySelectorAll('.hand-card')];
 const targets=mode==='all'?cards:cards.filter(el=>mode.includes(el.dataset.cardId));
 // The flight layer is attached to the document root, outside all tabletop
 // grid, stacking, clipping and hover styles; its CSS pixels are viewport pixels.
 const layer=document.createElement('div');
 layer.setAttribute('aria-hidden','true');
 layer.dataset.v3DealLayer='';
 layer.style.cssText='position:fixed;inset:0;z-index:20000;pointer-events:none;overflow:visible;';
 document.documentElement.append(layer);
 let remaining=0;
 const startX=start.left+start.width/2,startY=start.top+start.height/2;
 for(const [index,target] of targets.entries()){
  const end=target.getBoundingClientRect();
  if(!end.width||!end.height)continue;
  const img=target.querySelector('img');
  const clone=document.createElement('div');
  clone.style.cssText='position:absolute;display:block;box-sizing:border-box;overflow:hidden;border:1px solid #9d4b52;border-radius:3px;background:#15212a;box-shadow:0 8px 20px #0009;pointer-events:none;transform-origin:center center;';
  // End coordinates are exact target bounding boxes (no layout or margins).
  clone.style.left=end.left+'px';
  clone.style.top=end.top+'px';
  clone.style.width=end.width+'px';
  clone.style.height=end.height+'px';
  if(img){
   const copy=img.cloneNode(false);
   copy.removeAttribute('id');
   copy.loading='eager';
   copy.style.cssText='position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:contain;background:#101820;';
   clone.append(copy);
  }else{
   const text=document.createElement('span');text.textContent=target.dataset.cardName||'CARD';
   text.style.cssText='display:grid;place-items:center;width:100%;height:100%;font-size:12px;color:#e9f1f3;';
   clone.append(text);
  }
  layer.append(clone);
  target.style.visibility='hidden';
  // The deck's centre is the actual start; the card's final rectangle is
  // measured from its own hand slot. No extra scale on landing.
  const dx=startX-(end.left+end.width/2);
  const dy=startY-(end.top+end.height/2);
  const animation=clone.animate([
   {transform:'translate3d('+dx+'px,'+dy+'px,0) scale(.9) rotate(-3deg)',opacity:.8},
   {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',opacity:1}
  ],{duration:530,delay:index*95,easing:'cubic-bezier(.25,.75,.18,1)',fill:'both'});
  const item={animation,clone,target};activeDeals.push(item);remaining++;
  const clean=()=>{
   clone.remove();
   if(target.isConnected)target.style.visibility='';
   activeDeals=activeDeals.filter(x=>x!==item);
   if(!--remaining)layer.remove();
  };
  animation.finished.then(clean,clean);
 }
 if(!remaining)layer.remove();
}

const art=new Map();
document.querySelectorAll('#starterDeckGallery [data-card-name][data-deck-image]').forEach(el=>{
 const name=el.getAttribute('data-card-name'),src=el.getAttribute('data-deck-image');
 if(name&&src&&!art.has(name))art.set(name,src);
});
// One immutable overlay for the REAL V3 hand. The old deck-preview hover
// is disabled while this rail is owned by V3, preventing two competing popups.
const hover=document.createElement('div');
hover.id='v3HandPreview';hover.hidden=true;hover.setAttribute('aria-hidden','true');
hover.style.cssText='position:fixed;z-index:9999;pointer-events:none;display:none;box-sizing:border-box;align-items:flex-start;gap:14px;max-width:calc(100vw - 32px);padding:10px;background:#071015f8;border:1px solid #567c85;border-radius:8px;box-shadow:0 16px 44px #000d;color:#e9eff0;';
const hoverArt=document.createElement('img');
hoverArt.alt='';hoverArt.style.cssText='display:block;width:min(185px,19vw);height:auto;max-height:min(52vh,300px);aspect-ratio:5/7;object-fit:contain;background:#101820;flex:none;';
const hoverInfo=document.createElement('div');hoverInfo.style.cssText='width:min(155px,16vw);max-height:min(52vh,300px);overflow:hidden;font-size:14px;line-height:1.65;';
hover.append(hoverArt,hoverInfo);document.body.append(hover);
let previewId=null,leaveTimer=null,previewLoad=0,hoverPending=null,hoverPendingId=null;
let raisedHandId=null;
const hoverImageCache=new Map();
function hideHandHover(){
 raisedHandId=null;
 board.querySelectorAll('.player-hand .hand-card.is-hand-hover').forEach(el=>el.classList.remove('is-hand-hover'));
 if(leaveTimer!==null){clearTimeout(leaveTimer);leaveTimer=null;}
 if(hoverPending!==null){clearTimeout(hoverPending);hoverPending=null;hoverPendingId=null;}
 handPointerInside=false;
 previewId=null;previewLoad++;
 hover.hidden=true;hover.style.display='none';hover.setAttribute('aria-hidden','true');
}
function positionHandHover(anchor){
 if(hover.hidden)return;
 const rail=board.querySelector('.player-hand .hand-placeholder');
 if(!rail)return;
 const el=anchor||[...rail.querySelectorAll('.hand-card')].find(card=>card.dataset.cardId===previewId);
 if(!el)return;
 const railRect=rail.getBoundingClientRect();
 const w=hover.offsetWidth,h=hover.offsetHeight,pad=14,gap=16;
 // offsetLeft/offsetWidth deliberately ignore the card's visual scale:
 // the popup is positioned from its ORIGINAL slot, not its enlarged bounds.
 const slotLeft=railRect.left+el.offsetLeft;
 const slotTop=railRect.top+el.offsetTop;
 const slotRight=slotLeft+el.offsetWidth;
 const slotBottom=slotTop+el.offsetHeight;
 // Keep the preview beside the selected hand card, aligned to its lower edge.
 let left=slotRight+gap;
 if(left+w>innerWidth-pad)left=slotLeft-w-gap;
 if(left<pad)left=Math.max(pad,Math.min(innerWidth-w-pad,slotRight+gap));
 const top=Math.max(pad,Math.min(innerHeight-h-pad,slotBottom-h));
 hover.style.left=Math.round(left)+'px';
 hover.style.top=Math.round(top)+'px';
}
// A single document-level pointer tracker controls the live-hand preview.
// This avoids rail enter/leave events firing while stacked card elements change.
let lastPointerX=-1,lastPointerY=-1,handPointerInside=false;
function liveHandAt(x,y){
 const rail=board.querySelector('.player-hand .hand-placeholder');
 if(!rail||picker.value!=='theHeist'||board.closest('.hide'))return null;
 const r=rail.getBoundingClientRect();
 // A small exit tolerance prevents one-pixel gaps in the overlapping hand.
 if(x<r.left-3||x>r.right+3||y<r.top-4||y>r.bottom+4)return null;
 const nodes=[...rail.querySelectorAll('.hand-card')];
 if(!nodes.length)return null;
 let index=0;
 for(let n=1;n<nodes.length;n++){
  if(x>=r.left+nodes[n].offsetLeft+4)index=n;
 }
 return state.player.hand.find(c=>c.id===nodes[index].dataset.cardId)||null;
}
function scheduleHandHover(card){
 if(!card)return;
 if(leaveTimer!==null){clearTimeout(leaveTimer);leaveTimer=null;}
 if(previewId===card.id&&!hover.hidden){
  if(hoverPending!==null){clearTimeout(hoverPending);hoverPending=null;hoverPendingId=null;}
  return;
 }
 if(hoverPendingId===card.id)return;
 if(hoverPending!==null)clearTimeout(hoverPending);
 hoverPendingId=card.id;
 hoverPending=setTimeout(()=>{
  hoverPending=null;hoverPendingId=null;
  // Recheck the current pointer rather than :hover on any replaced DOM node.
  const now=liveHandAt(lastPointerX,lastPointerY);
  if(now?.id!==card.id)return;
  showHandHover(card);
 },70);
}
function showHandHover(card){
 if(!card||!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
 if(previewId===card.id&&!hover.hidden)return;
 // Raise the card IN the actual hand, without reflowing or replacing it.
 raisedHandId=card.id;
 board.querySelectorAll('.player-hand .hand-card').forEach(el=>el.classList.toggle('is-hand-hover',el.dataset.cardId===raisedHandId));
 const token=++previewLoad;
 previewId=card.id;
 const name=card.name,image=art.get(name);
 hoverInfo.replaceChildren();
 const heading=document.createElement('strong');
 heading.textContent=name;heading.style.cssText='display:block;font-size:17px;color:#29ffff;margin-bottom:12px;';
 hoverInfo.append(heading);
 const detail=document.createElement('p');
 detail.textContent=card.type+' · COST '+card.cost+(card.sellTag?' · SELL TAG':'');
 detail.style.margin='0 0 14px';hoverInfo.append(detail);
 const note=document.createElement('p');
 note.textContent=card.unimplementedEffect?'此卡能力尚未支援，無法打出。':card.deferredEffect?'可執行基本出牌；攻擊、反應等觸發效果仍待實作。':'已支援目前練習中的基本操作。';
 note.style.cssText='margin:0;color:#b4c9ce';hoverInfo.append(note);
 if(image){
  let cached=hoverImageCache.get(image);
  if(!cached){
   cached=new Promise(resolve=>{const pic=new Image();pic.onload=()=>resolve(true);pic.onerror=()=>resolve(false);pic.src=image;});
   hoverImageCache.set(image,cached);
  }
  cached.then(ok=>{
   if(token!==previewLoad)return;
   if(ok){if(hoverArt.getAttribute('src')!==image)hoverArt.src=image;hoverArt.alt=name+' 卡面';hoverArt.style.visibility='visible';}
   else{hoverArt.removeAttribute('src');hoverArt.style.visibility='hidden';}
   positionHandHover();
  });
 }else{
  hoverArt.removeAttribute('src');hoverArt.alt='此卡暫無圖片';hoverArt.style.visibility='hidden';
 }
 hover.hidden=false;hover.style.display='flex';hover.setAttribute('aria-hidden','false');
 positionHandHover();
}
function bindLiveHandHover(){
 const rail=board.querySelector('.player-hand .hand-placeholder');
 if(rail)rail.dataset.v3HoverOwned='true';
}
// Bind only once on document: rebuilt hand cards never own hover listeners.
document.addEventListener('pointermove',event=>{
 if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
 lastPointerX=event.clientX;lastPointerY=event.clientY;
 const current=liveHandAt(lastPointerX,lastPointerY);
 if(current){
  handPointerInside=true;
  scheduleHandHover(current);
 }else if(handPointerInside){
  handPointerInside=false;
  if(hoverPending!==null){clearTimeout(hoverPending);hoverPending=null;hoverPendingId=null;}
  if(leaveTimer!==null)clearTimeout(leaveTimer);
  leaveTimer=setTimeout(()=>{
   leaveTimer=null;
   if(!liveHandAt(lastPointerX,lastPointerY))hideHandHover();
  },170);
 }
},{passive:true});
window.addEventListener('scroll',hideHandHover,{passive:true});
window.addEventListener('resize',()=>{hideHandHover()});
const phase=()=>state.finished?'已結束':E.pending(state)?'能力待結算':state.phase==='react'?'防守反應中':state.turn==='ai'?(state.ai.practiceBot?.kind==='mirror-the-heist'?'對手回合（執行中）':'對手回合（暫停）'):state.phase==='main'?'主要階段':'準備階段：'+({ready:'重置',draw:'抽牌',roll:'擲骰'}[state.step]||state.step);
const add=(tag,txt,parent,cls)=>{const el=document.createElement(tag);el.textContent=txt||'';if(cls)el.className=cls;parent.append(el);return el};
function command(label,fn,parent,disabled=false){
 const b=add('button',label,parent,'btn');b.type='button';b.disabled=disabled;
 b.addEventListener('click',()=>{const previous=state;const wasPregame=state.phase==='pregame';const before=new Set(state.player.hand.map(c=>c.id));const r=fn();message=r.ok?r.message:r.reason;if(r.ok){state=r.state;D.transition(previous,state);if(wasPregame&&state.phase==='start')pendingDeal='all';selectedPayments.clear();if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;const added=state.player.hand.map(c=>c.id).filter(id=>!before.has(id));if(added.length)pendingDeal=added;if(state.player.hand.length===6&&r.message===initial)pendingDeal='all';}render()});return b;
}
function indicator(selector,summary){
 const zone=board.querySelector(selector);if(!zone)return;
 let el=zone.querySelector('[data-practice-indicator]');
 if(!el){el=document.createElement('span');el.setAttribute('data-practice-indicator','');el.className='v3-practice-indicator';zone.append(el)}
 el.textContent=summary;
}
function renderHand(){
 const rail=board.querySelector('.player-hand .hand-placeholder');if(!rail)return;
 rail.replaceChildren();rail.classList.add('preview-card-rail');
 // Hover transforms can move the button between pointer-down and click.
 // Resolve pointer clicks from the stable hand slot, including rail background.
 rail.onclick=event=>{
  const card=event.detail===0?state.player.hand.find(c=>c.id===event.target.closest('[data-card-id]')?.dataset.cardId):liveHandAt(event.clientX,event.clientY);
  if(!card)return;
  event.stopPropagation();
  selectedId=selectedId===card.id?null:card.id;attackUnitId=null;selectedLegendId=null;
  selectedPayments.clear();targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';
  message=selectedId?'已選取 '+card.name:'已取消選取';render();setActionTray(false);
 };
 if(state.phase==='pregame')return;
 state.player.hand.forEach((card,i)=>{
  const btn=document.createElement('button');btn.type='button';btn.className='preview-art-card hand-card';btn.dataset.cardName=card.name;btn.dataset.cardId=card.id;btn.dataset.handIndex=String(i);
  const selected=selectedId===card.id;btn.classList.toggle('is-selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
  btn.setAttribute('aria-label','選取 '+card.name+'，費用 '+card.cost+(card.sellTag?'，可變賣':''));
  btn.title=card.name;
  const src=art.get(card.name);
  if(src){const image=document.createElement('img');image.src=src;image.alt=card.name+' 卡面';image.loading='lazy';image.decoding='async';btn.append(image)}
  else{btn.classList.add('missing-art');add('span',card.name,btn,'preview-art-fallback')}

  rail.append(btn);
 });
 // Preserve tabletop rail sizing on both mobile and desktop.
 const nodes=[...rail.querySelectorAll('.preview-art-card')],width=rail.clientWidth,height=rail.clientHeight;
 if(nodes.length&&width){const h=Math.max(40,Math.min(Math.max(56,height),(width-Math.max(0,nodes.length-1)*12)*7/5)),w=h*5/7;
  const overlap=Math.min(w-12,Math.max(0,(w*nodes.length-width)/Math.max(1,nodes.length-1),w*.55));
  rail.style.setProperty('--preview-stack-overlap',Math.max(0,overlap).toFixed(2)+'px');
  nodes.forEach((el,i)=>{el.style.height=h+'px';el.style.width=w+'px';el.style.zIndex=String(i+1)});
 }
}
function renderField(){
 const slots=board.querySelector('.player-field .field-slots');if(!slots)return;
 slots.replaceChildren();
 for(const card of state.player.units){
  const el=add('button','',slots,'v3-played-card');el.type='button';el.title=card.name+' / '+(card.lag?'Lag':'Ready');
  el.classList.toggle('is-table-selected',attackUnitId===card.id);
  el.addEventListener('click',()=>{
   if(E.pending(state)){message='請先在右側完成待結算能力。';render();return;}
   if(state.phase==='react'&&state.pendingAttack?.defendingSide==='player'){runTableCommand(()=>P.defend(state,{kind:'block',blockerId:card.id}));return;}
   const selected=state.player.hand.find(c=>c.id===selectedId);
   if(selected?.type==='Gear'){
    const payments=chosenPayments(selected.cost);
    runTableCommand(()=>P.gear(state,selected.id,payments||[],card.id));
    return;
   }
   attackUnitId=attackUnitId===card.id?null:card.id;
   modeOnTable=attackUnitId?'attack':null;selectedId=null;render();
  });
  const image=art.get(card.name);
  if(image){const img=document.createElement('img');img.src=image;img.alt=card.name;img.loading='lazy';el.append(img)}
  else add('span',card.name,el);
  const stats=A?.unitStats?.(card);
  add('small',(card.lag&&!card.goSolo?'LAG':card.ready?'READY':'SPENT')+(stats?' · PWR '+stats.power:''),el);
  if(stats?.blocker)add('small','BLOCKER',el);
  if(card.gear?.length)add('small','裝備：'+card.gear.map(g=>g.name).join('、'),el);
  if(card.deferredEffect)add('small','特殊效果：待對戰系統',el);
 }
 if(!state.player.units.length)add('div','尚無已打出的單位',slots);
}
function renderRivalField(){
 const slots=board.querySelector('.opponent-field .field-slots');if(!slots)return;
 slots.replaceChildren();
 for(const unit of state.ai.units){
  const el=add('button','',slots,'v3-played-card');el.type='button';el.title=unit.name+(state.ai.practiceBot?.kind==='mirror-the-heist'?'（鏡像對手）':'（練習對手，非 AI 行動）');
  el.addEventListener('click',()=>{if(attackUnitId&&state.phase==='main'&&!unit.ready)runTableAttack({kind:'unit',defenderId:unit.id});else{message=unit.ready?'對手單位仍就緒；先選擇合法目標或使用攔截練習。':'請先點選我方就緒單位，再點選對手。';render()}});
  if(unit.gear?.length){el.title+=' · 裝備：'+unit.gear.map(g=>g.name).join('、');el.setAttribute('aria-label',el.title);const tag=add('span','裝備 ×'+unit.gear.length,el,'v3-gear-count');tag.title=unit.gear.map(g=>g.name).join('、');}
  const src=art.get(unit.name);
  if(src){const img=document.createElement('img');img.src=src;img.alt=unit.name;img.loading='lazy';el.append(img)}
  else add('span',unit.name,el);
  const stats=A?.unitStats?.(unit);
  add('small',(unit.ready?'READY':'SPENT')+' · PWR '+(stats?.power??unit.power),el);
  if(unit.trainingTarget)add('small','練習目標 / 無 AI',el);else if(state.ai.practiceBot?.kind==='mirror-the-heist')add('small','鏡像對手',el);
 }
}
function paymentOptions(parent){
 const p=state.player;
 const pool=[...p.eddies.filter(c=>c.ready).map(c=>({id:c.id,kind:'eddie',label:'Eddie '+(p.eddies.indexOf(c)+1)})),
 ...p.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({id:c.id,kind:'legend',label:(c.faceUp?'傳奇 ':'蓋牌傳奇 ')+(p.legends.indexOf(c)+1)}))];
 const area=add('div','',parent,'v3-payment-pool');
 add('p','選擇支付資源（每個價值 1 €$）：',area);
 for(const source of pool){
  const key=source.kind+':'+source.id,b=add('button',source.label,area,'v3-resource-choice');
  b.type='button';b.setAttribute('aria-pressed',String(selectedPayments.has(key)));
  b.addEventListener('click',()=>{if(selectedPayments.has(key))selectedPayments.delete(key);else selectedPayments.add(key);render()});
 }
 return pool;
}
function gigAdjustmentOptions(){
 const p=state.player,area=add('div','',root,'v3-selected-detail');
 add('strong','調整委託骰（最多正負 1）',area);

 const pick=document.createElement('select');pick.setAttribute('aria-label','選擇委託骰');
 const no=document.createElement('option');no.value='';no.textContent='不調整';pick.append(no);
 const allGigs=[...p.gigs.map(g=>({gig:g,side:'player'})),...(state.ai?.gigs||[]).map(g=>({gig:g,side:'ai'}))];
 for(const {gig,side} of allGigs){const o=document.createElement('option');o.value=side+':'+gig.id;o.textContent=(side==='player'?'我方':'對手')+' d'+gig.sides+'：'+gig.value;pick.append(o)}
 pick.value=gigId?gigSide+':'+gigId:'';
 pick.addEventListener('change',()=>{
  const option=allGigs.find(x=>x.side+':'+x.gig.id===pick.value);
  gigId=option?.gig.id||null;gigSide=option?.side||'player';
  if(!gigId)gigDelta=0;render();
 });area.append(pick);
 const delta=document.createElement('select');delta.setAttribute('aria-label','委託骰增減');
 for(const n of [-1,0,1]){const o=document.createElement('option');o.value=String(n);o.textContent=n>0?'+1':n<0?'-1':'不調整';delta.append(o)}
 delta.value=String(gigDelta);
 delta.addEventListener('change',()=>{gigDelta=Number(delta.value);render()});area.append(delta);
 return {gigId,side:gigSide,delta:gigDelta};
}

// Visible board interaction is the default; these controls are not a second page.
function runTableCommand(fn){
 const previous=state;
 const before=new Set(state.player.hand.map(c=>c.id));
 const result=fn();
 message=result.ok?result.message:result.reason;
 if(result.ok){
  const wasPregame=state.phase==='pregame';state=result.state;D.transition(previous,state);
  if(wasPregame&&state.phase==='start')pendingDeal='all';
  const added=state.player.hand.filter(c=>!before.has(c.id)).map(c=>c.id);
  if(added.length)pendingDeal=added;
  selectedPayments.clear();
  if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;
  if(!state.player.legends.some(c=>c.id===selectedLegendId)||state.phase==='start'||(state.turn!=='player'&&state.phase!=='react'))selectedLegendId=null;
  attackUnitId=null;modeOnTable=null;
 }
 render();
}
function tableButton(label,fn,disabled=false){
 const b=add('button',label,tableControls,'v3-table-btn');b.type='button';b.disabled=disabled;
 b.addEventListener('click',()=>runTableCommand(fn));return b;
}
function chosenPayments(cost){
 const sources=G.sources(state).filter(c=>selectedPayments.has(c.kind+':'+c.id));
 return sources.length===cost?sources.map(({kind,id})=>({kind,id})):null;
}
function scheduleOpponent(){
 if(opponentTimer!==null){clearTimeout(opponentTimer);opponentTimer=null;}
 if(confirmConcede||E.pending(state)||state.phase!=='opponent'||state.step!=='pendingBot'||picker.value!=='theHeist'||state.finished||state.turn!=='ai'||state.ai.practiceBot?.kind!=='mirror-the-heist')return;
 const snapshot=state;
 opponentTimer=setTimeout(()=>{
  opponentTimer=null;
  if(state!==snapshot||picker.value!=='theHeist')return;
  const die=state.ai.fixer.find(d=>d!==20)??state.ai.fixer[0];
  runTableCommand(()=>P.opponentTurn(state,die?Math.floor(Math.random()*die)+1:null));
 },900);
}
const coachSteps=[
 {zone:'.player-fixer',title:'先重置、抽牌，再選骰子',text:'先按右側「重置資源」和「抽 1 張」。輪到擲骰時，可直接點黃色框內的一顆骰子，再按右側「擲骰」；d20 必須留到最後。關閉引導不會跳過準備階段。'},
 {zone:'.player-hand',title:'直接點選手牌',text:'點一下手牌即可選取，右側會出現這張牌的操作。有變賣標記的牌可按「變賣」，取得一張 Eddie。'},
 {zone:'.player-eddies',title:'逐張選擇支付資源',text:'選取要打出的牌後，在右側逐張點選 Eddie 或可支付的傳奇資源。湊齊費用後，再按「打出單位」；確認前不會消耗資源。'},
 {zone:'#v3TableControls',title:'現在跟著提示完成回合',text:'右側是目前可用的操作。先依序重置、抽牌、擲骰，再選手牌出牌。按「結束回合」後，鏡像對手會自動行動。'}
];
function renderGuide(){
 board.querySelectorAll('.v3-guide-active').forEach(el=>el.classList.remove('v3-guide-active'));
 guideRoot.replaceChildren();guideRoot.hidden=true;guideAnchor=null;
 if(picker.value!=='theHeist'||state.phase==='pregame')return;
 const reopen=add('button',guidanceOn?'重新看桌面說明':'開啟桌面引導',tableControls,'v3-table-btn');reopen.type='button';
 reopen.addEventListener('click',()=>{guidanceOn=true;guideIntro=0;render()});
 if(!guidanceOn)return;
 document.getElementById('closeBoardTour')?.click();
 const h=G.next(state,{selectedId,payments:[...selectedPayments],attackUnitId,selectedLegendId});
 guideRoot.hidden=false;guideRoot.dataset.step=h.key;
 const close=add('button','×',guideRoot,'v3-coach-close');close.type='button';close.setAttribute('aria-label','關閉桌面引導');
 close.addEventListener('click',()=>{guidanceOn=false;render()});
 const mark=el=>el?.classList.add('v3-guide-active');
 if(!state.finished&&guideIntro<coachSteps.length&&state.phase!=='react'&&!E.pending(state)){
  const step=coachSteps[guideIntro];guideRoot.dataset.mode='tour';
  add('small','桌面操作 '+(guideIntro+1)+' / '+coachSteps.length,guideRoot);
  add('strong',step.title,guideRoot);add('p',step.text,guideRoot);
  guideAnchor=board.querySelector(step.zone);mark(guideAnchor);
  const actions=add('div','',guideRoot,'v3-coach-actions');
  if(guideIntro>0){const back=add('button','上一步',actions,'btn');back.type='button';back.addEventListener('click',()=>{guideIntro--;render()});}
  const next=add('button',guideIntro===coachSteps.length-1?'開始實戰':'下一步 →',actions,'btn');next.type='button';next.addEventListener('click',()=>{guideIntro++;render()});
  const skip=add('button','略過說明，直接操作',guideRoot,'v3-coach-skip');skip.type='button';skip.addEventListener('click',()=>{guideIntro=coachSteps.length;render()});
 }else{
  guideRoot.dataset.mode='live';
  add('small','實戰引導 '+String(h.stage).padStart(2,'0')+' / 06',guideRoot);
  add('strong','下一個操作',guideRoot);
  const text=add('p',h.text,guideRoot);text.setAttribute('role','status');text.setAttribute('aria-live','polite');
  add('small','完成操作後，提示會自動更新。',guideRoot);
  for(const el of board.querySelectorAll('.player-hand .hand-card')){
   const c=state.player.hand.find(c=>c.id===el.dataset.cardId);
   if((h.key==='select-sale'&&c?.sellTag)||(h.key==='select-unit'&&c?.type==='Unit'&&!c.unimplementedEffect&&c.cost<=G.sources(state).length))mark(el);
  }
  if(h.key==='defense'){
   const ids=new Set(C.blockers(state).map(c=>c.id)),quickIds=new Set(C.quicks(state).map(c=>c.id));
   board.querySelectorAll('.player-field .v3-played-card').forEach((el,i)=>{if(ids.has(state.player.units[i].id))mark(el)});
   board.querySelectorAll('.player-hand .hand-card').forEach(el=>{if(quickIds.has(el.dataset.cardId))mark(el)});
  }
  if(h.key==='payment')tableControls.querySelectorAll('.v3-resource-choice').forEach(mark);
  if(h.key==='attack')board.querySelectorAll('.player-field .v3-played-card').forEach((el,i)=>{const t=G.targets(state,state.player.units[i]);if(t.units.length||t.gigs)mark(el)});
  if(h.key==='target'){
   const targets=G.targets(state,state.player.units.find(u=>u.id===attackUnitId));
   board.querySelectorAll('.opponent-field .v3-played-card').forEach((el,i)=>{if(targets.units.includes(state.ai.units[i].id))mark(el)});
   if(targets.gigs)mark(board.querySelector('.opponent-gigs'));
  }
  const label={ready:'重置資源',draw:'抽 1 張',roll:'擲骰',sell:'變賣',play:'打出單位',end:'結束回合'}[h.key];
  if(label)for(const button of tableControls.querySelectorAll('button'))if(button.textContent===label&&!button.disabled)mark(button);
  const zones={effect:'#v3TableControls',legend:'.player-legends',defense:'#v3TableControls',ready:'#v3TableControls',draw:'.player-deck',roll:'.player-fixer','select-sale':'.player-hand',sell:'.player-hand','select-unit':'.player-hand',payment:'#v3TableControls',play:'#v3TableControls',attack:'.player-field',target:'.opponent-field',opponent:'.opponent-field'};
  guideAnchor=board.querySelector(zones[h.key]||'#v3TableControls');mark(guideAnchor);
 }
 requestAnimationFrame(positionGuide);
}

function runTableAttack(attack){
 if(!attackUnitId)return;
 if(state.ai.practiceBot?.kind==='mirror-the-heist'){runTableCommand(()=>P.reactAttack(state,attackUnitId,attack));return;}
 const blockers=state.ai.practiceBot?.kind==='mirror-the-heist'?[]:state.ai.units.filter(u=>u.ready&&A.unitStats(u).blocker);
 // Choosing a defender response remains explicit in the compact phase controls.
 let reaction={kind:'pass'};
 if(blockers.length){
  const chosen=tableControls.querySelector('[data-table-blocker]')?.value;
  if(!chosen){message='請先選擇對手是否使用 Blocker';render();return}
  reaction=chosen==='pass'?{kind:'pass'}:{kind:'block',blockerId:chosen};
 }
 const quick=tableControls.querySelector('[data-table-quick]');
 if(quick)reaction.quick=quick.checked;
 runTableCommand(()=>P.reactAttack(state,attackUnitId,attack,reaction));
}
function currentDie(){
 const available=state.player.fixer.filter(side=>side!==20||state.player.fixer.length===1);
 return available.includes(selectedDie)?selectedDie:available[0];
}
function fixerHint(){
 if(state.finished)return '本局已結束';
 if(!state.player.fixer.length)return '合事佬區已空；每回合抽牌後直接進入主要階段';
 if(state.turn!=='player')return '等待對手完成回合，再進行準備階段';
 if(state.phase==='start'&&state.step==='ready')return '先按右側「重置資源」，再抽牌、選骰';
 if(state.phase==='start'&&state.step==='draw')return '先按右側「抽 1 張」，接著就能選骰';
 if(state.phase==='start'&&state.step==='roll')return '點選一顆骰子，再按右側「擲骰」';
 return '本回合已擲骰，下一回合再選';
}
function renderFixerChoices(){
 const zone=board.querySelector('.player-fixer');if(!zone)return;
 const choosing=state.turn==='player'&&state.phase==='start'&&state.step==='roll'&&!state.finished;
 for(let die of [...zone.querySelectorAll('.die-icon')]){
  const side=Number(die.querySelector('b')?.textContent.replace('D',''));
  if(die.tagName!=='BUTTON'){
   const button=document.createElement('button');button.type='button';button.className=die.className;button.innerHTML=die.innerHTML;die.replaceWith(button);die=button;
   button.addEventListener('click',()=>{
    if(state.turn!=='player'||state.phase!=='start'||state.step!=='roll'||state.finished){message=fixerHint();render();return;}
    selectedDie=side;message='已選 d'+side+'；按右側「擲骰」確認。';render();
   });
  }
  die.dataset.sides=String(side);
  die.disabled=!state.player.fixer.includes(side)||(side===20&&state.player.fixer.length>1);
  die.setAttribute('aria-label','選擇 d'+side+' 委託骰');die.setAttribute('aria-pressed',String(choosing&&currentDie()===side));
  die.classList.toggle('is-die-selected',choosing&&currentDie()===side);
  die.title=die.disabled?(state.player.fixer.includes(side)?'d20 必須最後使用':'這顆骰子已擲出'):choosing?'點選 d'+side:fixerHint();
 }
 let hint=zone.querySelector('.v3-fixer-hint');if(!hint)hint=add('div','',zone,'v3-fixer-hint');hint.textContent=fixerHint();
}
function renderPublicCounters(){
 for(const [side,prefix] of [['player','player'],['ai','opponent']]){
  const p=state[side],zone=board.querySelector('.'+prefix+'-gigs');
  const count=zone?.querySelector('strong'),cred=zone?.querySelector(':scope > span:not([data-practice-indicator])');
  if(count)count.textContent=p.gigs.length+' / 7';
  if(cred)cred.textContent='街頭聲望：'+(p.gigs.length?p.gigs.reduce((n,g)=>n+g.value,0):'Null');
  let dice=zone?.querySelector('.v3-gig-values');if(zone&&!dice){dice=add('div','',zone,'v3-gig-values')}
  const indicator=zone?.querySelector('[data-practice-indicator]');if(indicator&&dice)dice.after(indicator);
  if(dice)dice.textContent=p.gigs.map(g=>'d'+g.sides+' = '+g.value).join(' · ');
  const deck=board.querySelector('.'+prefix+'-deck .deck-pile');
  if(deck){deck.replaceChildren(document.createTextNode(String(p.deck.length)));add('span','DECK',deck)}
  for(const die of board.querySelectorAll('.'+prefix+'-fixer .die-icon')){
   const sides=Number(die.querySelector('b')?.textContent.replace('D',''));die.style.opacity=p.fixer.includes(sides)?'1':'.25';
  }
  const resources=board.querySelector('.'+prefix+'-eddies .placeholder-label');if(resources)resources.textContent='就緒 Eddies '+p.eddies.filter(c=>c.ready).length+' / '+p.eddies.length;
 }
 indicator('.opponent-hand','對手手牌 '+state.ai.hand.length+' 張（隱藏）');
}
function renderLegends(){
 for(const [side,prefix] of [['player','player'],['ai','opponent']]){
  const rail=board.querySelector('.'+prefix+'-legends .cardbacks');if(!rail)continue;
  rail.replaceChildren();
  state[side].legends.forEach((l,index)=>{
   const button=add('button','',rail,'preview-art-card v3-legend-card');button.type='button';button.dataset.legendId=l.id;button.classList.toggle('face-down',!l.faceUp);button.classList.toggle('is-legend-spent',!l.ready);
   const label=l.faceUp?l.name:'傳奇位置 '+(index+1)+'（蓋牌'+(l.knownToOwner?'，已查看過':'')+'）';
   button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(side==='player'&&selectedLegendId===l.id));
   button.classList.toggle('is-legend-selected',side==='player'&&selectedLegendId===l.id);
   const img=document.createElement('img');img.src=l.faceUp?(art.get(l.name)||''):'https://chromeandgigs.com/card-backs/legend.png';img.alt=label;if(!l.faceUp)img.className='preview-card-back-image';button.append(img);
   const fallback=add('span',l.faceUp?l.name:'傳奇卡',button,'preview-art-fallback');img.onload=()=>{fallback.hidden=true};img.onerror=()=>{img.remove();fallback.hidden=false};
   add('small',l.ready?'READY':'SPENT',button,'v3-legend-state');
   if(side==='player')button.addEventListener('click',()=>{
    if(E.pending(state)){message='請先處理右側待結算能力。';render();return;}
    if(!((state.turn==='player'&&state.phase==='main')||(state.phase==='react'&&state.pendingAttack?.defendingSide==='player'))){message='請先完成重置、抽牌與擲骰，再操作傳奇；對手回合須等待防守反應。';render();return;}
    const gear=state.player.hand.find(c=>c.id===selectedId&&c.type==='Gear');
    if(gear&&l.faceUp&&state.phase==='main'){runTableCommand(()=>P.gear(state,gear.id,chosenPayments(gear.cost)||[],l.id));return;}
    selectedLegendId=selectedLegendId===l.id?null:l.id;selectedId=null;attackUnitId=null;selectedPayments.clear();render();
   });
  });
  board.querySelector('.'+prefix+'-legends [data-practice-indicator]')?.remove();
 }
}
function renderLegendControls(){
 const l=state.player.legends.find(l=>l.id===selectedLegendId);if(!l)return;
 if(state.ai.practiceBot?.kind!=='mirror-the-heist'){add('span','傳奇實戰操作目前適用鏡像模式。',tableControls,'v3-table-hint');return;}
 add('strong',l.faceUp?l.name:'選取傳奇位置 '+(state.player.legends.indexOf(l)+1)+'（蓋牌）',tableControls,'v3-table-selection');
 if(!l.faceUp){
  add('span',state.player.calledThisTurn?'每回合只能呼叫一次；下一回合可再次呼叫。':'逐張選擇 1 €$，再呼叫這張傳奇。翻開前不會顯示卡名。',tableControls,'v3-table-hint');
  paymentOptions(tableControls);const sources=chosenPayments(1);
  tableButton('呼叫傳奇（1 €$）',()=>P.callLegend(state,l.id,sources||[]),state.player.calledThisTurn||!sources);
 }else if(l.goSolo&&state.turn==='player'&&state.phase==='main'){
  add('span','Go Solo：支付 '+l.cost+' €$，以就緒單位登場並可立即攻擊。',tableControls,'v3-table-hint');paymentOptions(tableControls);
  const sources=chosenPayments(l.cost);tableButton('Go Solo（'+l.cost+' €$）',()=>P.goSolo(state,l.id,sources||[]),!sources);
 }else add('span',l.legendEffect==='jackie'?'本回合第一次打出藍色單位或裝備時，會觸發 Jackie。':l.goSolo?'Go Solo 僅在自己的主要階段使用；此傳奇仍可支付資源。':'Viktor 呼叫搜尋已結算；此傳奇仍可支付資源。',tableControls,'v3-table-hint');
}
function renderEffectChoices(){
 const e=E.pending(state);if(!e)return;
 if(effectChoiceId!==e.id){effectChoiceId=e.id;effectChoices.clear();}
 const options=E.options(state,e),confirm=choice=>P.resolveEffect(state,choice);
 add('strong','待結算：'+(e.source||e.type),tableControls,'v3-table-selection');
 const choiceButton=(label,id)=>{const b=add('button',label,tableControls,'v3-resource-choice');b.type='button';b.setAttribute('aria-pressed',String(effectChoices.has(id)));b.addEventListener('click',()=>{if(effectChoices.has(id))effectChoices.delete(id);else effectChoices.add(id);render()});};
 if(e.type==='order'){
  add('span','有多個待結算能力，請選擇先結算哪一個。',tableControls,'v3-table-hint');
  for(const c of options)tableButton('先結算：'+c.source,()=>confirm({effectId:c.id}));
 }else if(e.type==='search'){
  add('span','搜尋牌庫頂 '+options.length+' 張：選最多兩張費用 2 以下的裝備；其餘隨機放回牌庫底。',tableControls,'v3-table-hint');
  for(const c of options){if(c.type==='Gear'&&c.cost<=2)choiceButton(c.name+' · '+c.cost+' €$',c.id);else add('span',c.name+'（不能選取）',tableControls,'v3-table-hint');}
  tableButton('確認搜尋（選取 '+effectChoices.size+' / 2）',()=>confirm({cardIds:[...effectChoices]}),effectChoices.size>2);
 }else if(e.type==='rippler'){
  add('span','只有我方查看牌庫頂；選擇保留或棄置。這不是抽牌。',tableControls,'v3-table-hint');
  add('strong','牌庫頂：'+options[0].name,tableControls,'v3-table-selection');
  tableButton('保留在牌庫頂',()=>confirm({trash:false}));
  tableButton('棄置牌庫頂',()=>confirm({trash:true}));
 }else if(e.type==='peekOne'||e.type==='freeCall'){
  add('span',e.type==='peekOne'?'選一張友方蓋牌傳奇查看；不向對手公開。':'可免費呼叫一張傳奇，仍受每回合一次限制。',tableControls,'v3-table-hint');
  for(const l of options)tableButton((e.type==='peekOne'?'查看':'免費呼叫')+'傳奇位置 '+(state.player.legends.indexOf(l)+1),()=>confirm({legendId:l.id}));
  if(e.type==='freeCall')tableButton('不呼叫，繼續',()=>confirm({}));
 }else if(e.type==='peekResult'){
  add('span','只有我方查看；確認後不再顯示蓋牌卡名。',tableControls,'v3-table-hint');
  for(const l of e.cards)add('strong','位置 '+l.position+'：'+l.name,tableControls,'v3-table-selection');
  tableButton('看完，繼續',()=>confirm({kind:'ack'}));
 }else if(e.type==='discard'){
  add('span','抽牌後，我方街頭聲望較高；必須棄置一張目前手牌。',tableControls,'v3-table-hint');
  for(const c of options)tableButton('棄置：'+c.name,()=>confirm({cardId:c.id}));
 }else if(e.type==='readyEddies'){
  const count=Math.min(e.count,options.length);add('span','選擇 '+count+' 張已使用的 Eddie 重置。',tableControls,'v3-table-hint');
  for(const c of options)choiceButton('Eddie '+(state.player.eddies.indexOf(c)+1),c.id);
  tableButton('確認重置',()=>confirm({eddieIds:[...effectChoices]}),effectChoices.size!==count);
 }else if(e.type==='adjust'){
  add('span','選擇委託骰與調整點數；也可以不調整。'+(e.drawOnDistinct?'之後若我方有至少三種不同點數，抽 1 張。':''),tableControls,'v3-table-hint');
  const pick=document.createElement('select');pick.setAttribute('aria-label','能力指定委託骰');
  for(const g of options){const o=document.createElement('option');o.value=g.side+':'+g.id;o.textContent=(g.side==='player'?'我方':'對手')+' d'+g.sides+' = '+g.value;pick.append(o)}
  const delta=document.createElement('select');delta.setAttribute('aria-label','能力調整點數');
  for(let n=e.min;n<=e.max;n++){const o=document.createElement('option');o.value=String(n);o.textContent=n>0?'+'+n:String(n);delta.append(o)}delta.value='0';tableControls.append(pick,delta);
  tableButton('確認委託骰調整',()=>{const [side,...ids]=pick.value.split(':');return confirm({side,gigId:ids.join(':'),delta:Number(delta.value)})});
 }
}
function renderCombatMarkers(){
 board.querySelectorAll('.v3-combat-attacker,.v3-combat-target').forEach(el=>el.classList.remove('v3-combat-attacker','v3-combat-target'));
 const p=state.pendingAttack;if(!p)return;
 const rival=[...board.querySelectorAll('.opponent-field .v3-played-card')];
 const i=state.ai.units.findIndex(u=>u.id===p.attackerId);rival[i]?.classList.add('v3-combat-attacker');
 if(p.target.kind==='gig')board.querySelector('.player-gigs')?.classList.add('v3-combat-target');
 else{const j=state.player.units.findIndex(u=>u.id===p.target.defenderId);board.querySelectorAll('.player-field .v3-played-card')[j]?.classList.add('v3-combat-target');}
}
function renderDefenseControls(){
 const p=state.pendingAttack,attacker=state.ai.units.find(u=>u.id===p.attackerId);
 const target=p.target.kind==='gig'?'我方委託區':state.player.units.find(u=>u.id===p.target.defenderId)?.name;
 add('strong','對手攻擊：'+attacker.name+'（'+C.power(attacker)+' PWR）',tableControls,'v3-table-selection');
 add('span','目標：'+target,tableControls,'v3-table-hint');
 add('span','可依序使用 Quick／Blocker 或呼叫傳奇，最後結束反應。',tableControls,'v3-table-hint');
 if(selectedLegendId)renderLegendControls();
 for(const blocker of C.blockers(state))tableButton('攔截：'+blocker.name,()=>P.defend(state,{kind:'block',blockerId:blocker.id}));
 const chosen=state.player.hand.find(c=>c.id===selectedId);
 if(chosen){
  if(!C.quicks(state).some(c=>c.id===chosen.id))add('span','防守時只能選擇已支援的 Quick 手牌。',tableControls,'v3-table-hint');
  else{
   add('span','Quick：'+chosen.name+' · '+chosen.cost+' €$',tableControls,'v3-table-selection');paymentOptions(tableControls);
   add('span','支付 '+selectedPayments.size+' / '+chosen.cost+' €$',tableControls,'v3-table-hint');
   const sources=chosenPayments(chosen.cost);
   let select=null;
   if(chosen.name==='Floor It'){
    select=document.createElement('select');select.setAttribute('aria-label','Quick 指定對手單位');
    for(const u of state.ai.units){const option=document.createElement('option');option.value=u.id;option.textContent=u.name;select.append(option)}select.value=p.attackerId;tableControls.append(select);
   }
   tableButton('使用 Quick：'+chosen.name,()=>P.defend(state,{kind:'quick',cardId:chosen.id,sources:sources||[],rivalUnitId:select?.value}),!sources);
  }
 }
 if(!C.quicks(state).length)add('span','目前手上沒有已支援的 Quick。',tableControls,'v3-table-hint');
 tableButton('結束反應並結算',()=>P.defend(state,{kind:'end'}));
}
function compactFeedback(text){
 if(text.length<=160)return text;
 const parts=text.split('；'),actions=parts.filter(p=>/對手呼叫傳奇|Go Solo：|^裝備 /.test(p));
 return (actions.length?actions.slice(-3):parts.slice(-2)).join('；');
}
function renderTableControls(){
 tableControls.replaceChildren();
 if(!E.pending(state)){effectChoiceId=null;effectChoices.clear();}
 if(picker.value!=='theHeist'||state.phase==='pregame')return;
 const p=state.player;
 const headline=add('span',state.phase==='main'?'主要階段':phase(),tableControls,'v3-table-phase');
 if(message&&message!==initial)add('span',compactFeedback(message),tableControls,'v3-table-feedback');
 if(state.finished){confirmConcede=false;const result=E.resultSummary(state);headline.textContent=result.title;add('span',result.reason,tableControls,'v3-result-reason');tableButton('重新開局',()=>({ok:true,state:H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),message:initial}));return}
 if(state.overtime)add('span','OVERTIME · 7 顆骰立即獲勝',tableControls,'v3-overtime');
 if(confirmConcede){
  add('strong','確定認輸並結束本局？',tableControls,'v3-table-selection');
  tableButton('確認認輸',()=>P.concede(state));
  const keep=add('button','繼續對戰',tableControls,'v3-table-btn');keep.type='button';keep.addEventListener('click',()=>{confirmConcede=false;render()});return;
 }
 const concede=add('button','認輸',tableControls,'v3-table-btn');concede.type='button';concede.addEventListener('click',()=>{confirmConcede=true;render()});
 if(E.pending(state)){renderEffectChoices();return;}
 if(state.phase==='react'&&state.pendingAttack?.defendingSide==='player'){renderDefenseControls();return;}
 if(state.turn==='ai'){
  if(state.ai.practiceBot?.kind==='mirror-the-heist'){
   add('span','鏡像對手正在行動…',tableControls,'v3-table-hint');
  }else tableButton('略過腳本對手回合',()=>P.next(state));
  return;
 }
 if(state.phase==='start'){
  if(state.step==='ready')tableButton('重置資源',()=>P.ready(state));
  if(state.step==='draw')tableButton('抽 1 張',()=>P.draw(state));
  if(state.step==='roll'){
   const select=document.createElement('select');select.setAttribute('aria-label','選擇合事佬骰子');
   for(const side of p.fixer){const option=document.createElement('option');option.value=side;option.textContent='d'+side;option.disabled=side===20&&p.fixer.length>1;select.append(option)}
   select.value=String(currentDie());
   select.addEventListener('change',()=>{selectedDie=Number(select.value);render()});
   tableControls.append(select);
   tableButton('擲骰',()=>{const side=currentDie();return P.roll(state,side,Math.floor(Math.random()*side)+1)});
  }
  return;
 }
 if(state.phase!=='main')return;
 if(state.ai.practiceBot?.kind==='mirror-the-heist'){
  if(selectedLegendId){renderLegendControls();tableButton('取消選取傳奇',()=>{selectedLegendId=null;return {ok:true,state,message:'已取消傳奇選取'}});tableButton('結束回合',()=>P.pass(state));return;}
  add('span',state.player.calledThisTurn?'本回合已呼叫傳奇':'點選蓋牌傳奇，可支付 1 €$ 呼叫',tableControls,'v3-table-hint');
 }
 if(selectedId){
  const card=p.hand.find(c=>c.id===selectedId);
  if(card){
   add('span',card.name+' · '+card.cost+' €$',tableControls,'v3-table-selection');
   if(card.sellTag)tableButton('變賣',()=>P.sell(state,card.id),p.soldThisTurn);
   if(!card.unimplementedEffect){
    paymentOptions(tableControls);
    add('span','支付 '+selectedPayments.size+' / '+card.cost+' €$',tableControls,'v3-table-hint');
   }
   if(card.unimplementedEffect)add('span','這張卡的效果尚未完成',tableControls,'v3-table-hint');
   else if(card.type==='Unit'){
    const pay=chosenPayments(card.cost);
    const options={delta:0};
    if(card.onPlayGigAdjust){
     const gigSelect=document.createElement('select');gigSelect.setAttribute('aria-label','登場委託骰調整');
     for(const [value,label] of [['','不調整委託骰'],...['player','ai'].flatMap(side=>
      (state[side]?.gigs||[]).flatMap(g=>[-1,1].filter(delta=>g.value+delta>=1&&g.value+delta<=g.sides)
       .map(delta=>[side+':'+g.id+':'+delta,(side==='player'?'我方':'對手')+' d'+g.sides+' '+(delta>0?'+1':'-1')])))]){
      const opt=document.createElement('option');opt.value=value;opt.textContent=label;gigSelect.append(opt);
     }
     tableControls.append(gigSelect);
     options.gigSelect=gigSelect;
    }
    if(card.onPlaySpendRival){
     const targets=state.ai.units.filter(u=>u.ready===true);
     if(targets.length){
      const select=document.createElement('select');select.setAttribute('aria-label','登場橫置目標');
      for(const unit of targets){const opt=document.createElement('option');opt.value=unit.id;opt.textContent='橫置：'+unit.name;select.append(opt)}
      tableControls.append(select);options.rivalSelect=select;
     }
    }
    if(card.onPlayDefeatGear){
     const optionsGear=['player','ai'].flatMap(side=>(state[side]?.units||[]).flatMap(unit=>
      (unit.gear||[]).map(gear=>({side,unit,gear}))));
     if(optionsGear.length){
      const select=document.createElement('select');select.setAttribute('aria-label','可選擇擊敗裝備');
      for(const [value,label] of [['','不擊敗裝備'],...optionsGear.map(o=>[o.side+':'+o.gear.id,o.gear.name+' / '+o.unit.name])]){
       const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt);
      }
      tableControls.append(select);options.gearSelect=select;
     }
    }
    tableButton('打出單位',()=>{
     const opts={delta:0};
     if(options.gigSelect?.value){
      const [side,gigId,delta]=options.gigSelect.value.split(':');
      Object.assign(opts,{side,gigId,delta:Number(delta)});
     }
     if(options.rivalSelect)opts.rivalUnitId=options.rivalSelect.value;
     if(options.gearSelect?.value){
      const [gearSide,gearTargetId]=options.gearSelect.value.split(':');
      Object.assign(opts,{gearSide,gearTargetId});
     }
     return P.play(state,card.id,pay||[],opts);
    },!pay);
   }else if(card.type==='Gear'){
    add('span','點選場上的友方單位指定裝備目標',tableControls,'v3-table-hint');
    for(const unit of p.units){const pay=chosenPayments(card.cost);
     tableButton('裝備至 '+unit.name,()=>P.gear(state,card.id,pay||[],unit.id),!pay);
    }
   }else if(card.type==='Program'){
    const pay=chosenPayments(card.cost);
    if(card.name==='Floor It'){
     const rival=state.ai.units[0];
     tableButton('使用 Floor It'+(rival?' → '+rival.name:''),()=>P.program(state,card.id,pay||[],{rivalUnitId:rival?.id}),!pay);
    }else if(card.name==='Reboot Optics')tableButton('使用 Reboot Optics',()=>P.program(state,card.id,pay||[],{}),!pay);
    else if(card.name==="Afterparty at Lizzie's"){
     const sel=document.createElement('select');sel.setAttribute('aria-label','調整委託骰目標');
     const options=[['','不調整委託骰'],...['player','ai'].flatMap(side=>(state[side]?.gigs||[]).flatMap(g=>
      [-1,1].filter(delta=>g.value+delta>=1&&g.value+delta<=g.sides)
       .map(delta=>[side+':'+g.id+':'+delta,(side==='player'?'我方':'對手')+' d'+g.sides+' '+(delta>0?'+1':'-1')])) )];
     for(const [value,label] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=label;sel.append(opt)}
     tableControls.append(sel);
     tableButton('使用 Afterparty',()=>{
      const [side,gigId,delta]=sel.value?sel.value.split(':'):['player',null,0];
      return P.program(state,card.id,pay||[],{side,gigId,delta:Number(delta)});
     },!pay);
    }else add('span','尚未支援的卡牌效果',tableControls,'v3-table-hint');
   }
   tableButton('取消選取',()=>{selectedId=null;return {ok:true,state,message:'已取消選取'}});
  }
 }else if(attackUnitId){
  const attacker=p.units.find(u=>u.id===attackUnitId);
  if(attacker){
   add('span','攻擊：'+attacker.name+' · '+A.unitStats(attacker).power+' PWR',tableControls,'v3-table-selection');
   if((attacker.lag&&!attacker.goSolo)||!attacker.ready)add('span','此單位尚不可攻擊',tableControls,'v3-table-hint');
   else{
    const quick=state.ai.practiceBot?.kind!=='mirror-the-heist'&&state.ai.quickExercise?.enabled&&state.ai.hand.some(c=>c.id==='training-quick-floor-it');
    if(quick){const label=add('label','防守方 Floor It',tableControls,'v3-table-hint');const cb=document.createElement('input');cb.type='checkbox';cb.dataset.tableQuick='';label.prepend(cb);}
    const blockers=state.ai.practiceBot?.kind==='mirror-the-heist'?[]:state.ai.units.filter(u=>u.ready&&A.unitStats(u).blocker);
    if(blockers.length){
     const sel=document.createElement('select');sel.dataset.tableBlocker='';sel.setAttribute('aria-label','防守方攔截選擇');
     for(const [value,label] of [['','選擇對手反應'],['pass','不攔截'],...blockers.map(u=>[u.id,'Blocker：'+u.name])]){
      const opt=document.createElement('option');opt.value=value;opt.textContent=label;sel.append(opt);
     }
     tableControls.append(sel);
    }
    const rival=state.ai.gigs;
    if(rival.length){
     const select=document.createElement('select');select.setAttribute('aria-label','選擇對手委託骰');
     for(const gig of rival){const option=document.createElement('option');option.value=gig.id;option.textContent='d'+gig.sides+' / '+gig.value;select.append(option)}
     tableControls.append(select);
     tableButton('攻擊委託區',()=>{
      const modifier=tableControls.querySelector('[data-table-quick]')?.checked?1:0;
      const power=A.unitStats(attacker).power-modifier;
      const count=power<=0?0:Math.min(rival.length,Math.floor(power/10)+1);
      const ids=[select.value,...rival.filter(g=>g.id!==select.value).map(g=>g.id)].slice(0,count);
      const blockers=state.ai.practiceBot?.kind==='mirror-the-heist'?[]:state.ai.units.filter(u=>u.ready&&A.unitStats(u).blocker);
      const choice=tableControls.querySelector('[data-table-blocker]')?.value;
      if(state.ai.practiceBot?.kind==='mirror-the-heist')return P.reactAttack(state,attackUnitId,{kind:'gig',gigIds:ids});
      if(blockers.length&&!choice)return {ok:false,reason:'請先選擇防守反應'};
      const reaction={kind:choice&&choice!=='pass'?'block':'pass',...(choice&&choice!=='pass'?{blockerId:choice}:{}),
       ...(state.ai.quickExercise?.enabled&&state.ai.hand.some(c=>c.id==='training-quick-floor-it')?{quick:!!tableControls.querySelector('[data-table-quick]')?.checked}:{})};
      return P.reactAttack(state,attackUnitId,{kind:'gig',gigIds:ids},reaction);
     });
    }
    add('span','也可以直接點擊對手已使用的單位',tableControls,'v3-table-hint');
   }
  }
 }else add('span','點擊手牌出牌，或點擊己方單位攻擊',tableControls,'v3-table-hint');
 tableButton('結束回合',()=>P.pass(state));
}
function render(){
 if(state.phase==='pregame'){confirmConcede=false;selectedLegendId=null;selectedId=null;selectedPayments.clear();attackUnitId=null;effectChoiceId=null;effectChoices.clear();}
 hideHandHover();
 const sequence=++renderSequence;
 cancelDeals();
 const deal=pendingDeal;pendingDeal=null;
 const supported=picker.value==='theHeist';
 if(!supported){guideRoot.hidden=true;tableControls.replaceChildren();if(opponentTimer!==null){clearTimeout(opponentTimer);opponentTimer=null;}board.querySelectorAll('.v3-guide-active').forEach(el=>el.classList.remove('v3-guide-active'));}
 root.replaceChildren();
 openingRoot.replaceChildren();
 openingRoot.hidden=state.phase!=='pregame'||picker.value!=='theHeist';
 if(!openingRoot.hidden){
  // Opening is its own pre-match dialog, separate from both tutorial and turn actions.
  document.getElementById('closeBoardTour')?.click();
  setActionTray(false);
 }
 if(!supported){
  const liveRail=board.querySelector('.player-hand .hand-placeholder');if(liveRail)liveRail.dataset.v3HoverOwned='false';
  board.querySelectorAll('[data-practice-indicator]').forEach(el=>el.remove());
  const slots=board.querySelector('.player-field .field-slots');
  if(slots){slots.replaceChildren();['己方角色','己方角色','裝備'].forEach(label=>add('div',label,slots))}
  if($('battlePreviewStatus'))$('battlePreviewStatus').textContent='Embracing Power 目前仍為卡圖預覽，尚未接入實際回合練習。';
  add('p','目前只有 The Heist 已接入實際手牌與支付練習。Embracing Power 仍保留原本卡圖預覽。',root,'v3-turn-note');
  return;
 }
 const p=state.player;
 renderHand();bindLiveHandHover();renderField();renderRivalField();renderLegends();
 renderTableControls();
 renderGuide();
 renderCombatMarkers();
 renderPublicCounters();
 renderFixerChoices();
 scheduleOpponent();
 if(deal)requestAnimationFrame(()=>{if(sequence===renderSequence&&picker.value==='theHeist'&&!$('battle')?.classList.contains('hide'))dealHand(deal)});
 const header=add('div','',root,'v3-turn-header');
 add('strong','THE HEIST / '+(state.phase==='pregame'?'開局設定':'ROUND '+state.round),header);add('span',state.phase==='pregame'?'等待先後攻':phase(),header);
 add('p','The Heist 支援隨機起手與一次整手重抽，也可選固定手牌練習。鏡像模式包含傳奇、裝備能力、攻擊及 Quick／Blocker；仍是有限規則與對手策略。',root,'v3-turn-note');
 if(state.phase==='pregame'){
  const order=add('div','',openingRoot,'v3-selected-detail');
  add('strong',state.opening?.orderChosen?'開局設定 / 確認六張起手':'開局設定 / 選擇牌組與先後攻',order);
  add('p',message,order,'v3-opening-status').setAttribute('role','status');
  if(!state.opening?.orderChosen){
  const deckLabel=add('label','牌組',order);
  const deckSelect=document.createElement('select');
  deckSelect.id='v3RoomDeckSelect';deckSelect.setAttribute('aria-label','選擇實戰牌組');
  const playable=document.createElement('option');playable.value='theHeist';playable.textContent='The Heist（目前可操作）';deckSelect.append(playable);
  const unavailable=document.createElement('option');unavailable.value='embracingPower';unavailable.textContent='Embracing Power（尚未接入實戰）';unavailable.disabled=true;deckSelect.append(unavailable);
  deckSelect.value='theHeist';
  deckSelect.addEventListener('change',()=>{picker.value=deckSelect.value;picker.dispatchEvent(new Event('change',{bubbles:true}))});
  deckLabel.append(deckSelect);
  const handLabel=add('label','開局方式',order);
  const handSelect=document.createElement('select');handSelect.setAttribute('aria-label','選擇開局方式');
  for(const [value,label] of [['random','隨機起手（可重抽一次）'],['basic','固定練習：基礎出牌手牌'],['quick','固定練習：效果與 Quick 手牌']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;option.disabled=value==='random'&&opponentMode!=='mirror';handSelect.append(option);
  }
  handSelect.value=scenario;
  handSelect.addEventListener('change',()=>{
   scenario=handSelect.value;D.cancel();state=H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;selectedPayments.clear();targetId=null;
   gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';
   message=scenario==='random'?'先決定先後攻，再洗牌抽取六張起手。':'已更新本局六張固定練習手牌。';render();
  });
  handLabel.append(handSelect);
  const opponentLabel=add('label','對手類型',order);
  const opponentSelect=document.createElement('select');opponentSelect.setAttribute('aria-label','選擇對手模式');
  for(const [value,label] of [['mirror','自動測試對手：The Heist 鏡像牌組'],['script','固定目標：Blocker／Quick 腳本練習']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;opponentSelect.append(option);
  }
  opponentSelect.value=opponentMode;
  opponentSelect.addEventListener('change',()=>{
   opponentMode=opponentSelect.value;if(opponentMode==='script'&&scenario==='random')scenario='basic';D.cancel();
   state=H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;attackUnitId=null;selectedPayments.clear();
   message='已更新對手模式。';render();
  });
  opponentLabel.append(opponentSelect);
  add('p',opponentMode==='mirror'?(scenario==='random'?'雙方洗牌並抽六張；對手保留起手，會支付呼叫傳奇、Go Solo、出牌與裝備，攻擊時等待你的防守反應。':'固定練習保留指定起手與牌庫順序；鏡像對手會自動執行回合並等待你的防守反應。'):'固定目標模式保留原本預先配置的單位與委託骰，可測試腳本 Blocker／Quick。',order);
  if(opponentMode==='script'){
  const defenderLabel=add('label','腳本對手反應（測試模式）',order);
  const defenderSelect=document.createElement('select');defenderSelect.setAttribute('aria-label','選擇測試對手反應');
  for(const [value,label] of [['none','基本對手（無額外反應）'],['blocker','Blocker 攔截'],['quick','Floor It Quick'],['both','Blocker + Floor It']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;defenderSelect.append(option);
  }
  defenderSelect.value=defensePreset;
  defenderSelect.addEventListener('change',()=>{
   defensePreset=defenderSelect.value;D.cancel();state=H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;attackUnitId=null;selectedPayments.clear();
   message='已更新腳本對手設定。';render();
  });
  defenderLabel.append(defenderSelect);
  }
  }
  const opening=state.opening;
  if(scenario==='random'&&opening?.orderChosen){
   add('p',(opening.first==='player'?'我方先攻':'對手先攻')+' · 雙方已完成洗牌與六張起手。',order);
   const cards=add('div','',order,'v3-opening-cards');
   for(const c of state.player.hand){
    const item=add('div','',cards,'v3-opening-card');item.dataset.cardId=c.id;
    const src=art.get(c.name);if(src){const img=document.createElement('img');img.src=src;img.alt=c.name;item.append(img);}
    add('span',c.name,item);add('small',c.cost+' €$ · '+(c.sellTag?'可變賣':'不可變賣'),item);
   }
   if(!opening.handDecisions.player){
    add('p','可保留目前六張，或將整手洗回牌庫重抽六張；每局只能重抽一次，不能只換部分牌。'+(opening.first==='ai'?'對手已先決定保留。':'我方決定後，對手再決定。'),order);
    command('保留這六張',()=>P.openingHand(state,'keep'),order).classList.add('v3-opening-primary');
    command('整手重抽一次',()=>P.openingHand(state,'mulligan'),order);
   }else{
    add('p',opening.mulliganUsed.player?'已重抽一次；這六張就是本局起手。':'已保留這六張起手。',order);
    add('p','對手已保留六張起手（內容隱藏）。',order);
    command('開始對戰',()=>P.beginOpening(state),order).classList.add('v3-opening-primary');
   }
   command('重新設定開局',()=>({ok:true,state:H.fresh(scenario,{preGame:true,aiMode:opponentMode,randomizeLegends:true}),message:initial}),order);
  }else{
   if(scenario==='random')add('p','先決定先後攻，之後雙方洗牌、隨機排列傳奇並抽六張起手。',order);
   else{
    add('p','本局起始六張：'+state.player.hand.map(c=>c.name).join('、'),order,'v3-opening-hand-list');
    add('p','固定練習使用指定手牌與牌庫順序，不提供 Mulligan。可切換「隨機起手」練習洗牌與重抽。',order);
   }
  add('p','雙方各擲一顆 d20，點數較高者決定先攻或後攻；同點重擲。',order);
  const roll=state.opening;
  if(!roll?.winner){
   command('雙方擲 d20 決定選擇權',()=>{
    const me=Math.floor(Math.random()*20)+1,rival=Math.floor(Math.random()*20)+1;
    const result=P.rollForOrder(state,me,rival);
    if(result.ok)D.show([{label:'我方',sides:20,value:me},{label:'對手',sides:20,value:rival}]);
    return result;
   },order).classList.add('v3-opening-primary');
  }else{
   add('p','我方 '+roll.playerRoll+' ／ 腳本對手 '+roll.rivalRoll+'。'+(roll.winner==='player'?'我方取得選擇權。':'腳本對手取得選擇權。'),order);
   if(roll.winner==='player'){
    command('我方選擇先攻',()=>P.chooseOrder(state,'player'),order).classList.add('v3-opening-primary');
    command('我方選擇後攻',()=>P.chooseOrder(state,'ai'),order);
   }else command('對手選擇先攻',()=>P.chooseOrder(state,'ai'),order).classList.add('v3-opening-primary');
  }
  }
  add('p','先攻者左側兩張傳奇卡會橫置，第一回合不能重置。鏡像對手會自動執行回合；固定腳本模式會略過對手行動。',order);
 }
 const stats=add('div','',root,'v3-turn-stats');
 add('span','手牌 '+p.hand.length+' 張',stats);
 add('span','Eddies '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length,stats);
 add('span','傳奇可支付 '+p.legends.filter(e=>e.ready&&(!e.faceUp||e.sellTag)).length,stats);
 add('span','委託骰 '+p.gigs.length+' 顆',stats);
 add('span','場地單位 '+p.units.length+' 張',stats);
 add('span','棄牌區 '+(p.trash?.length||0)+' 張',stats);
 if(p.pendingRebootOptics)add('span','已啟用 Reboot Optics：本回合下一次對手交戰時保護友方單位',stats);
 const chosen=state.phase==='pregame'?null:p.hand.find(c=>c.id===selectedId);
 const details=state.phase==='pregame'?null:add('div','',root,'v3-selected-detail');
 if(chosen&&details){add('strong',chosen.name,details);add('p',chosen.type+' · COST '+chosen.cost+' · '+(chosen.sellTag?'有變賣標記':'不可變賣')+(chosen.unimplementedEffect?' · 尚未支援出牌效果':chosen.deferredEffect?' · 可登場／裝備，觸發效果待實作':''),details)}
 else if(details)add('p','點選上方手牌以查看操作。',details);
 const buttons=add('div','',root,'v3-turn-actions');
 if(!state.finished&&state.turn==='player'&&state.phase==='start'){
  if(state.step==='ready')command('01 重置資源',()=>P.ready(state),buttons);
  if(state.step==='draw')command('02 抽 1 張',()=>P.draw(state),buttons);
  if(state.step==='roll'){
   const select=document.createElement('select');select.setAttribute('aria-label','選擇委託骰');
   for(const side of p.fixer){const opt=document.createElement('option');opt.value=side;opt.textContent='d'+side;opt.disabled=side===20&&p.fixer.length>1;select.append(opt)}
   buttons.append(select);
   command('03 擲骰並進入主要階段',()=>{const side=Number(select.value);return P.roll(state,side,Math.floor(Math.random()*side)+1)},buttons);
  }
 }
 if(!state.finished&&state.turn==='player'&&state.phase==='main'){
  command('變賣選取的手牌',()=>P.sell(state,selectedId),buttons,!chosen?.sellTag||p.soldThisTurn);
  // Bounded combat exercise. The target setup is explicitly a trainer action,
  // never presented as an AI turn or a completed Quick/blocker window.
  // The scripted defender's reaction is a visible choice, never an AI assumption.
  const trainingBlockers=(state.ai?.units||[]).filter(u=>u.ready&&A.unitStats(u).blocker);

  const quickAvailable=Boolean(state.ai.quickExercise?.enabled&&state.ai.hand.some(c=>c.id==='training-quick-floor-it'));

  function reactionPicker(panel){
   const wrap=add('div','',panel,'v3-selected-detail');
   add('strong','防守方 React Step（腳本選擇）',wrap);
   let quickCheck=null;
   if(quickAvailable){
    const label=add('label','',wrap,'v3-resource-choice');
    quickCheck=document.createElement('input');quickCheck.type='checkbox';
    label.append(quickCheck,document.createTextNode(' 先打出 Floor It：支付 1 €$，攻擊者戰力 -1、抽 1 張'));
   }
   const chooser=document.createElement('select');chooser.setAttribute('aria-label','選擇對手反應');
   if(trainingBlockers.length){const pending=document.createElement('option');pending.value='';pending.textContent='請選擇防守方反應';chooser.append(pending)}
   const pass=document.createElement('option');pass.value='pass';pass.textContent='不使用 Blocker → 繼續原目標';chooser.append(pass);
   for(const blocker of trainingBlockers){
    const opt=document.createElement('option');opt.value=blocker.id;opt.textContent='使用 Blocker：'+blocker.name;chooser.append(opt);
   }
   wrap.append(chooser);
   const read=()=>!chooser.value?null:{kind:chooser.value==='pass'?'pass':'block',...(chooser.value==='pass'?{}:{blockerId:chooser.value}),...(quickAvailable?{quick:quickCheck.checked}:{})};
   read.onChange=callback=>quickCheck?.addEventListener('change',callback);
   return read;
  }
  const trainingTargets=(state.ai?.units||[]).filter(u=>u.trainingTarget);
  if(trainingTargets.length){
   const exercise=add('div','',root,'v3-selected-detail');
   add('strong','單位交戰練習（限定已使用的對手單位）',exercise);
   const unspent=trainingTargets.filter(u=>u.ready===true);
   for(const u of unspent)command('練習設定：將 '+u.name+' 橫置',()=>P.prepareTrainingTarget(state,u.id),exercise);
   const exhausted=trainingTargets.filter(u=>u.ready===false);
   const attackers=p.units.filter(u=>u.ready===true&&!u.lag&&!u.deferredEffect&&!u.unimplementedEffect);
   if(exhausted.length&&attackers.length){
    const attackSelect=document.createElement('select');
    attackSelect.setAttribute('aria-label','選擇攻擊單位');
    for(const u of attackers){const o=document.createElement('option');o.value=u.id;o.textContent=u.name+' / '+A.unitStats(u).power+' PWR';attackSelect.append(o)}
    exercise.append(attackSelect);
    const targetSelect=document.createElement('select');
    targetSelect.setAttribute('aria-label','選擇已使用的對手單位');
    for(const u of exhausted){const o=document.createElement('option');o.value=u.id;o.textContent=u.name+' / '+A.unitStats(u).power+' PWR';targetSelect.append(o)}
    exercise.append(targetSelect);
    const reaction=reactionPicker(exercise);
    command('攻擊已使用的對手單位',()=>P.reactAttack(state,attackSelect.value,{kind:'unit',defenderId:targetSelect.value},reaction()),exercise);
   }else if(exhausted.length)add('p','需有一張已解除 Lag、就緒且沒有待處理攻擊能力的己方單位。',exercise);
   add('p','此練習可依序使用腳本 Floor It 與 Blocker；其他 Quick 與特殊觸發效果仍未完成。',exercise);
  }

  const gigTargets=state.ai?.gigs||[];
  if(gigTargets.length){
   const panel=add('div','',root,'v3-selected-detail');
   add('strong','攻擊委託區 / 搶骰練習',panel);
   add('p','預設練習對手持有 '+gigTargets.length+' 顆委託骰；非正式 AI 對局。',panel);
   const eligible=p.units.filter(u=>u.ready===true&&!u.lag&&!u.deferredEffect&&!u.unimplementedEffect);
   if(eligible.length){
    const chooser=document.createElement('select');chooser.setAttribute('aria-label','選擇搶骰攻擊單位');panel.append(chooser);
    for(const u of eligible){const op=document.createElement('option');op.value=u.id;op.textContent=u.name+' / '+A.unitStats(u).power+' PWR';chooser.append(op)}
    const picks=add('div','',panel,'v3-payment-pool');
    const picked=new Set();
    for(const gig of gigTargets){
     const label=add('label','',picks,'v3-resource-choice');
     const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=gig.id;
     label.append(checkbox,document.createTextNode(' d'+gig.sides+' = '+gig.value));
     checkbox.addEventListener('change',()=>{if(checkbox.checked)picked.add(gig.id);else picked.delete(gig.id)});
    }
    const countNote=add('p','選擇對手骰子，數量需符合攻擊單位戰力。',panel);
    const reaction=reactionPicker(panel);
    const attack=command('宣告攻擊並進入反應結算',()=>P.reactAttack(state,chooser.value,{kind:'gig',gigIds:[...picked]},reaction()),panel);
    const update=()=>{
     const unit=eligible.find(u=>u.id===chooser.value),power=A.unitStats(unit).power-(reaction()?.quick?1:0);
     const count=power<=0?0:Math.min(gigTargets.length,Math.floor(power/10)+1);
     countNote.textContent='戰力 '+power+'：需選擇 '+count+' 顆骰子（目前 '+picked.size+' 顆）';
     attack.disabled=picked.size!==count;
    };
    chooser.addEventListener('change',update);
    reaction.onChange(update);
    for(const checkbox of picks.querySelectorAll('input'))checkbox.addEventListener('change',update);
    update();
   }else add('p','需要一張已解除 Lag、目前就緒的己方單位。',panel);
   add('p','可依序選擇腳本 Floor It 與 Blocker；其他 Quick 與完整反應流程尚未完成。',panel);
  }
  if(chosen&&!chosen.unimplementedEffect){
   const sources=paymentOptions(root);
   const selected=sources.filter(src=>selectedPayments.has(src.kind+':'+src.id));
   const paid=selected.map(({kind,id})=>({kind,id}));
   add('p','已指定 '+selected.length+' / '+chosen.cost+' Eddies',root,'v3-payment-count');
   const affordable=selected.length===chosen.cost;
   if(chosen.type==='Unit'){
    if(chosen.onPlayGigAdjust)gigAdjustmentOptions();
    const rivals=(state.ai?.units||[]).filter(u=>u.ready===true);
    if(chosen.onPlaySpendRival){
     const area=add('div','',root,'v3-selected-detail');
     add('strong','登場效果：橫置自己與一張對手單位',area);
     if(!rivals.length)add('p','對手目前沒有就緒單位，登場後僅橫置自己。',area);
     for(const rival of rivals){
      const btn=add('button',rival.name,area,'v3-resource-choice');btn.type='button';
      btn.setAttribute('aria-pressed',String(rival.id===rivalUnitId));
      btn.addEventListener('click',()=>{rivalUnitId=rival.id;render()});
     }
    }
    if(chosen.onPlayDefeatGear){
     const area=add('div','',root,'v3-selected-detail');
     add('strong','登場效果：可選擇擊敗場上的一張裝備',area);
     const candidates=['player','ai'].flatMap(side=>
      [...(state[side]?.units||[]),...(state[side]?.legends||[])].flatMap(host=>
       (host.gear||[]).map(gear=>({side,host,gear}))));
     if(!candidates.length)add('p','目前沒有裝備，可以不選擇目標直接登場。',area);
     for(const entry of candidates){
      const btn=add('button',(entry.side==='player'?'我方':'對手')+' '+entry.gear.name+'（'+entry.host.name+'）',area,'v3-resource-choice');
      btn.type='button';btn.setAttribute('aria-pressed',String(defeatGearId===entry.gear.id&&defeatGearSide===entry.side));
      btn.addEventListener('click',()=>{if(defeatGearId===entry.gear.id&&defeatGearSide===entry.side){defeatGearId=null}else{defeatGearId=entry.gear.id;defeatGearSide=entry.side}render()});
     }
    }
    command('支付並打出 '+chosen.name,()=>P.play(state,selectedId,paid,{gigId,side:gigSide,delta:gigDelta,rivalUnitId,gearTargetId:defeatGearId,gearSide:defeatGearSide}),buttons,!affordable||(chosen.onPlayGigAdjust&&gigDelta!==0&&!gigId)||(chosen.onPlaySpendRival&&rivals.length>0&&!rivalUnitId));
   }else if(chosen.type==='Gear'){
    const area=add('div','',root,'v3-selected-detail');
    add('strong','裝備目標',area);
    const targets=[...p.units,...p.legends.filter(l=>l.faceUp)];
    if(!targets.length)add('p','需先有友方單位或已翻開的傳奇卡。',area);
    for(const target of targets){
     const b=add('button',target.name,area,'v3-resource-choice');
     b.type='button';b.setAttribute('aria-pressed',String(target.id===targetId));
     b.addEventListener('click',()=>{targetId=target.id;render()});
    }
    command('支付並裝備 '+chosen.name,()=>P.gear(state,selectedId,paid,targetId),buttons,!affordable||!targets.some(t=>t.id===targetId));
   }else if(chosen.type==='Program'&&chosen.name==="Afterparty at Lizzie's"){
    gigAdjustmentOptions();
    command('支付並執行 '+chosen.name,()=>P.program(state,selectedId,paid,{gigId,side:gigSide,delta:gigDelta}),buttons,!affordable||(gigDelta!==0&&!gigId));
   }else if(chosen.type==='Program'&&chosen.name==='Floor It'){
    const area=add('div','',root,'v3-selected-detail');add('strong','Quick：指定本回合戰力 -1 的對手單位',area);
    const rivals=state.ai?.units||[];
    if(!rivals.length)add('p','沒有對手單位，仍可執行抽牌效果。',area);
    for(const unit of rivals){
     const button=add('button',unit.name+'（'+(A?.unitStats?.(unit)?.power??unit.power)+' PWR）',area,'v3-resource-choice');
     button.type='button';button.setAttribute('aria-pressed',String(rivalUnitId===unit.id));
     button.addEventListener('click',()=>{rivalUnitId=unit.id;render()});
    }
    command('支付並執行 Floor It',()=>P.program(state,selectedId,paid,{rivalUnitId}),buttons,!affordable||(rivals.length>0&&!rivalUnitId));
   }else if(chosen.type==='Program'&&chosen.name==='Reboot Optics'){
    const area=add('div','',root,'v3-selected-detail');
    add('strong','Quick：保護下一次戰鬥',area);
    add('p','此牌可在主要階段打出，會記錄本回合下次對手單位戰鬥的保護效果；鏡像基本戰鬥已支援保護結算；腳本戰鬥仍保留限制。',area);
    command('支付並打出 Reboot Optics',()=>P.program(state,selectedId,paid,{}),buttons,!affordable);
   }
  }
  command('結束我的回合',()=>P.pass(state),buttons);
 }
 if(!state.finished&&state.turn==='ai'){
  if(state.ai.practiceBot?.kind==='mirror-the-heist'){
   const die=state.ai.fixer.find(side=>side!==20)??state.ai.fixer[0];
   command('執行鏡像對手回合',()=>P.opponentTurn(state,die?Math.floor(Math.random()*die)+1:null),buttons);
  }else command('略過對手行動，開始下一回合',()=>P.next(state),buttons);
 }
 command('重新開始 The Heist 練習',()=>({ok:true,state:H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),message:initial}),buttons);
 const status=add('p',message,root,'v3-turn-feedback');status.setAttribute('role','status');
 const summary=add('div','',root,'v3-turn-log');add('strong','實際練習狀態',summary);
 add('p','場地：'+(p.units.map(c=>c.name+'（'+(c.ready?'Ready':'Spent')+(c.lag?' / Lag':'')+'）').join('、')||'無'),summary);
 add('p','委託骰：'+(p.gigs.map(d=>'d'+d.sides+'='+d.value).join('、')||'無'),summary);
 add('p','棄牌區：'+((p.trash||[]).map(c=>c.name).join('、')||'無'),summary);
 add('p','對手練習單位：'+(state.ai.units.map(u=>u.name+'（'+(u.ready?'Ready':'Spent')+'，PWR '+(A?.unitStats?.(u)?.power??u.power)+'）').join('、')||'無'),summary);
 indicator('.turn-info','THE HEIST：'+phase());
 indicator('.player-eddies','Eddies 就緒 '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length);
 indicator('.player-gigs',p.gigs.length+' 顆委託骰');
 indicator('.opponent-gigs',(state.ai.gigs||[]).length+(state.ai.practiceBot?.kind==='mirror-the-heist'?' 顆委託骰':' 顆練習委託骰'));
 indicator('.player-field',p.units.length+' 張實際單位 · 移出遊戲 '+(p.removed?.length||0)+' 張');
 indicator('.player-deck','練習牌庫：'+p.deck.length+' 張');
 if($('battlePreviewStatus'))$('battlePreviewStatus').textContent='The Heist 實際牌組操作練習。選取手牌後在桌面指定支付資源；未支援的特殊能力仍不會自動結算。';
}
const shuffleButton=$('redrawBattleHand'),legendButton=$('toggleBattleLegends');
function syncDeck(){
 D.cancel();
 if(picker.value==='theHeist'){
  scenario=opponentMode==='mirror'?'random':'basic';state=H.fresh(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});pendingDeal=$('battle')?.classList.contains('hide')?null:'all';selectedId=null;selectedPayments.clear();targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';message=initial;
  if(shuffleButton)shuffleButton.disabled=true;
  if(legendButton)legendButton.disabled=true;
 }else{
  if(shuffleButton)shuffleButton.disabled=false;
  if(legendButton)legendButton.disabled=false;
 }
 render();
}
picker.addEventListener('change',syncDeck);
syncDeck();
// The page initializes while #battle is hidden; deal only when the player enters the table.
const battlePage=$('battle');
function dealOnEntry(){
 const visible=battlePage&&!battlePage.classList.contains('hide');
 if(!visible){entryDealt=false;cancelDeals();D.cancel();guideRoot.hidden=true;return}
 if(entryDealt||picker.value!=='theHeist')return;
 if(state.phase!=='pregame'){guideRoot.hidden=!guidanceOn;requestAnimationFrame(positionGuide);}
 entryDealt=true;
 if(picker.value==='theHeist'&&state.phase==='pregame'){document.getElementById('closeBoardTour')?.click();setActionTray(false)}
 requestAnimationFrame(()=>{if(!battlePage.classList.contains('hide')&&picker.value==='theHeist'&&state.phase!=='pregame')dealHand('all')});
}
if(battlePage&&typeof MutationObserver!=='undefined'){
 new MutationObserver(dealOnEntry).observe(battlePage,{attributes:true,attributeFilter:['class']});
 dealOnEntry();
}
})();
