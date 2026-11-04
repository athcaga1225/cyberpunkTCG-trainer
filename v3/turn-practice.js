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
 // Rule 7.5: a randomized winner chooses whether to play first or second.
 // The rival is scripted, so its initial turn is explicitly skipped when it goes first.
 function rollForOrder(state,playerRoll,rivalRoll){
  if(state.phase!=='pregame'||state.opening?.resolved)return fail('先後攻已決定');
  if(!Number.isInteger(playerRoll)||playerRoll<1||playerRoll>20||
     !Number.isInteger(rivalRoll)||rivalRoll<1||rivalRoll>20)return fail('d20 點數必須為 1 到 20');
  const s=copy(state);
  if(playerRoll===rivalRoll)return ok(s,'雙方 d20 同點，請重新擲骰');
  s.opening={resolved:false,playerRoll,rivalRoll,winner:playerRoll>rivalRoll?'player':'ai'};
  return ok(s,'先後攻擲骰：我方 '+playerRoll+'、對手 '+rivalRoll+'；'+(s.opening.winner==='player'?'由我方選先後攻。':'由腳本對手決定先後攻。'));
 }
 function chooseOrder(state,firstPlayer){
  if(state.phase!=='pregame'||state.opening?.resolved||!state.opening?.winner)return fail('請先擲骰決定選擇權');
  if(firstPlayer!=='player'&&firstPlayer!=='ai')return fail('先攻選擇無效');
  // No opponent decision engine exists: the scripted defender always picks first.
  if(state.opening.winner==='ai'&&firstPlayer!=='ai')return fail('本練習的腳本對手取得選擇權後固定選擇先攻');
  const s=copy(state);
  s.opening.resolved=true;s.opening.first=firstPlayer;
  s.opening.scriptedOpponentTurnSkipped=firstPlayer==='ai';
  s.turn='player';s.phase='start';s.step='ready';s.round=1;
  for(const [index,legend] of s.player.legends.entries())legend.ready=firstPlayer!=='player'||index>=2;
  return ok(s,firstPlayer==='player'?'我方先攻：左側兩張傳奇卡已使用，第一回合不能重置。':'腳本對手先攻：目前沒有 AI 回合，已明確略過對手第一回合；我方後攻，三張傳奇卡保持就緒。');
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
 function prepareTrainingTarget(state,targetId){
  if(state.finished||state.turn!=='player'||state.phase!=='main'||state.practiceKind!=='the-heist')
   return fail('只能在 The Heist 主要階段設定練習目標');
  const target=state.ai?.units?.find(u=>u.id===targetId&&u.trainingTarget);
  if(!target)return fail('找不到練習單位');
  const s=copy(state);s.ai.units.find(u=>u.id===targetId).ready=false;
  return ok(s,'練習設定：對手 '+target.name+' 改為已使用（非 AI 行動）');
 }
 function fight(state,attackerId,defenderId){
  if(!actions)return fail('對戰模組未載入');
  const r=actions.fightSpentUnit(state,'player',attackerId,defenderId);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function steal(state,attackerId,gigIds){
  if(!actions)return fail('對戰模組未載入');
  const r=actions.stealTrainingGigs(state,'player',attackerId,gigIds);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function addTrainingBlocker(state){
  if(state.practiceKind!=='the-heist'||state.phase!=='main'||state.turn!=='player'||state.finished)
   return fail('只能在 The Heist 主要階段加入攔截練習');
  if(state.ai.units.some(u=>u.trainingBlocker))return fail('已有攔截練習單位');
  const s=copy(state);
  s.ai.units.push({id:'training-blocker-bombus',name:'Secondhand Bombus',type:'Unit',power:0,ready:true,lag:false,blocker:true,trainingTarget:true,trainingBlocker:true,gear:[]});
  return ok(s,'已加入腳本 Blocker：防守反應可選擇攔截或不攔截（非 AI 行動）');
 }
 function addTrainingQuick(state){
  if(state.practiceKind!=='the-heist'||state.phase!=='main'||state.turn!=='player'||state.finished)
   return fail('只能在 The Heist 主要階段加入 Quick 練習');
  if(state.ai.quickExercise?.enabled)return fail('已有 Quick 練習');
  const s=copy(state);
  s.ai.quickExercise={enabled:true};
  s.ai.hand.push({id:'training-quick-floor-it',name:'Floor It',type:'Program',cost:3,sellTag:true});
  s.ai.eddies.push(...Array.from({length:3},(_,i)=>({id:'training-quick-eddie-'+i,ready:true})));
  s.ai.deck.push({id:'training-quick-draw',name:'練習抽牌',type:'Unit'});
  return ok(s,'已配置對手 Floor It 與 3 €$；可在 React Step 選擇使用（非 AI）');
 }
 function reactAttack(state,attackerId,attack,reaction){
  if(!actions)return fail('對戰模組未載入');
  const r=actions.resolveTrainingReaction(state,'player',attackerId,attack,reaction);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 return {fresh,rollForOrder,chooseOrder,ready,draw,roll,sell,play,gear,program,prepareTrainingTarget,fight,steal,addTrainingBlocker,addTrainingQuick,reactAttack,pass,next};
});
