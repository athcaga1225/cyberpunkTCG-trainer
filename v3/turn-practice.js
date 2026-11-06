/* V3 only: bounded two-player turn sequence for a BASIC PRACTICE, not official full-game play.
 * Official rules: https://cyberpunktcg.com/comprehensive-rules 7.7-7.9, 8.1-8.11.
 * Supports a bounded mirror opponent and explicit Quick/Blocker reactions.
 * Unverified triggers, Calling Legends, mulligan and Overtime remain unsupported.
 */
(function(root,factory){'use strict';const deps=(typeof module!=='undefined'&&module.exports)?require('./battle-actions.js'):root.NCTV3Actions;const combat=(typeof module!=='undefined'&&module.exports)?require('./mirror-combat.js'):root.NCTV3Combat;const api=factory(deps,combat);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3TurnPractice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(actions,combat){'use strict';
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
  const mirror=Boolean(s.ai.practiceBot?.kind==='mirror-the-heist');
  s.opening.scriptedOpponentTurnSkipped=!mirror&&firstPlayer==='ai';
  s.turn=mirror&&firstPlayer==='ai'?'ai':'player';
  s.phase=mirror&&firstPlayer==='ai'?'opponent':'start';
  s.step=mirror&&firstPlayer==='ai'?'pendingBot':'ready';
  s.round=1;
  for(const [index,legend] of s.player.legends.entries())legend.ready=firstPlayer!=='player'||index>=2;
  if(mirror)for(const [index,legend] of s.ai.legends.entries())legend.ready=firstPlayer!=='ai'||index>=2;
  if(mirror&&firstPlayer==='ai')return ok(s,'鏡像對手先攻：先執行其首回合，再由我方開始第一回合。');
  if(mirror)return ok(s,firstPlayer==='player'?'我方先攻：兩張傳奇卡已使用；完成後交給鏡像對手。':'我方後攻：鏡像對手須先完成首回合。');
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
  const s=copy(state);for(const unit of s.player.units)unit.lag=false;for(const side of ['player','ai']){for(const unit of s[side].units){unit.tempPowerModifier=0;}s[side].pendingRebootOptics=0;}s.turn='ai';s.phase='opponent';s.step=s.ai.practiceBot?.kind==='mirror-the-heist'?'pendingBot':'paused';return ok(s,s.step==='pendingBot'?'我方回合結束；輪到鏡像對手執行回合。':'本回合結束；所有己方單位失去 Lag，對手行動尚未實作。');
 }
 // One bounded automated opponent turn; uses real pay/sell/playUnit validators.
 // Attacks pause in the defender React Step; never bypass the human response.
 function opponentTurn(state,dieValue){
  if(state.finished||state.turn!=='ai'||state.phase!=='opponent'||state.step!=='pendingBot')
   return fail('目前不是對手回合');
  if(state.ai?.practiceBot?.kind!=='mirror-the-heist')return fail('此模式沒有自動測試對手');
  const s=copy(state),p=s.ai,notes=[];
  if(p.gigs.length>=7){
   s.finished=true;s.winner='ai';s.loser='player';
   return ok(s,'對手回合開始時持有至少 7 顆委託骰，對手獲勝。');
  }
  if(p.practiceBot.turnsTaken>0){
   for(const zone of ['eddies','legends','units'])for(const card of p[zone])card.ready=true;
  }
  for(const unit of p.units)unit.lag=false;
  notes.push('對手重置可重置的卡牌');
  if(!p.deck.length){
   s.finished=true;s.winner='player';s.loser='ai';
   return ok(s,'對手需要抽牌但牌庫已空，我方獲勝。');
  }
  p.hand.push(p.deck.pop());notes.push('抽牌 1 張');
  const side=p.fixer.find(d=>d!==20)??p.fixer[0];
  if(side!==undefined){
   if(!Number.isInteger(dieValue)||dieValue<1||dieValue>side)return fail('對手委託骰點數無效');
   p.fixer.splice(p.fixer.indexOf(side),1);
   p.gigs.push({id:'mirror-gig-'+p.practiceBot.turnsTaken,sides:side,value:dieValue});
   notes.push('擲出 d'+side+'（'+dieValue+'）');
  }
  s.phase='main';s.step='actions';
  const sale=p.hand.find(c=>c.sellTag&&c.id!=='training-quick-floor-it');
  if(sale){
   const sold=actions.sell(s,'ai',sale.id);
   if(sold.ok){Object.assign(s,sold.state);notes.push(...sold.events)}
  }
  const q=s.ai;
  const available=[...q.eddies.filter(x=>x.ready).map(x=>({kind:'eddie',id:x.id})),
    ...q.legends.filter(x=>x.ready&&(!x.faceUp||x.sellTag)).map(x=>({kind:'legend',id:x.id}))];
  // Only vanilla units with verified base deployment; no invented target decisions.
  const unit=q.hand.filter(c=>c.type==='Unit'&&!c.unimplementedEffect&&!c.requiresTarget&&
   !c.onPlaySpendRival&&!c.onPlayDefeatGear&&!c.onPlayGigAdjust&&!c.deferredEffect&&
   c.cost<=available.length).sort((a,b)=>b.cost-a.cost)[0];
  if(unit){
   const sources=available.slice(0,unit.cost);
   const played=actions.playUnit(s,'ai',unit.id,sources);
   if(played.ok){Object.assign(s,played.state);notes.push(...played.events)}
  }
  s.opponentNotes=notes;
  return continueOpponent(s);
 }
 function continueOpponent(state){
  const s=copy(state),notes=s.opponentNotes||[];
  if(s.finished)return ok(s,notes.join('；'));
  const planned=combat.plan(s,'ai');
  if(planned){
   const attack=combat.begin(s,'ai',planned.attackerId,planned.target);
   if(attack.ok)return ok(attack.state,[...notes,...attack.events].join('；'));
  }
  const limitation=combat.restriction(s);
  if(limitation)notes.push(limitation);
  delete s.opponentNotes;
  for(const zone of ['player','ai']){for(const unit of s[zone].units)unit.tempPowerModifier=0;s[zone].pendingRebootOptics=0;}
  for(const unit of s.ai.units)unit.lag=false;
  s.ai.practiceBot.turnsTaken++;
  s.ai.soldThisTurn=false;
  s.turn='player';s.phase='start';s.step='ready';s.player.soldThisTurn=false;
  if(!(s.opening?.first==='ai'&&s.ai.practiceBot.turnsTaken===1))s.round++;
  if(s.player.gigs.length>=7){
   s.finished=true;s.winner='player';s.loser='ai';
   notes.push('我方回合開始已有 7 顆委託骰，我方獲勝');
  }
  return ok(s,'鏡像對手完成回合：'+notes.join('；'));
 }
 function next(state){
  if(state.pendingAttack)return fail('請先完成防守反應');
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
  s.ai.hand.push({id:'training-quick-floor-it',name:'Floor It',type:'Program',cost:1,sellTag:true});
  s.ai.eddies.push(...Array.from({length:1},(_,i)=>({id:'training-quick-eddie-'+i,ready:true})));
  s.ai.deck.push({id:'training-quick-draw',name:'練習抽牌',type:'Unit'});
  return ok(s,'已配置對手 Floor It 與 1 €$；可在 React Step 選擇使用（非 AI）');
 }
 function reactAttack(state,attackerId,attack,reaction){
  if(state.ai?.practiceBot?.kind==='mirror-the-heist'){
   const declared=combat.begin(state,'player',attackerId,attack);if(!declared.ok)return declared;
   const resolved=combat.autoDefense(declared.state,attack?.gigIds);
   return resolved.ok?ok(resolved.state,[...declared.events,...resolved.events].join('；')):resolved;
  }
  if(!actions)return fail('對戰模組未載入');
  const r=actions.resolveTrainingReaction(state,'player',attackerId,attack,reaction);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function defend(state,action){
  const result=action?.kind==='end'?combat.end(state,'player'):combat.react(state,'player',action);
  if(!result.ok)return result;
  if(result.state.finished)return ok(result.state,result.events.join('；'));
  if(!result.state.pendingAttack){
   result.state.opponentNotes=[...result.events];
   const continued=continueOpponent(result.state);
   return continued;
  }
  return ok(result.state,result.events.join('；'));
 }
 return {fresh,rollForOrder,chooseOrder,ready,draw,roll,sell,play,gear,program,prepareTrainingTarget,fight,steal,addTrainingBlocker,addTrainingQuick,reactAttack,opponentTurn,defend,pass,next};
});
