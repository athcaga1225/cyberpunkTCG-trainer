/* V3: real starter-hand basic practice. Safely limited to verified basic unit interactions. */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.NCTV3TurnPractice,H=window.NCTV3Heist;
const root=$('v3TurnPractice'),board=$('battleTour'),picker=$('battleDeckChoice');
if(!root||!board||!P||!H||!picker)return;
const initial='The Heist 實際 40 張初始牌組：請完成準備階段，再選擇上方的手牌。';
let state=H.fresh(),selectedId=null,selectedPayments=new Set(),message=initial;
const art=new Map();
document.querySelectorAll('#starterDeckGallery [data-card-name][data-deck-image]').forEach(el=>{
 const name=el.getAttribute('data-card-name'),src=el.getAttribute('data-deck-image');
 if(name&&src&&!art.has(name))art.set(name,src);
});
const phase=()=>state.finished?'已結束':state.turn==='ai'?'對手回合（暫停）':state.phase==='main'?'主要階段':'準備階段：'+({ready:'重置',draw:'抽牌',roll:'擲骰'}[state.step]||state.step);
const add=(tag,txt,parent,cls)=>{const el=document.createElement(tag);el.textContent=txt||'';if(cls)el.className=cls;parent.append(el);return el};
function command(label,fn,parent,disabled=false){
 const b=add('button',label,parent,'btn');b.type='button';b.disabled=disabled;
 b.addEventListener('click',()=>{const r=fn();message=r.ok?r.message:r.reason;if(r.ok){state=r.state;selectedPayments.clear();if(!state.player.hand.some(c=>c.id===selectedId))selectedId=null;}render()});return b;
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
  const btn=document.createElement('button');btn.type='button';btn.className='preview-art-card hand-card';btn.dataset.cardName=card.name;btn.dataset.handIndex=String(i);
  const selected=selectedId===card.id;btn.classList.toggle('is-selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
  btn.setAttribute('aria-label','選取 '+card.name+'，費用 '+card.cost+(card.sellTag?'，可變賣':''));
  btn.title=card.name;
  const src=art.get(card.name);
  if(src){const image=document.createElement('img');image.src=src;image.alt=card.name+' 卡面';image.loading='lazy';image.decoding='async';btn.append(image)}
  else{btn.classList.add('missing-art');add('span',card.name,btn,'preview-art-fallback')}
  btn.addEventListener('click',()=>{selectedId=selected?null:card.id;selectedPayments.clear();message=selectedId?'已選取 '+card.name:'已取消選取';render()});
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
  add('small',card.lag?'LAG':'READY',el);
 }
 if(!state.player.units.length)add('div','尚無已打出的單位',slots);
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
function render(){
 const supported=picker.value==='theHeist';
 root.replaceChildren();
 if(!supported){add('p','目前只有 The Heist 已接入實際手牌與支付練習。Embracing Power 仍保留原本卡圖預覽。',root,'v3-turn-note');return}
 const p=state.player;
 renderHand();renderField();
 const header=add('div','',root,'v3-turn-header');
 add('strong','THE HEIST / ROUND '+state.round,header);add('span',phase(),header);
 add('p','已接入 The Heist 真實 40 張牌組與卡圖。現階段只支援驗證過的基本出牌（Secondhand Bombus）；其他卡牌能力尚未實作，不會假裝已結算。開局手牌固定供測試。',root,'v3-turn-note');
 const stats=add('div','',root,'v3-turn-stats');
 add('span','手牌 '+p.hand.length+' 張',stats);
 add('span','Eddies '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length,stats);
 add('span','傳奇可支付 '+p.legends.filter(e=>e.ready&&(!e.faceUp||e.sellTag)).length,stats);
 add('span','委託骰 '+p.gigs.length+' 顆',stats);
 add('span','場地單位 '+p.units.length+' 張',stats);
 const chosen=p.hand.find(c=>c.id===selectedId);
 const details=add('div','',root,'v3-selected-detail');
 if(chosen){add('strong',chosen.name,details);add('p',chosen.type+' · COST '+chosen.cost+' · '+(chosen.sellTag?'有變賣標記':'不可變賣')+(chosen.unimplementedEffect?' · 尚未支援出牌效果':''),details)}
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
  if(chosen?.type==='Unit'&&!chosen.unimplementedEffect){
   const sources=paymentOptions(root);
   const selected=sources.filter(src=>selectedPayments.has(src.kind+':'+src.id));
   add('p','已指定 '+selected.length+' / '+chosen.cost+' €$',root,'v3-payment-count');
   command('支付並打出 '+chosen.name,()=>P.play(state,selectedId,selected.map(({kind,id})=>({kind,id}))),buttons,selected.length!==chosen.cost);
  }
  command('結束我的回合',()=>P.pass(state),buttons);
 }
 if(!state.finished&&state.turn==='ai')command('略過對手行動，開始下一回合',()=>P.next(state),buttons);
 command('重新開始 The Heist 練習',()=>({ok:true,state:H.fresh(),message:initial}),buttons);
 const status=add('p',message,root,'v3-turn-feedback');status.setAttribute('role','status');
 const summary=add('div','',root,'v3-turn-log');add('strong','實際練習狀態',summary);
 add('p','場地：'+(p.units.map(c=>c.name+'（'+(c.ready?'Ready':'Spent')+(c.lag?' / Lag':'')+'）').join('、')||'無'),summary);
 add('p','委託骰：'+(p.gigs.map(d=>'d'+d.sides+'='+d.value).join('、')||'無'),summary);
 indicator('.turn-info','THE HEIST：'+phase());
 indicator('.player-eddies','Eddies 就緒 '+p.eddies.filter(e=>e.ready).length+'/'+p.eddies.length);
 indicator('.player-gigs',p.gigs.length+' 顆委託骰');
 indicator('.player-field',p.units.length+' 張實際單位');
 indicator('.player-deck','練習牌庫：'+p.deck.length+' 張');
 if($('battlePreviewStatus'))$('battlePreviewStatus').textContent='The Heist 實際牌組操作練習。選取手牌後在下方指定支付資源；特殊能力仍未啟用。';
}
const shuffleButton=$('redrawBattleHand'),legendButton=$('toggleBattleLegends');
function syncDeck(){
 if(picker.value==='theHeist'){
  state=H.fresh();selectedId=null;selectedPayments.clear();message=initial;
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
})();
