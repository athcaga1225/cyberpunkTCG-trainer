/* V3-only basic turn UI. The adjacent card-art rail remains a preview until full card integration. */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.NCTV3TurnPractice;
const root=$('v3TurnPractice'),board=$('battleTour');
if(!root||!board||!P)return;
let state=P.fresh(),message='此練習使用示範卡。上方展示手牌尚未連接此回合狀態。';
const phase=()=>state.finished?'已結束':state.turn==='ai'?'對手回合（暫停）':state.phase==='main'?'主要階段':'準備階段：'+({ready:'重置',draw:'抽牌',roll:'擲骰'}[state.step]||state.step);
const add=(tag,txt,parent,cls)=>{const e=document.createElement(tag);e.textContent=txt||'';if(cls)e.className=cls;parent.append(e);return e};
function command(label,fn,parent,disabled=false){
 const b=add('button',label,parent,'btn');b.type='button';b.disabled=disabled;
 b.addEventListener('click',()=>{const r=fn();message=r.ok?r.message:r.reason;if(r.ok)state=r.state;render()});return b;
}
function updateZone(selector,summary){
 const zone=board.querySelector(selector);if(!zone)return;
 let el=zone.querySelector('[data-practice-indicator]');
 if(!el){el=document.createElement('span');el.setAttribute('data-practice-indicator','');el.className='v3-practice-indicator';zone.append(el)}
 el.textContent=summary;
}
function render(){
 const p=state.player,available=p.eddies.filter(e=>e.ready).length+p.legends.filter(e=>e.ready&&(!e.faceUp||e.sellTag)).length;
 root.replaceChildren();
 const header=add('div','',root,'v3-turn-header');
 add('strong','基本回合練習 / ROUND '+state.round,header);
 add('span',phase(),header);
 add('p','使用示範卡進行規則操作；尚未支援卡牌效果、AI、完整開局或正式對戰。',root,'v3-turn-note');
 const stats=add('div','',root,'v3-turn-stats');
 add('span','手牌 '+p.hand.length+' 張',stats);
 add('span','Eddies '+p.eddies.filter(e=>e.ready).length+' / '+p.eddies.length+' 就緒',stats);
 add('span','傳奇可支付 '+p.legends.filter(e=>e.ready&&!e.faceUp).length,stats);
 add('span','委託骰 '+p.gigs.length+' 顆',stats);
 add('span','場地單位 '+p.units.length+' 張',stats);
 const actions=add('div','',root,'v3-turn-actions');
 if(!state.finished&&state.turn==='player'&&state.phase==='start'){
  if(state.step==='ready')command('01 重置資源',()=>P.ready(state),actions);
  if(state.step==='draw')command('02 抽 1 張',()=>P.draw(state),actions);
  if(state.step==='roll'){
   add('label','03 選擇委託骰',actions);
   const select=document.createElement('select');select.setAttribute('aria-label','選擇要擲出的骰子');
   for(const side of p.fixer){const opt=document.createElement('option');opt.value=side;opt.textContent='d'+side;opt.disabled=side===20&&p.fixer.length>1;select.append(opt)}
   actions.append(select);
   command('擲骰並進入主要階段',()=>{const side=Number(select.value);return P.roll(state,side,Math.floor(Math.random()*side)+1)},actions);
  }
 }
 if(!state.finished&&state.turn==='player'&&state.phase==='main'){
  const sell=p.hand.find(c=>c.sellTag);
  command('變賣一張示範手牌',()=>P.sell(state,sell?.id),actions,!sell||p.soldThisTurn);
  const unit=p.hand.find(c=>c.type==='Unit');
  const payable=[...p.eddies.filter(e=>e.ready).map(e=>({kind:'eddie',id:e.id})),...p.legends.filter(e=>e.ready&&(!e.faceUp||e.sellTag)).map(e=>({kind:'legend',id:e.id}))];
  command('支付 2 €$ 並打出練習單位',()=>P.play(state,unit?.id,payable.slice(0,2)),actions,!unit||available<2);
  command('結束我的回合',()=>P.pass(state),actions);
 }
 if(!state.finished&&state.turn==='ai')command('略過對手行動，開始下一回合',()=>P.next(state),actions);
 command('重新開始練習',()=>({ok:true,state:P.fresh(),message:'已重設基本回合練習。'}),actions);
 const status=add('p',message,root,'v3-turn-feedback');status.setAttribute('role','status');
 const summary=add('div','',root,'v3-turn-log');
 add('strong','示範狀態',summary);
 add('p','手牌：'+(p.hand.map(c=>c.name).join('、')||'無'),summary);
 add('p','場地：'+(p.units.map(c=>c.name+'（'+(c.ready?'Ready':'Spent')+(c.lag?' / Lag':'')+'）').join('、')||'無'),summary);
 add('p','委託骰：'+(p.gigs.map(d=>'d'+d.sides+'='+d.value).join('、')||'無'),summary);
 updateZone('.turn-info','練習：'+phase());
 updateZone('.player-eddies','練習：'+p.eddies.filter(e=>e.ready).length+' / '+p.eddies.length+' Eddies 就緒');
 updateZone('.player-gigs','練習：'+p.gigs.length+' 顆');
 updateZone('.player-field','練習：'+p.units.length+' 張單位');
 updateZone('.player-deck','練習牌庫：'+p.deck.length+' 張');
}
render();
})();
