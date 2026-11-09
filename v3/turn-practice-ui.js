/* V3 Heist tabletop: resources, reactions and verified pending effect choices. */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.NCTV3TurnPractice,H=window.NCTV3Heist,A=window.NCTV3Actions,G=window.NCTV3Guide,D=window.NCTV3Dice,C=window.NCTV3Combat,E=window.NCTV3Effects;
const root=$('v3TurnPractice'),board=$('battleTour'),picker=$('battleDeckChoice');
if(!root||!board||!P||!H||!G||!D||!C||!E||!picker)return;
const isPracticeDeck=()=>['theHeist','embracingPower'].includes(picker.value);
const deckName=()=>picker.value==='embracingPower'?'Embracing Power':'The Heist';
const freshPractice=(mode,opts)=>picker.value==='embracingPower'?window.NCTV3Embracing.fresh('random',{...opts,aiMode:'mirror'}):H.fresh(mode,opts);
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
if(phaseZone)phaseZone.append(tableControls);else board.append(tableControls);
for(const prefix of ['player','opponent']){
 const legends=board.querySelector('.'+prefix+'-legends'),resources=board.querySelector('.'+prefix+'-eddies');
 const row=document.createElement('div');row.className='v3-legend-layout';
 resources.setAttribute('role','group');resources.setAttribute('aria-label',prefix==='player'?'我方付款資源':'對手 Eddies');
 row.append(legends.querySelector('.cardbacks'),resources);legends.append(row);
 const trash=document.createElement('div');trash.className='preview-zone '+prefix+'-trash';
 trash.style.gridArea=prefix==='player'?'p-trash':'opp-trash';
 const label=document.createElement('small');label.textContent=(prefix==='player'?'PLAYER':'OPPONENT')+' / TRASH';trash.append(label);
 board.querySelector('.table-preview').append(trash);
}
const table=board.querySelector('.table-preview');
function newZone(cls,label,area){const zone=document.createElement('section');zone.className='preview-zone '+cls;zone.style.gridArea=area;const heading=document.createElement('small');heading.textContent=label;zone.append(heading);table.append(zone);return zone;}
const phasePanel=newZone('v3-phase-panel','回合狀態','phase');
const ownerLabel=document.createElement('strong'),phaseLabel=document.createElement('span');phasePanel.append(ownerLabel,phaseLabel);
const roomPanel=newZone('v3-room-panel','ROOM / 對局','room');
const roomDescription=document.createElement('p');roomDescription.textContent=deckName()+' · 單人鏡像練習';roomPanel.append(roomDescription);
const roomButtons=document.createElement('div');roomButtons.className='v3-room-buttons';roomPanel.append(roomButtons);
const leaveButton=$('leaveBattleScreen');if(leaveButton)roomButtons.append(leaveButton);
const historyPanel=newZone('v3-history-panel','行動紀錄','history');
const historyList=document.createElement('div');historyList.className='v3-history-list';historyList.setAttribute('role','log');historyList.setAttribute('aria-label','本局行動紀錄');historyList.setAttribute('aria-live','off');historyPanel.append(historyList);
const sidebar=document.createElement('aside');sidebar.className='v3-sidebar';sidebar.setAttribute('aria-label','對局控制與紀錄');
const guideDock=document.createElement('div');guideDock.className='v3-guide-dock';
sidebar.append(roomPanel,historyPanel);if(phaseZone)sidebar.append(phaseZone);sidebar.append(guideDock);table.append(sidebar);

for(const prefix of ['player','opponent']){board.querySelector('.'+prefix+'-deck>small').textContent=prefix==='player'?'我的牌庫':'對手牌庫';board.querySelector('.'+prefix+'-trash>small').textContent=prefix==='player'?'我的棄牌':'對手棄牌';}
let actionHistory=[],historyVersion=0,shownHistoryVersion=-1;
function publicActionText(text,previous){return previous.turn==='ai'?(text||'').replace(/變賣 [^，；]+，獲得/g,'變賣一張蓋牌，獲得'):(text||'');}
function rememberAction(result,previous){
 if(!result.ok||result.state===previous)return;
 if(result.state.phase==='pregame'&&result.message===initial){actionHistory=[];historyVersion++;}
 if(!result.message||result.message===initial)return;
 const actor=previous.phase==='pregame'?'開局':previous.turn==='ai'?'對手':'我方';
 for(const text of publicActionText(result.message,previous).split('；').map(t=>t.trim()).filter(Boolean))actionHistory.push({round:previous.round,actor,text});
 actionHistory=actionHistory.slice(-80);historyVersion++;
}
function renderBoardInformation(){
 ownerLabel.textContent=state.finished?'對局結束':state.phase==='pregame'?'設定開局':state.phase==='react'?'防守反應':state.turn==='ai'?'等待對手':'你的回合';
 phasePanel.dataset.owner=state.finished?'finished':state.phase==='pregame'?'setup':state.turn;
 phaseLabel.textContent=state.phase==='pregame'?'SETUP':'ROUND '+state.round+' · '+phase();
 roomPanel.querySelector(':scope > small').textContent='ROOM / '+(opponentMode==='mirror'?deckName():'固定腳本');
 roomDescription.textContent=deckName()+' · '+(opponentMode==='mirror'?'鏡像對手':'固定腳本練習');
 if(shownHistoryVersion!==historyVersion){
  const bottom=historyList.scrollHeight-historyList.scrollTop-historyList.clientHeight<40,oldScroll=historyList.scrollTop;historyList.replaceChildren();
  if(!actionHistory.length)add('p','完成開局後，這裡會依序記錄雙方行動。',historyList,'v3-history-empty');
  let group=null,groupKey=null;for(const event of actionHistory){const key=event.round+':'+event.actor;if(key!==groupKey){group=add('article','',historyList);group.dataset.actor=event.actor;add('small','ROUND '+event.round+' · '+event.actor,group);groupKey=key;}add('p',event.text,group);}
  historyList.scrollTop=bottom?historyList.scrollHeight:oldScroll;shownHistoryVersion=historyVersion;
 }
}
const contextActions=document.createElement('section');contextActions.id='v3CardActions';contextActions.className='v3-card-actions';contextActions.hidden=true;contextActions.setAttribute('aria-label','選取卡牌操作');board.append(contextActions);
const guideRoot=document.createElement('aside');guideRoot.id='v3TableGuide';guideRoot.className='v3-live-guide';guideRoot.hidden=true;
guideRoot.setAttribute('aria-label','桌面操作引導');board.append(guideRoot);
let guideAnchor=null;
function positionGuide(){
 if(guideRoot.hidden||!guideAnchor?.isConnected)return;
 const gap=14,pad=12,w=guideRoot.offsetWidth,h=guideRoot.offsetHeight,a=guideAnchor.getBoundingClientRect();
 const clamp=(v,max)=>Math.max(pad,Math.min(v,Math.max(pad,max)));
 const blocks=[...board.querySelectorAll('.player-hand,.opponent-hand,.player-legends,.opponent-legends,.v3-played-card,#v3TableControls,#v3CardActions,.player-fixer,.player-gigs,.v3-phase-panel,.v3-room-panel')].map(el=>el.getBoundingClientRect());
 blocks.push(a);
 const historyRect=historyPanel.getBoundingClientRect();
 const candidates=[[historyRect.left+6,historyRect.top+6],[a.right+gap,a.top],[a.left-w-gap,a.top],[a.left,a.top-h-gap],[a.left,a.bottom+gap]];
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
 if(!isPracticeDeck())return;
 event.stopImmediatePropagation();guidanceOn=true;guideIntro=0;setActionTray(false);render();
},true);
// Activating a highlighted tour region must also dismiss the action tray.
board.addEventListener('click',event=>{
 if(event.target.closest('[data-tour-zone]')&&!event.target.closest('#v3TurnPractice'))setActionTray(false);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('is-open'))setActionTray(false)});

