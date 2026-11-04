/* V3: real starter-hand basic practice. Safely limited to verified basic unit interactions. */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.NCTV3TurnPractice,H=window.NCTV3Heist,A=window.NCTV3Actions;
const root=$('v3TurnPractice'),board=$('battleTour'),picker=$('battleDeckChoice');
if(!root||!board||!P||!H||!picker)return;
const toggleActions=$('toggleV3BattleActions');
// The turn controls live inside the game board, not in a second website toolbar.
const phaseZone=board.querySelector('.turn-info');
if(toggleActions&&phaseZone)phaseZone.append(toggleActions);
function setActionTray(open){
 root.classList.toggle('is-open',open);
 toggleActions?.setAttribute('aria-expanded',String(open));
 toggleActions?.classList.toggle('active',open);
 if(open)hideHandHover();
}
toggleActions?.addEventListener('click',()=>setActionTray(!root.classList.contains('is-open')));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('is-open'))setActionTray(false)});

const initial='The Heist 實際 40 張初始牌組：請完成準備階段，再選擇上方的手牌。';
let scenario='basic',state=H.fresh(scenario),selectedId=null,selectedPayments=new Set(),targetId=null,gigId=null,gigSide='player',gigDelta=0,rivalUnitId=null,defeatGearId=null,defeatGearSide='player',message=initial;
// Card-deal motion uses transient visual clones; actual hand/game state never animates or changes.
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
const phase=()=>state.finished?'已結束':state.turn==='ai'?'對手回合（暫停）':state.phase==='main'?'主要階段':'準備階段：'+({ready:'重置',draw:'抽牌',roll:'擲骰'}[state.step]||state.step);
const add=(tag,txt,parent,cls)=>{const el=document.createElement(tag);el.textContent=txt||'';if(cls)el.className=cls;parent.append(el);return el};
function command(label,fn,parent,disabled=false){
 const b=add('button',label,parent,'btn');b.type='button';b.disabled=disabled;
 b.addEventListener('click',()=>{const before=new Set(state.player.hand.map(c=>c.id));const r=fn();message=r.ok?r.message:r.reason;if(r.ok){state=r.state;selectedPayments.clear();if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;const added=state.player.hand.map(c=>c.id).filter(id=>!before.has(id));if(added.length)pendingDeal=added;if(state.player.hand.length===6&&r.message===initial)pendingDeal='all';}render()});return b;
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
 state.player.hand.forEach((card,i)=>{
  const btn=document.createElement('button');btn.type='button';btn.className='preview-art-card hand-card';btn.dataset.cardName=card.name;btn.dataset.cardId=card.id;btn.dataset.handIndex=String(i);
  const selected=selectedId===card.id;btn.classList.toggle('is-selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
  btn.setAttribute('aria-label','選取 '+card.name+'，費用 '+card.cost+(card.sellTag?'，可變賣':''));
  btn.title=card.name;
  const src=art.get(card.name);
  if(src){const image=document.createElement('img');image.src=src;image.alt=card.name+' 卡面';image.loading='lazy';image.decoding='async';btn.append(image)}
  else{btn.classList.add('missing-art');add('span',card.name,btn,'preview-art-fallback')}
  btn.addEventListener('click',()=>{selectedId=selected?null:card.id;selectedPayments.clear();targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';message=selectedId?'已選取 '+card.name:'已取消選取';render();if(selectedId)setActionTray(true)});
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
  const image=art.get(card.name);
  if(image){const img=document.createElement('img');img.src=image;img.alt=card.name;img.loading='lazy';el.append(img)}
  else add('span',card.name,el);
  const stats=A?.unitStats?.(card);
  add('small',(card.lag?'LAG':'READY')+(stats?' · PWR '+stats.power:''),el);
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
  const el=add('div','',slots,'v3-played-card');el.title=unit.name+'（練習對手，不代表 AI 行動）';
  const src=art.get(unit.name);
  if(src){const img=document.createElement('img');img.src=src;img.alt=unit.name;img.loading='lazy';el.append(img)}
  else add('span',unit.name,el);
  const stats=A?.unitStats?.(unit);
  add('small',(unit.ready?'READY':'SPENT')+' · PWR '+(stats?.power??unit.power),el);
  if(unit.trainingTarget)add('small','練習目標 / 無 AI',el);
 }
}
function paymentOptions(parent){
 const p=state.player;
 const pool=[...p.eddies.filter(c=>c.ready).map(c=>({id:c.id,kind:'eddie',label:'Eddie '+(p.eddies.indexOf(c)+1)})),
 ...p.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({id:c.id,kind:'legend',label:'蓋牌傳奇 '+(p.legends.indexOf(c)+1)}))];
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
function render(){
 hideHandHover();
 const sequence=++renderSequence;
 cancelDeals();
 const deal=pendingDeal;pendingDeal=null;
 const supported=picker.value==='theHeist';
 root.replaceChildren();
 // Preserve setup tools without a site-style toolbar across the top of the room.
 const setup=add('div','',root,'v3-room-setup');
 const deckLabel=add('label','牌組',setup);deckLabel.setAttribute('for','v3RoomDeckSelect');
 const deckSelect=document.createElement('select');
 deckSelect.id='v3RoomDeckSelect';deckSelect.setAttribute('aria-label','切換練習牌組');
 for(const [value,label] of [['theHeist','The Heist'],['embracingPower','Embracing Power（卡圖預覽）']]){
  const opt=document.createElement('option');opt.value=value;opt.textContent=label;deckSelect.append(opt);
 }
 deckSelect.value=picker.value;
 deckSelect.addEventListener('change',()=>{picker.value=deckSelect.value;picker.dispatchEvent(new Event('change',{bubbles:true}))});
 setup.append(deckSelect);
 const tourButton=add('button','桌面導覽',setup,'btn');
 tourButton.type='button';
 tourButton.addEventListener('click',()=>{$('startBoardTour')?.click();setActionTray(false)});
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
 renderHand();bindLiveHandHover();renderField();renderRivalField();
 if(deal)requestAnimationFrame(()=>{if(sequence===renderSequence&&picker.value==='theHeist'&&!$('battle')?.classList.contains('hide'))dealHand(deal)});
 const scenarios=add('div','',root,'v3-turn-actions');
 for(const [mode,label] of [['basic','基礎出牌手牌'],['quick','效果與 Quick 手牌']]){
  const button=add('button',label,scenarios,'btn');button.type='button';button.disabled=scenario===mode;
  button.addEventListener('click',()=>{
   scenario=mode;state=H.fresh(scenario);pendingDeal='all';selectedId=null;selectedPayments.clear();
   targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';
   message='已切換練習手牌。此處預置一張對手單位作為測試目標，並非正式開局。';render();
  });
 }
 const header=add('div','',root,'v3-turn-header');
 add('strong','THE HEIST / ROUND '+state.round,header);add('span',phase(),header);
 add('p','已接入 The Heist 40 張牌組與卡圖。提供兩組固定測試手牌，並預置一張練習對手單位（沒有 AI）。可練習基本出牌、裝備、部分登場效果、Afterparty 與 Floor It；戰鬥及未完成的觸發能力仍不會自動結算。',root,'v3-turn-note');
 const stats=add('div','',root,'v3-turn-stats');
 add('span','手牌 '+p.hand.length+' 張',stats);
 add('span','Eddies '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length,stats);
 add('span','傳奇可支付 '+p.legends.filter(e=>e.ready&&(!e.faceUp||e.sellTag)).length,stats);
 add('span','委託骰 '+p.gigs.length+' 顆',stats);
 add('span','場地單位 '+p.units.length+' 張',stats);
 add('span','棄牌區 '+(p.trash?.length||0)+' 張',stats);
 if(p.pendingRebootOptics)add('span','待觸發戰鬥保護 '+p.pendingRebootOptics+' 次（未實裝戰鬥）',stats);
 const chosen=p.hand.find(c=>c.id===selectedId);
 const details=add('div','',root,'v3-selected-detail');
 if(chosen){add('strong',chosen.name,details);add('p',chosen.type+' · COST '+chosen.cost+' · '+(chosen.sellTag?'有變賣標記':'不可變賣')+(chosen.unimplementedEffect?' · 尚未支援出牌效果':chosen.deferredEffect?' · 可登場／裝備，觸發效果待實作':''),details)}
 else add('p','點選上方手牌以查看操作。',details);
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
    add('p','此牌可在主要階段打出，會記錄本回合下次對手單位戰鬥的保護效果；目前尚未實作戰鬥結算。',area);
    command('支付並打出 Reboot Optics',()=>P.program(state,selectedId,paid,{}),buttons,!affordable);
   }
  }
  command('結束我的回合',()=>P.pass(state),buttons);
 }
 if(!state.finished&&state.turn==='ai')command('略過對手行動，開始下一回合',()=>P.next(state),buttons);
 command('重新開始 The Heist 練習',()=>({ok:true,state:H.fresh(scenario),message:initial}),buttons);
 const status=add('p',message,root,'v3-turn-feedback');status.setAttribute('role','status');
 const summary=add('div','',root,'v3-turn-log');add('strong','實際練習狀態',summary);
 add('p','場地：'+(p.units.map(c=>c.name+'（'+(c.ready?'Ready':'Spent')+(c.lag?' / Lag':'')+'）').join('、')||'無'),summary);
 add('p','委託骰：'+(p.gigs.map(d=>'d'+d.sides+'='+d.value).join('、')||'無'),summary);
 add('p','棄牌區：'+((p.trash||[]).map(c=>c.name).join('、')||'無'),summary);
 add('p','對手練習單位：'+(state.ai.units.map(u=>u.name+'（'+(u.ready?'Ready':'Spent')+'，PWR '+(A?.unitStats?.(u)?.power??u.power)+'）').join('、')||'無'),summary);
 indicator('.turn-info','THE HEIST：'+phase());
 indicator('.player-eddies','Eddies 就緒 '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length);
 indicator('.player-gigs',p.gigs.length+' 顆委託骰');
 indicator('.player-field',p.units.length+' 張實際單位');
 indicator('.player-deck','練習牌庫：'+p.deck.length+' 張');
 if($('battlePreviewStatus'))$('battlePreviewStatus').textContent='The Heist 實際牌組操作練習。選取手牌後在下方指定支付資源；未支援的特殊能力仍不會自動結算。';
}
const shuffleButton=$('redrawBattleHand'),legendButton=$('toggleBattleLegends');
function syncDeck(){
 if(picker.value==='theHeist'){
  scenario='basic';state=H.fresh(scenario);pendingDeal=$('battle')?.classList.contains('hide')?null:'all';selectedId=null;selectedPayments.clear();targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';message=initial;
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
 if(!visible){entryDealt=false;cancelDeals();return}
 if(entryDealt||picker.value!=='theHeist')return;
 entryDealt=true;
 requestAnimationFrame(()=>{if(!battlePage.classList.contains('hide')&&picker.value==='theHeist')dealHand('all')});
}
if(battlePage&&typeof MutationObserver!=='undefined'){
 new MutationObserver(dealOnEntry).observe(battlePage,{attributes:true,attributeFilter:['class']});
 dealOnEntry();
}
})();
