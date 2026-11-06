/* V3 mirror combat subset. Official rules 2.10, 9.3-9.29, 11.24, 11.26.
 * https://cyberpunktcg.com/comprehensive-rules
 * https://cyberpunktcg.com/cards/floor-it (cost 1)
 * https://cyberpunktcg.com/cards/reboot-optics (cost 2)
 * Reject unimplemented field/gear triggers; known Legend and Attack effects use a pending-choice queue.
 */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./battle-actions.js'):root.NCTV3Actions,typeof module!=='undefined'&&module.exports?require('./heist-effects.js'):root.NCTV3Effects);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Combat=api;})(typeof globalThis!=='undefined'?globalThis:this,(A,E)=>{
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x)),other=who=>who==='player'?'ai':'player';
 const fail=reason=>({ok:false,reason}),ok=(state,events)=>({ok:true,state,events});
 const mirror=s=>s.practiceKind==='the-heist'&&s.ai?.practiceBot?.kind==='mirror-the-heist';
 const supported=u=>!u.deferredEffect&&!u.unimplementedEffect&&!(u.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect);
 const power=u=>Math.max(0,A.unitStats(u).power);
 function restriction(s){
  if(!mirror(s))return '此戰鬥流程僅適用 The Heist 鏡像對手';
  if(['player','ai'].some(w=>s[w].units.some(u=>!supported(u))||s[w].legends.some(l=>l.faceUp&&!E.knownLegend(l))))return '場上含尚未支援的能力（如橫置裝備觸發），暫不結算鏡像戰鬥';
  return null;
 }
 function targets(s,who,id){
  if(!['player','ai'].includes(who)||s.finished||s.pendingAttack||E.pending(s)||s.turn!==who||s.phase!=='main'||restriction(s))return {units:[],gigs:false};
  const u=s[who].units.find(u=>u.id===id);
  if(!u||!u.ready||(u.lag&&!u.goSolo)||!supported(u))return {units:[],gigs:false};
  return {units:s[other(who)].units.filter(d=>!d.ready&&supported(d)).map(d=>d.id),gigs:s[other(who)].gigs.length>0};
 }
 function begin(s,who,id,target){
  const legal=targets(s,who,id);
  if(!target||!['gig','unit'].includes(target.kind)||(target.kind==='gig'&&!legal.gigs)||(target.kind==='unit'&&!legal.units.includes(target.defenderId)))return fail(restriction(s)||'攻擊者或目標目前不合法（需就緒、沒有 Lag，且對手單位必須已使用）');
  const next=clone(s),rival=other(who),u=next[who].units.find(u=>u.id===id);
  E.spend(next,who,u);next.phase='react';next.step='defense';
  next.pendingAttack={attackingSide:who,defendingSide:rival,attackerId:id,target:target.kind==='gig'?{kind:'gig'}:{kind:'unit',defenderId:target.defenderId},preferredGigIds:target.gigIds};
  E.attack(next,who,u);
  const events=[];E.pump(next,events);
  return ok(next,[u.name+' 宣告攻擊 '+(target.kind==='gig'?'委託區':next[rival].units.find(d=>d.id===target.defenderId).name),...events,...(!next.finished?['先完成待結算能力，再處理防守反應']:[])]);
 }
 function context(s){
  const p=s.pendingAttack;
  return !s.finished&&!E.pending(s)&&s.phase==='react'&&p&&s.turn===p.attackingSide&&s[p.attackingSide]?.units.some(u=>u.id===p.attackerId)?p:null;
 }
 function blockers(s){
  const p=context(s);if(!p||restriction(s))return [];
  const attacker=s[p.attackingSide].units.find(u=>u.id===p.attackerId);
  if(attacker?.cannotBeBlockedIfLowerCred&&E.cred(s,p.attackingSide)<E.cred(s,p.defendingSide))return [];
  return s[p.defendingSide].units.filter(u=>u.ready&&!u.lag&&supported(u)&&A.unitStats(u).blocker);
 }
 function quicks(s){
  const p=context(s);if(!p)return [];
  return s[p.defendingSide].hand.filter(c=>c.type==='Program'&&!c.unimplementedEffect&&['Floor It','Reboot Optics'].includes(c.name));
 }
 function react(s,who,action){
  const p=context(s);if(!p||p.defendingSide!==who)return fail('目前不是你的防守反應時機');
  if(restriction(s))return fail(restriction(s));
  if(action?.kind==='block'){
   const b=blockers(s).find(u=>u.id===action.blockerId);if(!b)return fail('只能使用就緒、沒有 Lag 且效果已支援的 Blocker');
   const next=clone(s);E.spend(next,who,next[who].units.find(u=>u.id===b.id));next.pendingAttack.target={kind:'unit',defenderId:b.id};
   const events=['Blocker：'+b.name+' 已橫置，攻擊轉向它；你仍可繼續使用 Quick 或其他攔截'];E.pump(next,events);return ok(next,events);
  }
  if(action?.kind!=='quick')return fail('請選擇 Quick、Blocker，或結束反應');
  const card=quicks(s).find(c=>c.id===action.cardId);if(!card)return fail('此卡不是目前支援的 Quick');
  const target=action.rivalUnitId||p.attackerId;
  if(card.name==='Floor It'&&!s[p.attackingSide].units.some(u=>u.id===target))return fail('Floor It 必須指定一張對手單位');
  const payment=A.pay(s,who,card.cost,action.sources);if(!payment.ok)return payment;
  const next=payment.state,q=next[who];q.hand.splice(q.hand.findIndex(c=>c.id===card.id),1);q.trash=q.trash||[];q.trash.push(card);
  if(card.name==='Floor It'){
   const u=next[p.attackingSide].units.find(u=>u.id===target);u.tempPowerModifier=(u.tempPowerModifier||0)-1;
   if(!q.deck.length){E.finish(next,other(who),'empty-deck',payment.events);return ok(next,[...payment.events,'Floor It 抽牌時牌庫已空，遊戲結束']);}
   q.hand.push(q.deck.pop());
  }else q.pendingRebootOptics=(q.pendingRebootOptics||0)+1;
  E.pump(next,payment.events);return ok(next,[...payment.events,'Quick：'+card.name+(card.name==='Floor It'?'，指定對手單位本回合戰力 -1，抽 1 張':'，本回合下一次對手單位交戰時保護己方單位'),...(!next.finished?['防守反應尚未結束']:[])]);
 }
 function end(s,who,gigIds){
  const p=context(s);if(!p||p.defendingSide!==who)return fail('目前不是你的防守反應時機');
  if(restriction(s))return fail(restriction(s));
  const next=clone(s),attack=next.pendingAttack,attacker=next[attack.attackingSide].units.find(u=>u.id===attack.attackerId),rival=next[who],owner=next[attack.attackingSide],events=[];
  if(attack.target.kind==='unit'){
   const defender=rival.units.find(u=>u.id===attack.target.defenderId);
   if(!defender){events.push('防守單位已離場，攻擊結束');}
   else{
    const ap=power(attacker),dp=power(defender),protectAttacker=owner.pendingRebootOptics>0,protectDefender=rival.pendingRebootOptics>0;
    owner.pendingRebootOptics=0;rival.pendingRebootOptics=0;
    const defeat=(who,u)=>{const q=next[who];q.units=q.units.filter(c=>c.id!==u.id);q.trash=q.trash||[];if(u.type==='Legend'){(q.removed??=[]).push({...u,gear:[]});q.trash.push(...(u.gear||[]));}else q.trash.push({...u,gear:[]},...(u.gear||[]));E.defeated(next,who,u);events.push('擊敗 '+u.name);};
    events.push('單位交戰：'+attacker.name+' '+ap+' PWR vs '+defender.name+' '+dp+' PWR');
    if(ap<=dp&&dp>0&&!protectAttacker)defeat(attack.attackingSide,attacker);
    if(dp<=ap&&ap>0&&!protectDefender)defeat(who,defender);
    if(protectAttacker||protectDefender)events.push('Reboot Optics 保護已套用並消耗；勝負仍依戰力比較');
   }
  }else{
   const count=power(attacker)<=0?0:Math.min(rival.gigs.length,Math.floor(power(attacker)/10)+1);
   const ids=gigIds===undefined?rival.gigs.slice().sort((a,b)=>b.value-a.value).slice(0,count).map(g=>g.id):gigIds;
   if(!Array.isArray(ids)||ids.length!==count||new Set(ids).size!==count||ids.some(id=>!rival.gigs.some(g=>g.id===id)))return fail('反應結束後，請選擇正確數量且不重複的委託骰：'+count+' 顆');
   const stolen=rival.gigs.filter(g=>ids.includes(g.id));rival.gigs=rival.gigs.filter(g=>!ids.includes(g.id));owner.gigs.push(...stolen);if(stolen.length)attacker.stoleGigThisTurn=true;
   events.push(attacker.name+' 搶得 '+stolen.length+' 顆委託骰（點數保持不變）');E.checkVictory(next,null,events);
  }
  if(!next.finished){next.pendingAttack=null;next.phase='main';next.step='actions';E.pump(next,events);}
  return ok(next,events);
 }
 function plan(s,who){
  if(restriction(s))return null;
  for(const u of s[who].units.slice().sort((a,b)=>power(b)-power(a))){
   if(power(u)<=0)continue;
   const legal=targets(s,who,u.id),weak=s[other(who)].units.find(d=>legal.units.includes(d.id)&&power(d)<power(u));
   if(weak)return {attackerId:u.id,target:{kind:'unit',defenderId:weak.id}};
   if(legal.gigs)return {attackerId:u.id,target:{kind:'gig'}};
  }
  return null;
 }
 function autoDefense(s,preferredGigIds){
  const p=context(s);if(!p||p.defendingSide!=='ai')return fail('目前不是鏡像對手的防守時機');
  let current=s,events=[];
  const sources=cost=>[...current.ai.eddies.filter(c=>c.ready).map(c=>({kind:'eddie',id:c.id})),...current.ai.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({kind:'legend',id:c.id}))].slice(0,cost);
  for(const c of quicks(current).filter(c=>c.name==='Floor It')){
   if(power(current.player.units.find(u=>u.id===p.attackerId))<=0)break;
   const r=react(current,'ai',{kind:'quick',cardId:c.id,sources:sources(c.cost)});if(r.ok){current=r.state;events.push(...r.events);}if(current.finished||E.pending(current))return ok(current,events);
  }
  const b=blockers(current).sort((a,b)=>power(b)-power(a))[0];
  if(b){const r=react(current,'ai',{kind:'block',blockerId:b.id});current=r.state;events.push(...r.events);if(current.finished||E.pending(current))return ok(current,events);}
  if(current.pendingAttack.target.kind==='unit'){
   const c=quicks(current).find(c=>c.name==='Reboot Optics');
   if(c){const r=react(current,'ai',{kind:'quick',cardId:c.id,sources:sources(c.cost)});if(r.ok){current=r.state;events.push(...r.events);if(current.finished||E.pending(current))return ok(current,events);}}
  }
  let ids;
  if(current.pendingAttack.target.kind==='gig'){
   const a=current.player.units.find(u=>u.id===p.attackerId),count=power(a)<=0?0:Math.min(current.ai.gigs.length,Math.floor(power(a)/10)+1);
   ids=[...new Set([...(preferredGigIds||[]),...current.ai.gigs.map(g=>g.id)])].filter(id=>current.ai.gigs.some(g=>g.id===id)).slice(0,count);
  }
  const resolved=end(current,'ai',ids);return resolved.ok?ok(resolved.state,[...events,...resolved.events]):resolved;
 }
 return {targets,begin,react,end,blockers,quicks,plan,autoDefense,restriction,power};
});