const initial='先選擇開局方式，再擲骰決定先後攻。';
let scenario='random',defensePreset='none',opponentMode='mirror',state=freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),selectedId=null,selectedPayments=new Set(),targetId=null,gigId=null,gigSide='player',gigDelta=0,rivalUnitId=null,defeatGearId=null,defeatGearSide='player',message=initial;
// Card-deal motion uses transient visual clones; actual hand/game state never animates or changes.
let guidanceOn=true,guideIntro=0,guideMinimized=false,opponentTimer=null,selectedDie=4;
let confirmConcede=false;
let paymentAction=null,draggedCardId=null;
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
   if(!--remaining){layer.remove();scheduleOpponent();}
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
let publicPreviewAnchor=null;
let previewId=null,leaveTimer=null,previewLoad=0,hoverPending=null,hoverPendingId=null;
let raisedHandId=null;
const hoverImageCache=new Map();
function hideHandHover(){
 publicPreviewAnchor=null;
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
 if(publicPreviewAnchor){
  const r=publicPreviewAnchor.getBoundingClientRect(),w=hover.offsetWidth,h=hover.offsetHeight;
  let left=r.right+12;if(left+w>innerWidth-12)left=r.left-w-12;
  hover.style.left=Math.max(12,Math.min(innerWidth-w-12,left))+'px';
  hover.style.top=Math.max(12,Math.min(innerHeight-h-12,r.top))+'px';return;
 }
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
 if(!rail||!isPracticeDeck()||board.closest('.hide'))return null;
 const r=rail.getBoundingClientRect();
 if(x<r.left||x>r.right||y>r.bottom)return null;
 if(y<r.top){const raised=document.elementFromPoint(x,y)?.closest('.hand-card.is-hand-hover');return raised&&rail.contains(raised)?state.player.hand.find(c=>c.id===raised.dataset.cardId)||null:null;}
 // Hit regions follow the original fan slots, independent of the raised card.
 // A painted card may overlap the next slot; only pointer movement changes selection.
 const hit=document.elementFromPoint(x,y);
 if(!hit||!rail.contains(hit))return null;
 const nodes=[...rail.querySelectorAll('.hand-card[data-card-id]')];
 const node=nodes.findLast(el=>{const box=el.getBoundingClientRect(),lift=el.classList.contains('is-hand-hover')?parseFloat(getComputedStyle(el).getPropertyValue('--v3-hand-hover-lift'))||0:0;return x>=box.left&&x<=box.right&&y>=box.top+lift&&y<=box.bottom+lift});
 if(!node)return null;
 return state.player.hand.find(c=>c.id===node.dataset.cardId)||null;
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
function showHandHover(card,anchor=null){
 if(!card||!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
 if(previewId===card.id&&!hover.hidden)return;
 if(anchor){hideHandHover();publicPreviewAnchor=anchor;}
 // Raise the inspected hand face without changing its stable pointer slots.
 raisedHandId=anchor?null:card.id;
 board.querySelectorAll('.player-hand .hand-card').forEach(el=>el.classList.toggle('is-hand-hover',el.dataset.cardId===raisedHandId));
 const token=++previewLoad;
 previewId=card.id;
 const name=card.name,image=art.get(name);
 hoverInfo.replaceChildren();
 const heading=document.createElement('strong');
 heading.textContent=name;heading.style.cssText='display:block;font-size:17px;color:#29ffff;margin-bottom:12px;';
 hoverInfo.append(heading);
 const reference=window.NCTV3CardReference?.[card.name];
 const detail=document.createElement('p');
 detail.textContent=(card.type||reference?.type||'卡牌')+' · COST '+(card.cost??reference?.cost??'—')+(card.sellTag?' · SELL TAG':'');
 detail.style.margin='0 0 14px';hoverInfo.append(detail);
 const note=document.createElement('p');note.className='v3-card-ability';
 note.textContent=reference?.abilityZh||reference?.abilityEnglish||'尚未載入此卡能力文字，請查看卡面。';
 note.style.cssText='margin:0;color:#e2edf0';hoverInfo.append(note);
 if(card.gear?.length){const gear=document.createElement('p');gear.textContent='裝備：'+card.gear.map(g=>g.name+' — '+(window.NCTV3CardReference?.[g.name]?.abilityZh||'')).join('；');hoverInfo.append(gear);}
 if(card.unimplementedEffect){const warning=document.createElement('p');warning.textContent='此卡能力尚未支援，無法打出。';hoverInfo.append(warning);}

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
function openPublicCard(card){
 hideHandHover();const dialog=$('battleCardDialog'),ref=window.NCTV3CardReference?.[card.name],src=art.get(card.name);
 if(!dialog?.showModal)return;
 $('battleCardTitle').textContent=window.NCTLocale?.cardName(card.name)||card.name;
 $('battleCardEnglish').textContent=card.name;
 const img=$('battleCardFullImage');img.hidden=!src;if(src){img.src=src;img.alt=card.name;}
 $('battleCardNoImage').hidden=Boolean(src);
 let ability=$('v3PublicCardAbility');if(!ability){ability=document.createElement('p');ability.id='v3PublicCardAbility';img.after(ability);dialog.addEventListener('close',()=>{ability.hidden=true});}
 ability.hidden=false;ability.textContent=ref?.abilityZh||ref?.abilityEnglish||'尚未載入此卡能力文字，請查看卡面。';
 dialog.showModal();
}
function bindPublicPreview(node,card){
 node.classList.add('v3-public-card');
 node.addEventListener('pointerenter',()=>showHandHover(card,node));
 node.addEventListener('pointerleave',hideHandHover);
 node.addEventListener('focus',()=>{if(node.matches(':focus-visible'))showHandHover(card,node)});
 node.addEventListener('blur',hideHandHover);
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
 b.addEventListener('click',()=>{const previous=state;const wasPregame=state.phase==='pregame';const before=new Set(state.player.hand.map(c=>c.id));const r=fn();rememberAction(r,previous);message=r.ok?publicActionText(r.message,previous):r.reason;if(r.ok){state=r.state;D.transition(previous,state);if(wasPregame&&state.phase!=='pregame')pendingDeal='all';selectedPayments.clear();paymentAction=null;if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;const added=state.player.hand.map(c=>c.id).filter(id=>!before.has(id));if(added.length)pendingDeal=added;if(state.player.hand.length===6&&r.message===initial)pendingDeal='all';}render()});return b;
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
  selectedPayments.clear();paymentAction=null;targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';
  message=selectedId?'已選取 '+card.name:'已取消選取';render();setActionTray(false);
 };
 if(state.phase==='pregame')return;
 state.player.hand.forEach((card,i)=>{
  const btn=document.createElement('button');btn.type='button';btn.draggable=true;btn.className='preview-art-card hand-card';btn.dataset.cardName=card.name;btn.dataset.cardId=card.id;btn.dataset.handIndex=String(i);btn.style.setProperty('--v3-hand-order',String(i+1));
  const selected=selectedId===card.id;btn.classList.toggle('is-selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
  btn.setAttribute('aria-label','選取 '+card.name+'，費用 '+card.cost+(card.sellTag?'，可變賣':''));
  btn.title=card.name;
  const src=art.get(card.name);
  if(src){const image=document.createElement('img');image.src=src;image.alt=card.name+' 卡面';image.loading='lazy';image.decoding='async';image.draggable=false;btn.append(image)}
  else{btn.classList.add('missing-art');add('span',card.name,btn,'preview-art-fallback')}

  rail.append(btn);
 });
 sizeHandRail(rail);
}
function sizeHandRail(rail){
 if(!rail)return;
 const nodes=[...rail.querySelectorAll('.preview-art-card')],width=rail.clientWidth,height=rail.clientHeight;
 if(nodes.length&&width){
  const h=Math.max(40,Math.min(Math.max(56,height),(width-Math.max(0,nodes.length-1)*12)*7/5)),w=h*5/7;
  const overlap=Math.min(w-12,Math.max(0,(w*nodes.length-width)/Math.max(1,nodes.length-1)));
  rail.style.setProperty('--preview-stack-overlap',Math.max(0,overlap).toFixed(2)+'px');
  nodes.forEach((el,i)=>{el.style.setProperty('--v3-hand-order',String(i+1));el.style.height=h+'px';el.style.width=w+'px';el.style.zIndex=String(i+1)});
 }
}
function fitHandRails(){
 for(const rail of board.querySelectorAll('.player-field .field-slots,.opponent-field .field-slots')){
  const side=Math.max(24,Math.min(280,rail.clientHeight-24));for(const card of rail.querySelectorAll('.v3-played-card')){const spent=card.classList.contains('is-unit-spent');card.style.height=((spent?side*5/7:side)+20)+'px';card.style.width=(spent?side:side*5/7)+'px';}
 }
 for(const rail of board.querySelectorAll('.player-hand .hand-placeholder,.opponent-hand .preview-card-rail'))sizeHandRail(rail);
 for(const pool of board.querySelectorAll('.v3-eddie-tokens')){
  const count=pool.querySelectorAll('.v3-eddie-slot').length,columns=Math.min(count||1,Math.max(1,Math.floor((pool.clientWidth+2)/72)));
  const h=Math.max(44,Math.min(100,pool.clientHeight-6,(pool.clientWidth-6-(columns-1)*8)/columns)),short=Math.max(44,h*878/1331);
  for(const slot of pool.querySelectorAll('.v3-eddie-slot')){slot.style.width=h+'px';slot.style.height=h+'px';const card=slot.querySelector('button'),spent=card.classList.contains('is-spent');card.style.width=(spent?h:short)+'px';card.style.height=(spent?short:h)+'px';}
  pool.scrollTop=Number(pool.dataset.scrollTop)||0;
 }
 for(const rail of board.querySelectorAll('.v3-legend-layout>.cardbacks')){
  const slots=[...rail.querySelectorAll('.v3-legend-slot')];if(!slots.length)continue;
  const h=Math.max(36,Math.min(160,rail.clientHeight-6,(rail.clientWidth-6)/(1+(slots.length-1)*.66)));
  for(const [index,slot] of slots.entries()){slot.style.marginLeft=index?(-h*.34)+'px':'0px';slot.style.zIndex=String(index+1);slot.style.width=h+'px';slot.style.height=h+'px';const card=slot.querySelector('button'),spent=card.classList.contains('is-legend-spent');card.style.width=(spent?h:h*5/7)+'px';card.style.setProperty('height',(spent?h*5/7:h)+'px','important');}
 }
}
function sellDropReason(card){
 if(state.finished)return '本局已結束';
 if(E.pending(state))return '請先完成待結算能力';
 if(state.turn!=='player'||state.phase!=='main')return '只能在自己的主要階段變賣';
 if(state.player.soldThisTurn)return '本回合已變賣一次';
 if(!card?.sellTag)return '這張手牌沒有變賣標記';
 return '';
}
function clearSellDrag(){
 draggedCardId=null;board.querySelectorAll('.is-sell-target,.is-sell-unavailable').forEach(e=>{e.classList.remove('is-sell-target','is-sell-unavailable');delete e.dataset.dropHint});
}
board.addEventListener('dragstart',event=>{
 const source=event.target.closest('.player-hand .hand-card');if(!source||!event.dataTransfer)return;
 const card=liveHandAt(event.clientX,event.clientY)||state.player.hand.find(c=>c.id===source.dataset.cardId);if(!card)return;
 draggedCardId=card.id;hideHandHover();event.dataTransfer.setData('application/x-nct-hand-card',card.id);event.dataTransfer.effectAllowed='move';
 const zone=board.querySelector('.player-eddies'),reason=sellDropReason(card);zone.classList.add(reason?'is-sell-unavailable':'is-sell-target');zone.dataset.dropHint=reason||'放開以變賣 · 獲得 1 €$';
});
board.addEventListener('dragover',event=>{if(draggedCardId&&event.target.closest('.player-eddies')){event.preventDefault();event.dataTransfer.dropEffect='move';}});
board.addEventListener('drop',event=>{
 if(!draggedCardId||!event.target.closest('.player-eddies'))return;
 event.preventDefault();const id=event.dataTransfer?.getData('application/x-nct-hand-card');if(id!==draggedCardId){clearSellDrag();return;}
 const reason=sellDropReason(state.player.hand.find(c=>c.id===id));clearSellDrag();runTableCommand(()=>reason?{ok:false,reason}:P.sell(state,id));
});
board.addEventListener('dragend',clearSellDrag);
window.addEventListener('resize',()=>requestAnimationFrame(()=>{fitHandRails();positionContextActions()}));

function renderField(){
 const slots=board.querySelector('.player-field .field-slots');if(!slots)return;
 slots.replaceChildren();
 for(const card of state.player.units){
  const el=add('button','',slots,'v3-played-card');el.type='button';el.title=card.name+' / '+(card.lag&&!card.goSolo?'Lag':card.ready?'Ready':'Spent');el.classList.toggle('is-unit-spent',!card.ready);el.dataset.ready=String(card.ready);
  el.classList.toggle('is-table-selected',attackUnitId===card.id);el.classList.toggle('is-gear-target',paymentAction==='gear-target');
  el.addEventListener('click',()=>{
   if(E.pending(state)){message='請先在能力選擇框完成待結算能力。';render();return;}
   if(state.phase==='react'&&state.pendingAttack?.defendingSide==='player'){runTableCommand(()=>P.defend(state,{kind:'block',blockerId:card.id}));return;}
   const selected=state.player.hand.find(c=>c.id===selectedId);
   if(selected?.type==='Gear'){
    if(paymentAction!=='gear-target'){message='請先完成付款，再按「選擇裝備目標」。';render();return;}
    const payments=chosenPayments(selected.cost);
    runTableCommand(()=>P.gear(state,selected.id,payments||[],card.id));
    return;
   }
   selectedPayments.clear();paymentAction=null;selectedLegendId=null;
   attackUnitId=attackUnitId===card.id?null:card.id;
   modeOnTable=attackUnitId?'attack':null;selectedId=null;render();
  });
  bindPublicPreview(el,card);
  const image=art.get(card.name);
  if(image){const img=document.createElement('img');img.src=image;img.alt=card.name;img.loading='lazy';el.append(img)}
  else add('span',card.name,el);
  const stats=A?.unitStats?.(card);
  add('small',(card.lag&&!card.goSolo?'LAG':card.ready?'READY':'SPENT')+(stats?' · PWR '+stats.power:''),el,'v3-unit-status');
  if(stats?.blocker){el.dataset.blocker='true';el.title+=' · BLOCKER（可攔截）';}
  if(card.gear?.length){const tag=add('span','裝備 ×'+card.gear.length,el,'v3-gear-count');tag.title=card.gear.map(g=>g.name).join('、');}
  if(card.deferredEffect)add('small','特殊效果：待對戰系統',el);
 }
 if(!state.player.units.length)add('div','尚無已打出的單位',slots);
}
function renderRivalField(){
 const slots=board.querySelector('.opponent-field .field-slots');if(!slots)return;
 slots.replaceChildren();
 for(const unit of state.ai.units){
  const legalTarget=attackUnitId&&state.phase==='main'&&G.targets(state,state.player.units.find(u=>u.id===attackUnitId)).units.includes(unit.id);
  const el=add('button','',slots,'v3-played-card');el.type='button';el.classList.toggle('is-unit-spent',!unit.ready);el.dataset.ready=String(unit.ready);el.title=unit.name+(state.ai.practiceBot?.kind==='mirror-the-heist'?'（鏡像對手）':'（練習對手，非 AI 行動）');
  el.addEventListener('click',()=>{if(legalTarget)runTableAttack({kind:'unit',defenderId:unit.id});else openPublicCard(unit)});
  if(unit.gear?.length){el.title+=' · 裝備：'+unit.gear.map(g=>g.name).join('、');el.setAttribute('aria-label',el.title);const tag=add('span','裝備 ×'+unit.gear.length,el,'v3-gear-count');tag.title=unit.gear.map(g=>g.name).join('、');}
  bindPublicPreview(el,unit);el.classList.toggle('v3-attackable',Boolean(legalTarget));
  const src=art.get(unit.name);
  if(src){const img=document.createElement('img');img.src=src;img.alt=unit.name;img.loading='lazy';el.append(img)}
  else add('span',unit.name,el);
  const stats=A?.unitStats?.(unit);
  add('small',(unit.ready?'READY':'SPENT')+' · PWR '+(stats?.power??unit.power),el,'v3-unit-status');
  if(unit.trainingTarget)el.title+=' · 固定練習目標';
 }
}
function paymentContext(){
 if(state.finished||confirmConcede||E.pending(state)||!((state.turn==='player'&&state.phase==='main')||(state.phase==='react'&&state.pendingAttack?.defendingSide==='player')))return null;
 const card=state.player.hand.find(c=>c.id===selectedId);
 if(card&&!card.unimplementedEffect&&(state.phase==='main'||C.quicks(state).some(c=>c.id===card.id)))return {cost:card.cost,selecting:paymentAction!=='gear-target'};
 const legend=state.player.legends.find(l=>l.id===selectedLegendId);
 if(legend&&['call','solo'].includes(paymentAction))return {cost:paymentAction==='call'?1:legend.cost,selecting:true};
 return null;
}
function togglePayment(kind,id){
 const context=paymentContext(),key=kind+':'+id;
 if(!context?.selecting||!G.sources(state).some(s=>s.kind===kind&&s.id===id))return;
 if(selectedPayments.has(key))selectedPayments.delete(key);else selectedPayments.add(key);
 render();
}
function localTableButton(label,fn,disabled=false){
 const b=add('button',label,tableControls,'v3-table-btn');b.type='button';b.disabled=disabled;b.onclick=fn;return b;
}
function paymentOptions(parent){
 if(parent===tableControls){
  const context=paymentContext();if(!context)return [];
  const area=add('div','',parent,'v3-payment-summary');
  const progress=add('strong','付款 '+selectedPayments.size+' / '+context.cost+' €$',area,'v3-payment-total');progress.setAttribute('role','status');
  add('span',context.selecting?'直接點選桌上就緒的傳奇或 Eddies；再次點擊可取消。確認前不會消耗資源。':'付款已選好，點選高亮的友方單位或正面傳奇裝備。',area);
  if(paymentAction==='call'||paymentAction==='solo')localTableButton('取消付款',()=>{paymentAction=null;selectedPayments.clear();render()});
  return G.sources(state);
 }

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
 rememberAction(result,previous);
 message=result.ok?publicActionText(result.message,previous):result.reason;
 if(result.ok){
  const wasPregame=state.phase==='pregame';state=result.state;D.transition(previous,state);
  if(wasPregame&&state.phase!=='pregame')pendingDeal='all';
  const added=state.player.hand.filter(c=>!before.has(c.id)).map(c=>c.id);
  if(added.length)pendingDeal=added;
  selectedPayments.clear();paymentAction=null;
  if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;
  if(!state.player.legends.some(c=>c.id===selectedLegendId)||state.phase==='start'||(state.turn!=='player'&&state.phase!=='react'))selectedLegendId=null;
  attackUnitId=null;modeOnTable=null;
 }
 render();
}
function tableButton(label,fn,disabled=false){
 const b=add('button',label,tableControls,'v3-table-btn');b.type='button';b.disabled=disabled;b.classList.toggle('v3-action-primary',/^(重置資源|抽 1 張|擲骰|變賣|打出單位|使用 |裝備至|呼叫傳奇|Go Solo|攻擊|結束回合|結束反應|確認|重新開局)/.test(label));
 b.addEventListener('click',()=>runTableCommand(fn));return b;
}
function chosenPayments(cost){
 const sources=G.sources(state).filter(c=>selectedPayments.has(c.kind+':'+c.id));
 return sources.length===cost?sources.map(({kind,id})=>({kind,id})):null;
}
function scheduleOpponent(){
 if(opponentTimer!==null){clearTimeout(opponentTimer);opponentTimer=null;}
 if(confirmConcede||E.pending(state)||state.phase!=='opponent'||state.step!=='pendingBot'||!isPracticeDeck()||state.finished||state.turn!=='ai'||state.ai.practiceBot?.kind!=='mirror-the-heist')return;
 const snapshot=state;
 opponentTimer=setTimeout(()=>{
  opponentTimer=null;
  if(state!==snapshot||!isPracticeDeck())return;
  const die=state.ai.fixer.find(d=>d!==20)??state.ai.fixer[0];
  runTableCommand(()=>P.opponentTurn(state,die?Math.floor(Math.random()*die)+1:null));
 },900);
}
const coachSteps=[
 {zone:'.player-fixer',title:'先重置、抽牌，再選骰子',text:'先在回合狀態區按「重置資源」，再到牌庫按「抽 1 張」。輪到擲骰時，可直接點黃色框內的一顆骰子，再按同區的「擲骰」；d20 必須留到最後。關閉引導不會跳過準備階段。'},
 {zone:'.player-hand',title:'直接點選手牌',text:'點一下手牌即可選取，卡牌旁會出現出牌／變賣操作。有變賣標記的牌可按「變賣」，取得一張 Eddie。'},
 {zone:'.player-eddies',title:'直接點桌上的資源付款',text:'Eddies 區只放變賣得到的卡牌。選取要打出的手牌後，直接點桌上就緒的傳奇或 Eddie 付款，再確認出牌；確認前不會消耗。手牌也能拖到 Eddies 區變賣。'},
 {zone:'#v3TableControls',title:'現在跟著提示完成回合',text:'操作直接放在卡牌與場地旁，右側保留回合及結果。先依序重置、抽牌、擲骰，再選手牌出牌。按「結束回合」後，鏡像對手會自動行動。'}
];
function renderGuide(){
 board.querySelectorAll('.v3-guide-active').forEach(el=>el.classList.remove('v3-guide-active'));
 guideRoot.replaceChildren();guideRoot.hidden=true;guideAnchor=null;
 if(!isPracticeDeck()||state.phase==='pregame')return;
 const reopen=add('button',guidanceOn?'重新看桌面說明':'開啟桌面引導',tableControls,'v3-table-btn');reopen.type='button';
 reopen.addEventListener('click',()=>{guidanceOn=true;guideIntro=0;render()});
 if(!guidanceOn)return;
 document.getElementById('closeBoardTour')?.click();
 const h=G.next(state,{selectedId,payments:[...selectedPayments],attackUnitId,selectedLegendId,paymentAction});
 guideRoot.hidden=false;guideRoot.dataset.step=h.key;
 guideRoot.classList.toggle('is-minimized',guideMinimized);
 const header=add('div','',guideRoot,'v3-coach-header');
 const stepLabel=add('small','',header,'v3-coach-step');
 const tools=add('div','',header,'v3-coach-tools');
 const minimize=add('button','',tools,'v3-coach-minimize');minimize.dataset.icon=guideMinimized?'plus':'minus';minimize.setAttribute('aria-label',guideMinimized?'展開提示':'收合提示');minimize.title=guideMinimized?'展開提示':'收合提示';minimize.type='button';minimize.setAttribute('aria-expanded',String(!guideMinimized));
 minimize.onclick=()=>{guideMinimized=!guideMinimized;guideRoot.classList.toggle('is-minimized',guideMinimized);minimize.dataset.icon=guideMinimized?'plus':'minus';minimize.setAttribute('aria-label',guideMinimized?'展開提示':'收合提示');minimize.title=guideMinimized?'展開提示':'收合提示';minimize.setAttribute('aria-expanded',String(!guideMinimized));positionGuide()};
 const close=add('button','',tools,'v3-coach-close');close.type='button';close.setAttribute('aria-label','關閉桌面引導');
 close.addEventListener('click',()=>{guidanceOn=false;render()});
 const mark=el=>el?.classList.add('v3-guide-active');
 if(!state.finished&&guideIntro<coachSteps.length&&state.phase!=='react'&&!E.pending(state)){
  const step=coachSteps[guideIntro];guideRoot.dataset.mode='tour';
  stepLabel.textContent='桌面操作 '+(guideIntro+1)+' / '+coachSteps.length;
  add('strong',step.title,guideRoot);add('p',step.text,guideRoot);
  add('p','查看標示的桌面區域，再選擇「下一步」。',guideRoot,'v3-guide-action');
  guideAnchor=board.querySelector(step.zone);mark(guideAnchor);
  const actions=add('div','',guideRoot,'v3-coach-actions');
  if(guideIntro>0){const back=add('button','上一步',actions,'btn');back.type='button';back.addEventListener('click',()=>{guideIntro--;render()});}
  const next=add('button',guideIntro===coachSteps.length-1?'開始實戰':'下一步 →',actions,'btn');next.type='button';next.addEventListener('click',()=>{guideIntro++;render()});
  const skip=add('button','略過說明，直接操作',guideRoot,'v3-coach-skip');skip.type='button';skip.addEventListener('click',()=>{guideIntro=coachSteps.length;render()});
 }else{
  guideRoot.dataset.mode='live';
  stepLabel.textContent='實戰引導 '+String(h.stage).padStart(2,'0')+' / 06';
  const stageNames=['','開局設定','準備回合','變賣與支付','出牌與能力','攻擊與反應','回合交接'];
  add('strong',stageNames[h.stage],guideRoot);
  if(state.phase==='start'){const preparation={ready:'1 / 3 · 重置資源',draw:'2 / 3 · 抽牌',roll:'3 / 3 · 選骰與擲骰'};add('span',preparation[state.step],guideRoot,'v3-guide-substep');}
  const text=add('p',h.text,guideRoot,'v3-guide-action');text.setAttribute('role','status');text.setAttribute('aria-live','polite');
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
  if(paymentContext()?.selecting)board.querySelectorAll('.is-payment-available').forEach(mark);
  if(h.key==='attack')board.querySelectorAll('.player-field .v3-played-card').forEach((el,i)=>{const t=G.targets(state,state.player.units[i]);if(t.units.length||t.gigs)mark(el)});
  if(h.key==='target'){
   const targets=G.targets(state,state.player.units.find(u=>u.id===attackUnitId));
   board.querySelectorAll('.opponent-field .v3-played-card').forEach((el,i)=>{if(targets.units.includes(state.ai.units[i].id))mark(el)});
   if(targets.gigs)mark(board.querySelector('.opponent-gigs'));
  }
  const label={ready:'重置資源',draw:'抽 1 張',roll:'擲骰',sell:'變賣',play:'打出單位',end:'結束回合'}[h.key];
  if(label)for(const button of tableControls.querySelectorAll('button'))if(button.textContent===label&&!button.disabled)mark(button);
  const zones={effect:'#v3CardActions',legend:'.player-legends','legend-payment':'.player-legends',defense:'#v3CardActions',ready:'.v3-phase-panel',draw:'.player-deck',roll:'.player-fixer','select-sale':'.player-hand',sell:'.player-hand','select-unit':'.player-hand',payment:'.player-eddies',play:'#v3CardActions',attack:'.player-field',target:'.opponent-field',opponent:'.opponent-field'};
  guideAnchor=board.querySelector(zones[h.key]||'#v3TableControls');mark(guideAnchor);
 }
 if(guideAnchor)guideAnchor.querySelectorAll('button.v3-table-btn.v3-guide-active').forEach(b=>b.classList.remove('v3-guide-active'));
 const glossary=add('details','',guideRoot,'v3-guide-glossary');add('summary','規則與名詞',glossary);
 const glossaryText={2:'每回合依序重置、抽牌、選擇一顆合事佬骰；d20 必須留到最後。',3:'每回合最多變賣一張有變賣標記的手牌。每張就緒 Eddie 或合法傳奇資源可支付 1 €$。',4:'單位通常有 Lag；裝備可附在友方單位或正面傳奇。選取卡牌後，在卡牌旁確認操作。',5:'先選己方就緒且可攻擊的單位，再指定合法目標。防守方可依時機使用已支援的 Quick、Blocker 或呼叫傳奇。',6:'結束回合後，鏡像對手會自動行動；需要你防守或選擇能力時會暫停。'};
 add('p',glossaryText[h.stage]||'看完桌面說明後，可依實戰引導直接操作。關閉提示不會改變遊戲狀態。',glossary);glossary.addEventListener('toggle',positionGuide);
 const source=add('a','官方 Comprehensive Rules',glossary);source.href='https://cyberpunktcg.com/comprehensive-rules';source.target='_blank';source.rel='noopener noreferrer';
 requestAnimationFrame(positionGuide);
}

function runTableAttack(attack){
 if(!attackUnitId)return;
 if(state.ai.practiceBot?.kind==='mirror-the-heist'){runTableCommand(()=>P.reactAttack(state,attackUnitId,attack));return;}
 const blockers=state.ai.practiceBot?.kind==='mirror-the-heist'?[]:state.ai.units.filter(u=>u.ready&&A.unitStats(u).blocker);
 // Choosing a defender response remains explicit in the compact phase controls.
 let reaction={kind:'pass'};
 if(blockers.length){
  const chosen=board.querySelector('[data-table-blocker]')?.value;
  if(!chosen){message='請先選擇對手是否使用 Blocker';render();return}
  reaction=chosen==='pass'?{kind:'pass'}:{kind:'block',blockerId:chosen};
 }
 const quick=board.querySelector('[data-table-quick]');
 if(quick)reaction.quick=quick.checked;
 runTableCommand(()=>P.reactAttack(state,attackUnitId,attack,reaction));
}
function currentDie(){
 const available=state.player.fixer.filter(side=>side!==20||state.player.fixer.length===1);
 return available.includes(selectedDie)?selectedDie:available[0];
}
function fixerHint(){
 if(state.finished)return '本局已結束';
 if(state.phase==='pregame')return '請先完成開局設定';
 if(!state.player.fixer.length)return '合事佬區已空；每回合抽牌後直接進入主要階段';
 if(state.turn!=='player')return '等待對手完成回合，再進行準備階段';
 if(state.phase==='start'&&state.step==='ready')return '先在回合狀態區按「重置資源」，再抽牌、選骰';
 if(state.phase==='start'&&state.step==='draw')return '先在牌庫按「抽 1 張」，接著就能選骰';
 if(state.phase==='start'&&state.step==='roll')return '點選一顆骰子，再按同區的「擲骰」';
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
    selectedDie=side;message='已選 d'+side+'；按合事佬區「擲骰」確認。';render();
   });
  }
  die.dataset.sides=String(side);
  die.disabled=!choosing||!state.player.fixer.includes(side)||(side===20&&state.player.fixer.length>1);
  die.setAttribute('aria-label','選擇 d'+side+' 委託骰');die.setAttribute('aria-pressed',String(choosing&&currentDie()===side));
  die.classList.toggle('is-die-selected',choosing&&currentDie()===side);
  die.title=!choosing?fixerHint():!state.player.fixer.includes(side)?'這顆骰子已擲出':side===20&&state.player.fixer.length>1?'d20 必須最後使用':'點選 d'+side;
 }
 let hint=zone.querySelector('.v3-fixer-hint');if(!hint)hint=add('div','',zone,'v3-fixer-hint');hint.textContent=fixerHint();
}
// Public trash viewer reads the live state; Eddie cards remain face down.
const trashDialog=document.createElement('dialog');trashDialog.id='v3TrashViewer';
trashDialog.setAttribute('aria-label','公開棄牌區');document.body.append(trashDialog);
let trashSide=null,trashOpener=null;
trashDialog.addEventListener('close',()=>{trashSide=null;trashOpener?.focus()});
trashDialog.addEventListener('click',event=>{if(event.target===trashDialog)trashDialog.close()});
function renderTrashViewer(){
 if(!trashSide||!trashDialog.open)return;
 trashDialog.replaceChildren();
 const head=add('div','',trashDialog,'v3-trash-header');
 add('h2',(trashSide==='player'?'我的':'對手')+'棄牌區 · '+(state[trashSide].trash||[]).length+' 張',head);
 const close=add('button','×',head,'btn');close.type='button';close.setAttribute('aria-label','關閉棄牌區');close.onclick=()=>trashDialog.close();
 const cards=add('div','',trashDialog,'v3-trash-cards');
 if(!(state[trashSide].trash||[]).length)add('p','目前沒有棄牌。',cards);
 for(const c of (state[trashSide].trash||[])){
  const item=add('figure','',cards),src=art.get(c.name);
  if(src){const img=document.createElement('img');img.src=src;img.alt=c.name;item.append(img)}
  add('figcaption',c.name+' · '+c.type,item);
 }
}
function renderTableResources(side,prefix){
 const zone=board.querySelector('.'+prefix+'-eddies');if(!zone)return;
 let pool=zone.querySelector('.v3-eddie-tokens');if(!pool)pool=add('div','',zone,'v3-eddie-tokens');pool.dataset.scrollTop=String(pool.scrollTop);pool.replaceChildren();
 const canPay=side==='player'&&paymentContext()?.selecting;
 state[side].eddies.forEach((c,index)=>{
  const slot=add('div','',pool,'v3-eddie-slot');const b=add('button','',slot,'v3-eddie-token');b.type='button';b.dataset.paymentKind='eddie';b.dataset.paymentId=c.id;
  const back=document.createElement('img');back.src='v3/assets/card-backs/normal.png';back.alt='';b.append(back);add('span','€$ '+(index+1),b);
  b.setAttribute('aria-label',(side==='player'?'我方':'對手')+' Eddie '+(index+1)+(c.ready?' 就緒':'已使用'));
  b.setAttribute('aria-pressed',String(side==='player'&&selectedPayments.has('eddie:'+c.id)));
  b.disabled=!canPay||!c.ready;b.classList.toggle('is-spent',!c.ready);b.dataset.ready=String(c.ready);b.title=c.ready?'就緒 Eddie · 可支付 1 €$':'已使用 Eddie · 下次重置後可再使用';
  b.classList.toggle('is-payment-available',Boolean(canPay&&c.ready));b.onclick=()=>togglePayment('eddie',c.id);
 });
 if(!state[side].eddies.length)add('span',side==='player'?'變賣手牌後，Eddie 會放在這裡。':'尚無 Eddies',pool,'v3-eddies-empty');
 const trashZone=board.querySelector('.'+prefix+'-trash');
 let trash=trashZone.querySelector('.v3-trash-summary');if(!trash){trash=add('button','',trashZone,'v3-trash-summary');trash.type='button';trash.onclick=()=>{trashSide=side;trashOpener=trash;trashDialog.showModal();renderTrashViewer()};}
 trash.replaceChildren();add('span','TRASH',trash,'v3-trash-label');add('span',(state[side].trash||[]).length+' 張',trash,'v3-trash-count');trash.setAttribute('aria-label','查看'+(side==='player'?'我方':'對手')+'棄牌區');
}
function renderPublicCounters(){
 for(const [side,prefix] of [['player','player'],['ai','opponent']]){
  const p=state[side],zone=board.querySelector('.'+prefix+'-gigs');
  const count=zone?.querySelector('strong'),cred=zone?.querySelector(':scope > span:not([data-practice-indicator])');
  if(count)count.textContent=p.gigs.length+' / 7';
  if(cred)cred.textContent='街頭聲望：'+(p.gigs.length?p.gigs.reduce((n,g)=>n+g.value,0):'Null');
  let dice=zone?.querySelector('.v3-gig-values');if(zone&&!dice){dice=add('div','',zone,'v3-gig-values')}
  const indicator=zone?.querySelector('[data-practice-indicator]');if(indicator&&dice)dice.after(indicator);
  if(dice){dice.replaceChildren();for(const g of p.gigs){
   const chip=add('span','',dice,'v3-gig-chip');chip.setAttribute('aria-label','d'+g.sides+'，點數 '+g.value);chip.title='d'+g.sides+' = '+g.value;
   const template=[...board.querySelectorAll('.player-fixer .die-icon')].find(el=>el.querySelector('b')?.textContent==='D'+g.sides),svg=template?.querySelector('svg')?.cloneNode(true);if(svg){svg.setAttribute('aria-hidden','true');chip.append(svg);}
   add('b',String(g.value),chip);add('small','d'+g.sides,chip);
  }}
  const deck=board.querySelector('.'+prefix+'-deck .deck-pile');
  if(deck){deck.replaceChildren(document.createTextNode(String(p.deck.length)));add('span','DECK',deck)}
  for(const die of board.querySelectorAll('.'+prefix+'-fixer .die-icon')){
   const sides=Number(die.querySelector('b')?.textContent.replace('D',''));die.style.opacity=p.fixer.includes(sides)?'1':'.25';
  }
  renderTableResources(side,prefix);
  const resourceZone=board.querySelector('.'+prefix+'-eddies');resourceZone?.classList.toggle('is-paying',side==='player'&&Boolean(paymentContext()?.selecting));
  const resources=board.querySelector('.'+prefix+'-eddies .placeholder-label');if(resources){const ready=p.eddies.filter(c=>c.ready).length,total=p.eddies.length;resources.textContent=ready+' / '+total;resources.setAttribute('aria-label','Eddies 就緒 '+ready+' / '+total);resources.title='就緒 '+ready+'，總計 '+total+' 個 Eddies';}
 }
 renderTrashViewer();
 indicator('.opponent-hand','對手手牌 '+state.ai.hand.length+' 張（隱藏）');
}
function renderLegends(){
 for(const [side,prefix] of [['player','player'],['ai','opponent']]){
  const rail=board.querySelector('.'+prefix+'-legends .cardbacks');if(!rail)continue;
  rail.replaceChildren();const legendZone=board.querySelector('.'+prefix+'-legends');legendZone.querySelector('.v3-legend-action-label')?.remove();
  if(state.phase==='pregame')continue;
  state[side].legends.forEach((l,index)=>{
   const slot=add('div','',rail,'v3-legend-slot');
   const button=add('button','',slot,'preview-art-card v3-legend-card');button.type='button';button.dataset.legendId=l.id;button.classList.toggle('face-down',!l.faceUp);button.classList.toggle('is-legend-spent',!l.ready);
   const label=l.faceUp?l.name:'傳奇位置 '+(index+1)+'（蓋牌'+(l.knownToOwner?'，已查看過':'')+'）';
   const paying=side==='player'&&paymentContext()?.selecting,available=paying&&G.sources(state).some(s=>s.kind==='legend'&&s.id===l.id),paid=side==='player'&&selectedPayments.has('legend:'+l.id);
   button.setAttribute('aria-label',(paying?'付款：':'')+label);button.setAttribute('aria-pressed',String(paying?paid:side==='player'&&selectedLegendId===l.id));
   button.dataset.paymentKind='legend';button.dataset.paymentId=l.id;button.classList.toggle('is-payment-available',Boolean(available));button.classList.toggle('is-payment-unavailable',Boolean(paying&&!available));
   button.classList.toggle('is-call-target',side==='player'&&selectedLegendId===l.id&&paymentAction==='call');button.classList.toggle('is-solo-target',side==='player'&&selectedLegendId===l.id&&paymentAction==='solo');
   if(side==='player'&&selectedLegendId===l.id&&['call','solo'].includes(paymentAction))add('span',(paymentAction==='call'?'呼叫對象':'Go Solo 對象')+' · 位置 '+(index+1),legendZone,'v3-legend-action-label');
   if(paying){button.setAttribute('aria-disabled',String(!available));button.title=available?'點擊選擇或取消付款':!l.ready?'此傳奇已使用，不能付款':'正面傳奇沒有變賣標記，不能付款';}
   button.classList.toggle('is-legend-selected',side==='player'&&selectedLegendId===l.id);button.classList.toggle('is-payment-selected',side==='player'&&selectedPayments.has('legend:'+l.id));
   button.classList.toggle('is-gear-target',side==='player'&&paymentAction==='gear-target'&&l.faceUp);
   if(l.faceUp){bindPublicPreview(button,{...l,type:'Legend'});if(side==='ai')button.onclick=()=>openPublicCard({...l,type:'Legend'});}
   else if(side==='ai'){button.tabIndex=-1;button.setAttribute('aria-disabled','true');}
   const img=document.createElement('img');img.src=l.faceUp?(art.get(l.name)||''):'v3/assets/card-backs/legend.png';img.alt=label;if(!l.faceUp)img.className='preview-card-back-image';button.append(img);
   const fallback=add('span',l.faceUp?l.name:'傳奇卡',button,'preview-art-fallback');img.onload=()=>{fallback.hidden=true};img.onerror=()=>{img.remove();fallback.hidden=false};
   add('small',l.ready?'READY':'SPENT',button,'v3-legend-state');
   if(side==='player')button.addEventListener('click',()=>{
    if(E.pending(state)){message='請先處理卡牌旁的待結算能力。';render();return;}
    if(!((state.turn==='player'&&state.phase==='main')||(state.phase==='react'&&state.pendingAttack?.defendingSide==='player'))){message='請先完成重置、抽牌與擲骰，再操作傳奇；對手回合須等待防守反應。';render();return;}
    if(paymentContext()?.selecting){if(G.sources(state).some(s=>s.kind==='legend'&&s.id===l.id))togglePayment('legend',l.id);else{message=!l.ready?'這張傳奇已使用，不能付款。':'這張正面傳奇沒有變賣標記，不能付款。';render();}return;}
    const gear=state.player.hand.find(c=>c.id===selectedId&&c.type==='Gear');
    if(gear&&paymentAction==='gear-target'&&l.faceUp&&state.phase==='main'){runTableCommand(()=>P.gear(state,gear.id,chosenPayments(gear.cost)||[],l.id));return;}
    if(gear&&paymentAction==='gear-target'){message='裝備對象必須是友方單位或正面傳奇。';render();return;}
    selectedLegendId=selectedLegendId===l.id?null:l.id;selectedId=null;attackUnitId=null;selectedPayments.clear();paymentAction=null;render();
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
  if(paymentAction!=='call'){
   add('span',state.player.calledThisTurn?'每回合只能呼叫一次；下一回合可再次呼叫。':'先按「呼叫傳奇」開始付款；翻開前不會顯示卡名。',tableControls,'v3-table-hint');
   localTableButton('呼叫傳奇（1 €$）',()=>{paymentAction='call';selectedPayments.clear();render()},state.player.calledThisTurn).classList.add('v3-action-primary');
  }else{
   add('span','已標示呼叫對象；直接點桌上的傳奇或 Eddies 支付 1 €$。',tableControls,'v3-table-hint');
   paymentOptions(tableControls);const sources=chosenPayments(1);
   tableButton('確認呼叫傳奇（1 €$）',()=>P.callLegend(state,l.id,sources||[]),!sources);
  }
 }else if(l.goSolo&&state.turn==='player'&&state.phase==='main'){
  add('span','Go Solo：支付 '+l.cost+' €$，以就緒單位登場並可立即攻擊。',tableControls,'v3-table-hint');
  if(paymentAction!=='solo')localTableButton('Go Solo（'+l.cost+' €$）',()=>{paymentAction='solo';selectedPayments.clear();render()}).classList.add('v3-action-primary');
  else{paymentOptions(tableControls);const sources=chosenPayments(l.cost);tableButton('確認 Go Solo（'+l.cost+' €$）',()=>P.goSolo(state,l.id,sources||[]),!sources);}
 }else add('span',l.legendEffect==='jackie'?'本回合第一次打出藍色單位或裝備時，會觸發 Jackie。':l.goSolo?'Go Solo 僅在自己的主要階段使用；此傳奇仍可支付資源。':l.legendEffect==='yorinobu'?'每回合第一次友方 ARASAKA 單位攻擊時抽牌；聲望低於 20 時再棄一張。':l.legendEffect==='saburo'?'友方 ARASAKA 單位攻擊期間戰力 +1。':'Viktor 呼叫搜尋已結算；此傳奇仍可支付資源。',tableControls,'v3-table-hint');
}
function renderEffectChoices(){
 const e=E.pending(state);if(!e)return;
 if(effectChoiceId!==e.id){effectChoiceId=e.id;effectChoices.clear();}
 const options=E.options(state,e),confirm=choice=>P.resolveEffect(state,choice);
 add('strong','待結算：'+(e.source||e.type),tableControls,'v3-table-selection');
 const choiceButton=(label,id)=>{const b=add('button',label,tableControls,'v3-resource-choice');b.type='button';b.setAttribute('aria-pressed',String(effectChoices.has(id)));b.addEventListener('click',()=>{if(effectChoices.has(id))effectChoices.delete(id);else effectChoices.add(id);render()});};
 if(e.type==='shatteredDraw'){
  add('span','Shattered Memories：是否抽 5 張牌？目前牌庫 '+state.player.deck.length+' 張。',tableControls,'v3-table-hint');
  tableButton('抽 5 張',()=>confirm({draw:true}));tableButton('不抽牌，繼續',()=>confirm({draw:false}));
 }else if(e.type==='defeatUnit'||e.type==='spendUnit'){
  add('span',e.source+'：選擇符合條件的單位。',tableControls,'v3-table-hint');
  for(const u of options)tableButton((e.type==='defeatUnit'?'擊敗：':'橫置：')+(u.side==='player'?'我方 · ':'對手 · ')+u.name,()=>confirm({unitId:u.id,side:u.side}));
 }else if(e.type==='swapGigs'){
  const own=document.createElement('select'),rival=document.createElement('select');own.setAttribute('aria-label','交換友方委託骰');rival.setAttribute('aria-label','交換對手委託骰');
  for(const [side,select] of [['player',own],['ai',rival]])for(const g of state[side].gigs){const o=document.createElement('option');o.value=g.id;o.textContent='d'+g.sides+' = '+g.value;select.append(o)}tableControls.append(own,rival);
  tableButton('確認交換委託骰',()=>confirm({friendlyGigId:own.value,rivalGigId:rival.value}));tableButton('不交換，繼續',()=>confirm({skip:true}));
 }else if(e.type==='radioport'){
  add('span','私下查看一張友方蓋牌傳奇；符合條件時可免費呼叫。',tableControls,'v3-table-hint');for(const l of options)tableButton('查看傳奇位置 '+(state.player.legends.indexOf(l)+1),()=>confirm({legendId:l.id}));tableButton('不查看，繼續',()=>confirm({skip:true}));
 }else if(e.type==='order'){
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
  add('span',e.source+'：必須棄置一張目前手牌。',tableControls,'v3-table-hint');
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
   const sources=chosenPayments(chosen.cost);
   let select=null;
   if(chosen.name==='Floor It'){
    select=document.createElement('select');select.setAttribute('aria-label','Quick 指定對手單位');
    for(const u of state.ai.units){const option=document.createElement('option');option.value=u.id;option.textContent=u.name;select.append(option)}if(!state.ai.units.some(u=>u.id===rivalUnitId))rivalUnitId=p.attackerId;select.value=rivalUnitId;select.addEventListener('change',()=>{rivalUnitId=select.value});tableControls.append(select);
   }
   tableButton('使用 Quick：'+chosen.name,()=>P.defend(state,{kind:'quick',cardId:chosen.id,sources:sources||[],rivalUnitId:select?.value}),!sources);
  }
 }
 if(!C.quicks(state).length)add('span','目前手上沒有已支援的 Quick。',tableControls,'v3-table-hint');
 tableButton('結束反應並結算',()=>P.defend(state,{kind:'end'}));
}
function compactFeedback(text){
 if(text.startsWith('鏡像對手完成回合'))return '鏡像對手已完成行動，輪到你準備回合。';
 if(text.length<=160)return text;
 const parts=text.split('；'),actions=parts.filter(p=>/對手.*呼叫傳奇|Go Solo：|^裝備 |^對手使用程式：|^Quick：/.test(p));
 return (actions.length?actions.slice(-3):parts.slice(-2)).join('；');
}
function renderTableControls(){
 tableControls.replaceChildren();
 if(!E.pending(state)){effectChoiceId=null;effectChoices.clear();}
 if(!isPracticeDeck()||state.phase==='pregame')return;
 const p=state.player;
 const headline=add('span',state.phase==='main'?'主要階段':phase(),tableControls,'v3-table-phase');
 if(message&&message!==initial)add('span',compactFeedback(message),tableControls,'v3-table-feedback');
 if(state.finished){confirmConcede=false;const result=E.resultSummary(state);headline.textContent=result.title;add('span',result.reason,tableControls,'v3-result-reason');tableButton('重新開局',()=>({ok:true,state:freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),message:initial}));return}
 if(state.overtime)add('span','OVERTIME · 7 顆骰立即獲勝',tableControls,'v3-overtime');
 if(confirmConcede){
  add('strong','確定認輸並結束本局？',tableControls,'v3-table-selection');
  tableButton('確認認輸',()=>P.concede(state));
  const keep=add('button','繼續對戰',tableControls,'v3-table-btn');keep.type='button';keep.addEventListener('click',()=>{confirmConcede=false;render()});return;
 }
 const concede=add('button','認輸',tableControls,'v3-table-btn v3-concede');concede.type='button';concede.addEventListener('click',()=>{confirmConcede=true;render()});
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
  if(!selectedId&&!attackUnitId)add('span',state.player.calledThisTurn?'本回合已呼叫傳奇':'點選蓋牌傳奇，可支付 1 €$ 呼叫',tableControls,'v3-table-hint');
 }
 if(selectedId){
  const card=p.hand.find(c=>c.id===selectedId);
  if(card){
   add('span',card.name+' · '+card.cost+' €$',tableControls,'v3-table-selection');
   if(card.sellTag)tableButton('變賣',()=>P.sell(state,card.id),p.soldThisTurn);
   if(!card.unimplementedEffect){
    paymentOptions(tableControls);
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
     const selected=gigId&&gigDelta?gigSide+':'+gigId+':'+gigDelta:'';if([...gigSelect.options].some(o=>o.value===selected))gigSelect.value=selected;gigSelect.addEventListener('change',()=>{const [side,id,delta]=gigSelect.value?gigSelect.value.split(':'):['player',null,0];gigSide=side;gigId=id;gigDelta=Number(delta)});tableControls.append(gigSelect);
     options.gigSelect=gigSelect;
    }
    if(card.onPlaySpendRival){
     const targets=state.ai.units.filter(u=>u.ready===true);
     if(targets.length){
      const select=document.createElement('select');select.setAttribute('aria-label','登場橫置目標');
      for(const unit of targets){const opt=document.createElement('option');opt.value=unit.id;opt.textContent='橫置：'+unit.name;select.append(opt)}
      if(!targets.some(u=>u.id===rivalUnitId))rivalUnitId=targets[0].id;select.value=rivalUnitId;select.addEventListener('change',()=>{rivalUnitId=select.value});tableControls.append(select);options.rivalSelect=select;
     }
    }
    if(card.onPlayDefeatGear){
     const optionsGear=['player','ai'].flatMap(side=>[...(state[side]?.units||[]),...(state[side]?.legends||[]).filter(l=>l.faceUp)].flatMap(unit=>
      (unit.gear||[]).map(gear=>({side,unit,gear}))));
     if(optionsGear.length){
      const select=document.createElement('select');select.setAttribute('aria-label','可選擇擊敗裝備');
      for(const [value,label] of [['','不擊敗裝備'],...optionsGear.map(o=>[o.side+':'+o.gear.id,(o.side==='player'?'我方':'對手')+' · '+o.gear.name+' / '+o.unit.name])]){
       const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt);
      }
      const chosen=defeatGearId?defeatGearSide+':'+defeatGearId:'';select.value=optionsGear.some(o=>o.side+':'+o.gear.id===chosen)?chosen:'';select.addEventListener('change',()=>{const [side,...id]=select.value.split(':');defeatGearSide=side||'player';defeatGearId=id.join(':')||null});tableControls.append(select);options.gearSelect=select;
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
    const pay=chosenPayments(card.cost);
    if(paymentAction!=='gear-target')localTableButton('選擇裝備目標',()=>{paymentAction='gear-target';render()},!pay).classList.add('v3-action-primary');
    else{
     localTableButton('重新選擇付款',()=>{paymentAction=null;render()});
     for(const unit of p.units)tableButton('裝備至 '+unit.name,()=>P.gear(state,card.id,pay||[],unit.id),!pay);
     for(const legend of p.legends.filter(l=>l.faceUp))tableButton('裝備至 '+legend.name,()=>P.gear(state,card.id,pay||[],legend.id),!pay);
     if(!p.units.length&&!p.legends.some(l=>l.faceUp))add('span','沒有合法裝備對象：需要友方單位或正面傳奇。',tableControls,'v3-table-hint');
    }
   }else if(card.type==='Program'){
    const pay=chosenPayments(card.cost);
    if(card.name==='Floor It'){
     const rivals=state.ai.units;let select=null;
     if(rivals.length){select=document.createElement('select');select.setAttribute('aria-label','Floor It 指定對手單位');for(const u of rivals){const opt=document.createElement('option');opt.value=u.id;opt.textContent=u.name;select.append(opt)}if(!rivals.some(u=>u.id===rivalUnitId))rivalUnitId=rivals[0].id;select.value=rivalUnitId;select.addEventListener('change',()=>{rivalUnitId=select.value});tableControls.append(select);}
     tableButton('使用 Floor It',()=>P.program(state,card.id,pay||[],{rivalUnitId:select?.value}),!pay);
    }else if(card.name==='Reboot Optics')tableButton('使用 Reboot Optics',()=>P.program(state,card.id,pay||[],{}),!pay);
    else if(card.name==="Afterparty at Lizzie's"){
     const sel=document.createElement('select');sel.setAttribute('aria-label','調整委託骰目標');
     const options=[['','不調整委託骰'],...['player','ai'].flatMap(side=>(state[side]?.gigs||[]).flatMap(g=>
      [-1,1].filter(delta=>g.value+delta>=1&&g.value+delta<=g.sides)
       .map(delta=>[side+':'+g.id+':'+delta,(side==='player'?'我方':'對手')+' d'+g.sides+' '+(delta>0?'+1':'-1')])) )];
     for(const [value,label] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=label;sel.append(opt)}
     const chosen=gigId&&gigDelta?gigSide+':'+gigId+':'+gigDelta:'';if([...sel.options].some(o=>o.value===chosen))sel.value=chosen;sel.addEventListener('change',()=>{const [side,id,delta]=sel.value?sel.value.split(':'):['player',null,0];gigSide=side;gigId=id;gigDelta=Number(delta)});tableControls.append(sel);
     tableButton('使用 Afterparty',()=>{
      const [side,gigId,delta]=sel.value?sel.value.split(':'):['player',null,0];
      return P.program(state,card.id,pay||[],{side,gigId,delta:Number(delta)});
     },!pay);
    }else if(card.programEffect)tableButton('使用 '+card.name,()=>P.program(state,card.id,pay||[],{}),!pay);
    else add('span','尚未支援的卡牌效果',tableControls,'v3-table-hint');
   }
   tableButton('取消選取',()=>{selectedId=null;return {ok:true,state,message:'已取消選取'}});
  }
 }else if(attackUnitId){
  const attacker=p.units.find(u=>u.id===attackUnitId);
  if(attacker){
   add('span','攻擊：'+attacker.name+' · '+A.unitStats(attacker).power+' PWR',tableControls,'v3-table-selection');
   if(!G.canAttack(attacker))add('span',attacker.cannotAttack?'此單位不能攻擊；可在對手回合使用 Blocker。':(attacker.lag&&!attacker.goSolo)?'此單位仍有 Lag，要等下一次重置後才能攻擊。':!attacker.ready?'此單位已使用，本回合不能再次攻擊。':'此單位的攻擊能力尚未支援。',tableControls,'v3-table-hint');
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
    if(A.unitStats(attacker).power<=0&&G.targets(state,attacker).gigs)add('span','戰力 0 仍可攻擊，但不會奪取委託骰。',tableControls,'v3-table-hint');
    const rival=state.ai.gigs;
    if(rival.length){
     const select=document.createElement('select');select.setAttribute('aria-label','選擇對手委託骰');
     for(const gig of rival){const option=document.createElement('option');option.value=gig.id;option.textContent='d'+gig.sides+' / '+gig.value;select.append(option)}
     tableControls.append(select);
     tableButton('攻擊委託區',()=>{
      const modifier=board.querySelector('[data-table-quick]')?.checked?1:0;
      const power=A.unitStats(attacker).power-modifier;
      const count=power<=0?0:Math.min(rival.length,Math.floor(power/10)+1);
      const ids=[select.value,...rival.filter(g=>g.id!==select.value).map(g=>g.id)].slice(0,count);
      const blockers=state.ai.practiceBot?.kind==='mirror-the-heist'?[]:state.ai.units.filter(u=>u.ready&&A.unitStats(u).blocker);
      const choice=board.querySelector('[data-table-blocker]')?.value;
      if(state.ai.practiceBot?.kind==='mirror-the-heist')return P.reactAttack(state,attackUnitId,{kind:'gig',gigIds:ids});
      if(blockers.length&&!choice)return {ok:false,reason:'請先選擇防守反應'};
      const reaction={kind:choice&&choice!=='pass'?'block':'pass',...(choice&&choice!=='pass'?{blockerId:choice}:{}),
       ...(state.ai.quickExercise?.enabled&&state.ai.hand.some(c=>c.id==='training-quick-floor-it')?{quick:!!board.querySelector('[data-table-quick]')?.checked}:{})};
      return P.reactAttack(state,attackUnitId,{kind:'gig',gigIds:ids},reaction);
     },!G.targets(state,attacker).gigs);
    }
    const legal=G.targets(state,attacker);add('span',legal.units.length?'可直接點擊高亮的對手單位。':legal.gigs?'可攻擊對手委託區；目前沒有合法單位目標。':'目前沒有合法攻擊目標，可繼續出牌或結束回合。',tableControls,'v3-table-hint');
   }
  }
 }else add('span','點擊手牌出牌，或點擊己方單位攻擊',tableControls,'v3-table-hint');
 tableButton('結束回合',()=>P.pass(state));
}
function layoutTableActions(){
 contextActions.replaceChildren();contextActions.hidden=true;
 roomButtons.replaceChildren();guideDock.replaceChildren();if(leaveButton)roomButtons.append(leaveButton);
 for(const b of [...tableControls.children]){if(b.classList.contains('v3-concede'))roomButtons.append(b);else if(['開啟桌面引導','重新看桌面說明'].includes(b.textContent))guideDock.append(b);}
 board.querySelectorAll('.v3-zone-actions').forEach(e=>e.remove());
 const put=(selector)=>{const row=add('div','',board.querySelector(selector),'v3-zone-actions');return row;};
 // Keep one real roll control in place, including disabled phases.
 const canRoll=state.turn==='player'&&state.phase==='start'&&state.step==='roll'&&!state.finished&&!E.pending(state)&&!confirmConcede&&currentDie()!==undefined;
 let roll=[...tableControls.querySelectorAll('button')].find(b=>b.textContent==='擲骰');
 if(!roll)roll=tableButton('擲骰',()=>{const side=currentDie();return P.roll(state,side,Math.floor(Math.random()*side)+1)},!canRoll);
 roll.id='v3RollControl';roll.disabled=!canRoll;roll.setAttribute('aria-disabled',String(!canRoll));roll.title=canRoll?'擲出目前選取的 d'+currentDie():fixerHint();
 const rollArea=put('.player-fixer');rollArea.classList.add('v3-fixer-roll');rollArea.append(roll);
 if(state.phase==='pregame'||state.finished)return;
 if(state.phase==='start'){
  const names={ready:'重置資源',draw:'抽 1 張',roll:'擲骰'},selector={ready:'.v3-phase-panel',draw:'.player-deck',roll:'.player-fixer'};
  const row=state.step==='roll'?rollArea:put(selector[state.step]);if(state.step==='ready')row.classList.add('v3-ready-actions');
  for(const b of [...tableControls.children])if(b.textContent===names[state.step]||b.tagName==='SELECT')row.append(b);
  return;
 }
 const defending=state.phase==='react'&&state.pendingAttack?.defendingSide==='player',effect=Boolean(E.pending(state));
 if(confirmConcede||(!defending&&!effect&&(state.phase!=='main'||!(selectedId||selectedLegendId||attackUnitId))))return;
 contextActions.setAttribute('aria-label',effect?'待結算能力':defending?'防守操作':'選取卡牌操作');
 for(const child of [...tableControls.children]){
  if(child.matches('.v3-table-phase,.v3-table-feedback,.v3-concede'))continue;
  if(['結束回合','開啟桌面引導','重新看桌面說明'].includes(child.textContent))continue;
  contextActions.append(child);
 }
 contextActions.hidden=!contextActions.childElementCount;
 positionContextActions();
}
function positionContextActions(){
 if(contextActions.hidden)return;
 const anchor=selectedId?board.querySelector('.hand-card[data-card-id="'+selectedId+'"]'):selectedLegendId?board.querySelector('[data-legend-id="'+selectedLegendId+'"]')?.closest('.player-legends'):board.querySelector('.player-field .is-table-selected')||board.querySelector('.player-field');
 if(!anchor)return;
 const r=anchor.getBoundingClientRect(),h=contextActions.offsetHeight,w=contextActions.offsetWidth;
 const top=selectedId?board.querySelector('.player-hand').getBoundingClientRect().top:r.top;
 const field=board.querySelector('.player-field').getBoundingClientRect();
 contextActions.style.left=Math.max(12,Math.min(innerWidth-w-12,attackUnitId?r.right+10:selectedId?field.right-w-12:r.left))+'px';
 contextActions.style.top=Math.max(12,Math.min(innerHeight-h-12,attackUnitId?r.top:top-h-10))+'px';
}
window.addEventListener('resize',()=>{positionContextActions();requestAnimationFrame(positionGuide)});
function render(){
 clearSellDrag();
 if(state.phase==='pregame'){confirmConcede=false;selectedLegendId=null;selectedId=null;selectedPayments.clear();paymentAction=null;attackUnitId=null;effectChoiceId=null;effectChoices.clear();}
 hideHandHover();
 const sequence=++renderSequence;
 cancelDeals();
 const deal=pendingDeal;pendingDeal=null;
 const supported=isPracticeDeck();
 if(!supported){contextActions.hidden=true;board.querySelector('.table-preview').dataset.v3Stage='preview';guideRoot.hidden=true;tableControls.replaceChildren();if(opponentTimer!==null){clearTimeout(opponentTimer);opponentTimer=null;}board.querySelectorAll('.v3-guide-active').forEach(el=>el.classList.remove('v3-guide-active'));}
 root.replaceChildren();
 openingRoot.replaceChildren();
 openingRoot.hidden=state.phase!=='pregame'||!isPracticeDeck();
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
  if($('battlePreviewStatus'))$('battlePreviewStatus').textContent='此牌組目前僅提供卡圖預覽。';
  add('p','此牌組目前僅提供卡圖預覽，尚未接入實戰。',root,'v3-turn-note');
  return;
 }
 const p=state.player;
 board.querySelector('.table-preview').dataset.v3Stage=state.phase==='pregame'?'opening':'active';
 renderHand();bindLiveHandHover();renderField();renderRivalField();renderLegends();
 const rivalHand=board.querySelector('.opponent-hand .preview-card-rail');rivalHand.replaceChildren();
 if(state.phase!=='pregame')for(const card of state.ai.hand){
  const back=add('div','',rivalHand,'preview-art-card face-down');const img=document.createElement('img');img.src='v3/assets/card-backs/normal.png';img.alt='對手手牌（蓋牌）';img.className='preview-card-back-image';back.append(img);
 }
 else{board.querySelector('.player-field .field-slots').replaceChildren();board.querySelector('.opponent-field .field-slots').replaceChildren();}

 renderTableControls();
 renderGuide();
 renderCombatMarkers();
 renderPublicCounters();
 renderFixerChoices();
 fitHandRails();
 layoutTableActions();
 for(const zone of board.querySelectorAll('.v3-guide-active'))zone.querySelectorAll('button.v3-table-btn.v3-guide-active').forEach(b=>b.classList.remove('v3-guide-active'));
 renderBoardInformation();
 if(!deal)scheduleOpponent();
 if(deal&&state.phase!=='pregame')requestAnimationFrame(()=>{
  if(sequence===renderSequence&&isPracticeDeck()&&!$('battle')?.classList.contains('hide'))dealHand(deal);
  if(!activeDeals.length)scheduleOpponent();
 });
 const header=add('div','',root,'v3-turn-header');
 add('strong',deckName()+' / '+(state.phase==='pregame'?'開局設定':'ROUND '+state.round),header);add('span',state.phase==='pregame'?'等待先後攻':phase(),header);
 add('p',deckName()+' 支援隨機起手與一次整手重抽。鏡像模式包含傳奇、裝備能力、攻擊與防守反應；對手策略仍有限。',root,'v3-turn-note');
 if(state.phase==='pregame'){
  const order=add('div','',openingRoot,'v3-selected-detail');
  add('strong',state.opening?.orderChosen?'開局設定 / 確認六張起手':'開局設定 / 選擇牌組與先後攻',order);
  add('p',message===initial?'選擇設定後，擲 d20 決定先後攻。':message,order,'v3-opening-status').setAttribute('role','status');
  if(!state.opening?.orderChosen){
  const setupFields=add('div','',order,'v3-setup-fields');
  const deckLabel=add('label','牌組',setupFields);
  const deckSelect=document.createElement('select');
  deckSelect.id='v3RoomDeckSelect';deckSelect.setAttribute('aria-label','選擇實戰牌組');
  const playable=document.createElement('option');playable.value='theHeist';playable.textContent='The Heist（目前可操作）';deckSelect.append(playable);
  const unavailable=document.createElement('option');unavailable.value='embracingPower';unavailable.textContent='Embracing Power（目前可操作）';deckSelect.append(unavailable);
  deckSelect.value=picker.value;
  deckSelect.addEventListener('change',()=>{picker.value=deckSelect.value;picker.dispatchEvent(new Event('change',{bubbles:true}))});
  deckLabel.append(deckSelect);
  const handLabel=add('label','開局方式',setupFields);
  const handSelect=document.createElement('select');handSelect.setAttribute('aria-label','選擇開局方式');
  for(const [value,label] of [['random','隨機起手（可重抽一次）'],['basic','固定練習：基礎出牌手牌'],['quick','固定練習：效果與 Quick 手牌']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;option.disabled=(value==='random'&&opponentMode!=='mirror')||(picker.value==='embracingPower'&&value!=='random');handSelect.append(option);
  }
  handSelect.value=scenario;
  handSelect.addEventListener('change',()=>{
   scenario=handSelect.value;D.cancel();state=freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;selectedPayments.clear();paymentAction=null;targetId=null;
   gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';
   actionHistory=[];historyVersion++;message=scenario==='random'?'先決定先後攻，再洗牌抽取六張起手。':'已更新本局六張固定練習手牌。';render();
  });
  handLabel.append(handSelect);
  const opponentLabel=add('label','對手類型',setupFields);
  const opponentSelect=document.createElement('select');opponentSelect.setAttribute('aria-label','選擇對手模式');
  for(const [value,label] of [['mirror','自動測試對手：'+deckName()+' 鏡像牌組'],['script','固定目標：Blocker／Quick 腳本練習']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;option.disabled=picker.value==='embracingPower'&&value==='script';opponentSelect.append(option);
  }
  opponentSelect.value=opponentMode;
  opponentSelect.addEventListener('change',()=>{
   opponentMode=opponentSelect.value;if(opponentMode==='script'&&scenario==='random')scenario='basic';D.cancel();
   state=freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;attackUnitId=null;selectedPayments.clear();paymentAction=null;
   actionHistory=[];historyVersion++;message='已更新對手模式。';render();
  });
  opponentLabel.append(opponentSelect);
  const modeHelp=add('details','',order,'v3-opening-help');add('summary','對手模式說明',modeHelp);
  add('p',opponentMode==='mirror'?(scenario==='random'?'雙方洗牌並抽六張；對手保留起手，會呼叫傳奇、Go Solo、出牌、裝備與使用程式，攻擊時等待你的防守反應。':'固定練習保留指定起手與牌庫順序；鏡像對手會自動執行回合並等待你的防守反應。'):'固定目標模式保留原本預先配置的單位與委託骰，可測試腳本 Blocker／Quick。',modeHelp);
  if(opponentMode==='script'){
  const defenderLabel=add('label','腳本對手反應（測試模式）',order);
  const defenderSelect=document.createElement('select');defenderSelect.setAttribute('aria-label','選擇測試對手反應');
  for(const [value,label] of [['none','基本對手（無額外反應）'],['blocker','Blocker 攔截'],['quick','Floor It Quick'],['both','Blocker + Floor It']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;defenderSelect.append(option);
  }
  defenderSelect.value=defensePreset;
  defenderSelect.addEventListener('change',()=>{
   defensePreset=defenderSelect.value;D.cancel();state=freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});
   pendingDeal=null;selectedId=null;attackUnitId=null;selectedPayments.clear();paymentAction=null;
   actionHistory=[];historyVersion++;message='已更新腳本對手設定。';render();
  });
  defenderLabel.append(defenderSelect);
  }
  }
  const opening=state.opening;
  if(scenario==='random'&&opening?.orderChosen){

   const cards=add('div','',order,'v3-opening-cards');
   for(const c of state.player.hand){
    const item=add('button','',cards,'v3-opening-card');item.type='button';item.dataset.cardId=c.id;item.setAttribute('aria-label','查看起手牌 '+c.name);item.onclick=()=>openPublicCard(c);
    const src=art.get(c.name);if(src){const img=document.createElement('img');img.src=src;img.alt=c.name;item.append(img);}
    add('small',c.cost+' €$',item);
   }
   if(!opening.handDecisions.player){
    add('p','可保留目前六張，或將整手洗回牌庫重抽六張；每局只能重抽一次，不能只換部分牌。'+(opening.first==='ai'?'對手已先決定保留。':'我方決定後，對手再決定。'),order);
    const decisions=add('div','',order,'v3-opening-actions');
    command('保留這六張',()=>P.openingHand(state,'keep'),decisions).classList.add('v3-opening-primary');
    command('整手重抽一次',()=>P.openingHand(state,'mulligan'),decisions);
   }else{
    add('p',opening.mulliganUsed.player?'已重抽一次；這六張就是本局起手。':'已保留這六張起手。',order);

    const finalActions=add('div','',order,'v3-opening-actions');
    command('開始對戰',()=>P.beginOpening(state),finalActions).classList.add('v3-opening-primary');
   }

  }else{
   if(scenario!=='random'){
    const fixedHelp=add('details','',order,'v3-opening-help');add('summary','查看固定練習起手',fixedHelp);
    add('p',state.player.hand.map(c=>c.name).join('、'),fixedHelp,'v3-opening-hand-list');
    add('p','指定手牌練習不提供重抽。',order);
   }
  add('p','雙方各擲 d20，高點者選先後攻；同點重擲。',order);
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
    const orderActions=add('div','',order,'v3-opening-actions');
    command('我方選擇先攻',()=>P.chooseOrder(state,'player'),orderActions);
    command('我方選擇後攻',()=>P.chooseOrder(state,'ai'),orderActions);
   }else command('對手選擇先攻',()=>P.chooseOrder(state,'ai'),order).classList.add('v3-opening-primary');
  }
  }
  add('p','先攻者左側兩張傳奇卡橫置，第一回合不能重置。鏡像對手會自動行動。',order,'v3-opening-footnote');
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
 command('重新開始 '+deckName()+' 練習',()=>({ok:true,state:freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true}),message:initial}),buttons);
 const status=add('p',message,root,'v3-turn-feedback');status.setAttribute('role','status');
 const summary=add('div','',root,'v3-turn-log');add('strong','實際練習狀態',summary);
 add('p','場地：'+(p.units.map(c=>c.name+'（'+(c.ready?'Ready':'Spent')+(c.lag?' / Lag':'')+'）').join('、')||'無'),summary);
 add('p','委託骰：'+(p.gigs.map(d=>'d'+d.sides+'='+d.value).join('、')||'無'),summary);
 add('p','棄牌區：'+((p.trash||[]).map(c=>c.name).join('、')||'無'),summary);
 add('p','對手練習單位：'+(state.ai.units.map(u=>u.name+'（'+(u.ready?'Ready':'Spent')+'，PWR '+(A?.unitStats?.(u)?.power??u.power)+'）').join('、')||'無'),summary);
 indicator('.turn-info',deckName()+'：'+phase());
 indicator('.player-eddies','Eddies 就緒 '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length);
 indicator('.player-gigs',p.gigs.length+' 顆委託骰');
 indicator('.opponent-gigs',(state.ai.gigs||[]).length+(state.ai.practiceBot?.kind==='mirror-the-heist'?' 顆委託骰':' 顆練習委託骰'));
 indicator('.player-field',p.units.length+' 張實際單位 · 移出遊戲 '+(p.removed?.length||0)+' 張');
 indicator('.player-deck','練習牌庫：'+p.deck.length+' 張');
 if($('battlePreviewStatus'))$('battlePreviewStatus').textContent=deckName()+' 實際牌組操作練習。選取手牌後在桌面指定支付資源；未支援的特殊能力仍不會自動結算。';
}
const shuffleButton=$('redrawBattleHand'),legendButton=$('toggleBattleLegends');
function syncDeck(){
 actionHistory=[];historyVersion++;
 D.cancel();
 if(isPracticeDeck()){
  if(picker.value==='embracingPower')opponentMode='mirror';
  scenario=opponentMode==='mirror'?'random':'basic';state=freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true});pendingDeal=$('battle')?.classList.contains('hide')?null:'all';selectedId=null;selectedPayments.clear();paymentAction=null;targetId=null;gigId=null;gigSide='player';gigDelta=0;rivalUnitId=null;defeatGearId=null;defeatGearSide='player';message=initial;
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
 if(entryDealt||!isPracticeDeck())return;
 if(state.phase!=='pregame'){guideRoot.hidden=!guidanceOn;requestAnimationFrame(positionGuide);}
 entryDealt=true;
 if(isPracticeDeck()&&state.phase==='pregame'){document.getElementById('closeBoardTour')?.click();setActionTray(false)}
 requestAnimationFrame(()=>{if(!battlePage.classList.contains('hide')&&isPracticeDeck()&&state.phase!=='pregame')dealHand('all')});
}
if(battlePage&&typeof MutationObserver!=='undefined'){
 new MutationObserver(dealOnEntry).observe(battlePage,{attributes:true,attributeFilter:['class']});
 dealOnEntry();
}
})();
