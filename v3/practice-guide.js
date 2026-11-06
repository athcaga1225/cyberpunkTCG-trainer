/* Guidance reads the same state as the tabletop; it never changes game rules. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./battle-actions.js'):root.NCTV3Actions,typeof module!=='undefined'&&module.exports?require('./mirror-combat.js'):root.NCTV3Combat);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Guide=api;})(typeof globalThis!=='undefined'?globalThis:this,(A,C)=>{
 'use strict';
 const sources=s=>[...s.player.eddies.filter(c=>c.ready).map(c=>({kind:'eddie',id:c.id,label:'Eddie '+(s.player.eddies.indexOf(c)+1)})),...s.player.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({kind:'legend',id:c.id,label:c.name}))];
 const canAttack=u=>u.ready&&(!u.lag||u.goSolo)&&!u.deferredEffect&&!u.unimplementedEffect;
 function targets(s,u){
  if(s.ai.practiceBot?.kind==='mirror-the-heist'){const t=C.targets(s,'player',u?.id);return {...t,gigs:t.gigs&&(C.power(u)>0||u?.attackEffect||(u?.gear||[]).some(g=>g.attackEffect))};}
  if(!u||!canAttack(u))return {units:[],gigs:false};
  const units=s.ai.units.filter(d=>A.fightSpentUnit(s,'player',u.id,d.id,{reactionResolved:true}).ok).map(d=>d.id);
  const power=A.unitStats(u).power,count=power<=0?0:Math.min(s.ai.gigs.length,Math.floor(power/10)+1);
  const gigs=power>0&&A.stealTrainingGigs(s,'player',u.id,s.ai.gigs.slice(0,count).map(g=>g.id),{reactionResolved:true}).ok;
  return {units,gigs};
 }
 function next(s,{selectedId=null,payments=[],attackUnitId=null,selectedLegendId=null}={}){
  const hint=(stage,key,text)=>({stage,key,text});
  if(s.finished)return hint(6,'finished','練習已結束。可重新開局；目前仍是有限規則練習。');
  if(s.pendingEffects?.length)return hint(4,'effect','右側有待結算能力。先完成選卡、查看或調整，才能繼續攻擊、防守或交接回合。關閉引導不會略過能力。');
  if(selectedLegendId)return hint(4,'legend',s.phase==='react'?'防守時可支付 1 €$ 呼叫傳奇，每回合一次；Go Solo 僅能在自己的主要階段使用。':'在右側逐張選擇支付資源；蓋牌傳奇花 1 €$ 呼叫，已翻開的 V 可支付 5 €$ Go Solo。每回合只能呼叫一次。');
  if(s.phase==='pregame')return hint(1,'opening','選擇起始手牌與對手，擲 d20 後決定先後攻。');
  if(s.phase==='react'&&s.pendingAttack?.defendingSide==='player'){
   const card=C.quicks(s).find(c=>c.id===selectedId);
   if(card)return hint(5,'defense',payments.length===card.cost?'支付已指定。按「使用 Quick：'+card.name+'」，之後仍可攔截或結束反應。':'已選 '+card.name+'：請逐張指定 '+card.cost+' €$ 支付資源（已選 '+payments.length+'）。');
   if(!C.blockers(s).length&&!C.quicks(s).some(c=>c.cost<=sources(s).length))return hint(5,'defense','目前沒有可用的已支援反應。按「結束反應並結算」，繼續對手回合。');
   return hint(5,'defense','對手已宣告攻擊。可點選高亮的 Blocker 攔截，或選 Quick 手牌並支付；完成後按「結束反應並結算」。關閉此提示不會略過防守。');
  }
  if(s.turn==='ai')return hint(6,'opponent',s.ai.practiceBot?.kind==='mirror-the-heist'?'觀察鏡像對手：正在自動重置、抽牌、擲骰、變賣及出牌。':'固定腳本沒有自動行動，請略過至下一回合。');
  if(s.phase==='start')return hint(2,s.step,{ready:'點「重置資源」，開始準備階段。',draw:'點「抽 1 張」，將牌加入手牌。',roll:'點合事佬區的一顆骰子，再按右側「擲骰」。也可使用右側選單；d20 必須最後使用。'}[s.step]);
  const card=s.player.hand.find(c=>c.id===selectedId),available=sources(s);
  if(card){
   if(card.unimplementedEffect)return hint(4,'unsupported','此卡能力尚未支援。請取消選取並改選其他手牌。');
   if(!s.player.soldThisTurn&&card.sellTag)return hint(3,'sell','點「變賣」將此卡變成 Eddie；也可以逐一選擇資源支付出牌。');
   if(available.length<card.cost)return hint(3,'shortage','可用資源不足（'+available.length+'/'+card.cost+'）。'+(!s.player.soldThisTurn?'請改選有變賣標記的手牌變賣。':'本回合已變賣，可改選較低費用的牌或結束回合。'));
   if(payments.length!==card.cost)return hint(3,'payment','點選下方資源支付 '+card.cost+' €$（已選 '+payments.length+'）。每張資源支付 1 €$，確認出牌前不會消耗。');
   return hint(4,'play',card.type==='Gear'?'支付已選好，點選友方單位或下方裝備目標。':'支付已選好，確認必要的目標後，點「'+(card.type==='Unit'?'打出單位':'使用')+'」。');
  }
  const attacker=s.player.units.find(u=>u.id===attackUnitId);
  if(attacker&&!canAttack(attacker))return hint(4,'unavailable','此單位目前無法攻擊：'+(attacker.lag?'仍有 Lag。':!attacker.ready?'本回合已使用。':'攻擊能力尚未支援。')+'可改選其他單位或結束回合。');
  if(attacker&&!targets(s,attacker).units.length&&!targets(s,attacker).gigs)return hint(6,'end','此單位目前沒有可結算的攻擊目標，或場上有尚未支援的能力；可繼續出牌或結束回合。');
  if(attacker)return hint(5,'target','點對手已使用的單位或「攻擊委託區」。鏡像對手會自動使用已支援的防守反應；固定腳本則先選防守反應。');
  if(s.player.units.length){
   if(s.player.units.some(u=>{const t=targets(s,u);return t.units.length||t.gigs}))return hint(5,'attack','點選己方就緒單位，再指定對手目標；也可以繼續出牌或結束回合。');
   return hint(6,'end','單位已進場。本回合無可用攻擊目標或單位仍有 Lag；點「結束回合」觀察對手，也可繼續出牌。');
  }
  if(!s.player.soldThisTurn&&s.player.hand.some(c=>c.sellTag))return hint(3,'select-sale','點選高亮的有變賣標記手牌，再點「變賣」取得 Eddie。');
  if(s.player.hand.some(c=>c.type==='Unit'&&!c.unimplementedEffect&&c.cost<=available.length))return hint(4,'select-unit','點選高亮的可支付單位，再逐一指定支付資源。');
  return hint(6,'end','目前沒有可支付的單位。可選擇其他可用卡牌，或點「結束回合」。');
 }
 return {next,sources,canAttack,targets};
});
