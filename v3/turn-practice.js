/* V3 only: bounded two-player turn sequence for a BASIC PRACTICE, not official full-game play.
 * Official rules: https://cyberpunktcg.com/comprehensive-rules 7.7-7.9, 8.1-8.11.
 * Does not execute abilities, React windows, opening-hand mulligan, AI or victory variants.
 */
(function(root,factory){'use strict';const deps=(typeof module!=='undefined'&&module.exports)?require('./battle-actions.js'):root.NCTV3Actions;const api=factory(deps);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3TurnPractice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(actions){'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const fail=reason=>({ok:false,reason});
 const ok=(state,message)=>({ok:true,state,message});
 const sides=[4,6,8,10,12,20];
 const unit=()=>({id:'practice-unit',name:'練習單位',type:'Unit',cost:2,power:2});
 const sale=()=>({id:'practice-sell',name:'練習資源卡',type:'Program',sellTag:true});
 const addCard=(deck,n)=>Array.from({length:n},(_,i)=>({...deck(),id:deck().id+'-'+i}));
 function fresh(){
  return {turn:'player',phase:'start',step:'ready',round:1,finished:false,
   player:{hand:[sale(),unit()],deck:addCard(sale,14),eddies:[{id:'opening-eddie',ready:true}],legends:[{id:'legend-1',ready:false,faceUp:false},{id:'legend-2',ready:false,faceUp:false},{id:'legend-3',ready:true,faceUp:false}],units:[],gigs:[],fixer:[...sides],soldThisTurn:false},
   ai:{hand:[],deck:[],eddies:[],legends:[],units:[],gigs:[],fixer:[],soldThisTurn:false}};
 }
 function ready(state){
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='ready')return fail('目前不是重置階段');
  const s=copy(state),p=s.player;
  if(s.round>1){for(const zone of ['eddies','legends','units'])for(const c of p[zone])c.ready=true;for(const u of p.units)u.lag=false;}
  s.step='draw';return ok(s,'準備階段：重置完成。');
 }
 function draw(state){
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='draw')return fail('必須先完成重置');
  const s=copy(state),p=s.player;
  if(!p.deck.length){s.finished=true;return ok(s,'牌庫已空：依一般規則抽牌失敗，遊戲結束。')}
  p.hand.push(p.deck.pop());s.step='roll';return ok(s,'抽取 1 張練習手牌。');
 }
 function roll(state,side,value){
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='roll')return fail('必須先完成抽牌');
  const s=copy(state),p=s.player;
  if(!p.fixer.includes(side))return fail('這顆骰子不在合事佬區');
  if(side===20&&p.fixer.length>1)return fail('d20 必須最後擲出');
  if(!Number.isInteger(value)||value<1||value>side)return fail('無效骰子點數');
  p.fixer.splice(p.fixer.indexOf(side),1);p.gigs.push({id:'gig-'+s.round,sides:side,value});s.phase='main';s.step='actions';
  return ok(s,'擲出 d'+side+'，點數 '+value+'；進入主要階段。');
 }
 function sell(state,id){
  if(!actions)return fail('支付模組未載入');
  const r=actions.sell(state,'player',id);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function play(state,id,payment,opts={}){
  if(!actions)return fail('支付模組未載入');
  const r=actions.playUnit(state,'player',id,payment,opts);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function gear(state,id,payment,targetId){
  if(!actions)return fail('支付模組未載入');
  const r=actions.playGear(state,'player',id,payment,targetId);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function program(state,id,payment,opts){
  if(!actions)return fail('支付模組未載入');
  const r=actions.playProgram(state,'player',id,payment,opts);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function pass(state){
  if(state.turn!=='player'||state.phase!=='main'||state.finished)return fail('只能在自己的主要階段結束回合');
  const s=copy(state);for(const unit of s.player.units)unit.lag=false;for(const side of ['player','ai']){for(const unit of s[side].units){unit.tempPowerModifier=0;}s[side].pendingRebootOptics=0;}s.turn='ai';s.phase='opponent';s.step='paused';return ok(s,'本回合結束；所有己方單位失去 Lag，對手行動尚未實作。');
 }
 function next(state){
  if(state.turn!=='ai'||state.phase!=='opponent')return fail('必須先結束我方回合');
  const s=copy(state);s.turn='player';s.phase='start';s.step='ready';s.round+=1;s.player.soldThisTurn=false;for(const u of s.ai.units)if(u.trainingTarget)u.ready=true;
  if(s.player.gigs.length>=7){s.finished=true;return ok(s,'回合開始持有至少 7 顆委託骰，符合一般勝利條件。')}
  return ok(s,'開始下一個我方回合（對手行動在此練習中略過）。');
 }
 return {fresh,ready,draw,roll,sell,play,gear,program,pass,next};
});
