/* Partial official-rules engine. Verified mechanic subset, NOT full gameplay.
   Sources: https://cyberpunktcg.com/gameplay-guide and /comprehensive-rules
   Missing: payment engine, Quick reaction windows, arbitrary triggered effects,
   full deck construction, Legend calls, RAM, effect stacking, player decisions. */
(function(root,factory){'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTRules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const copy=value=>JSON.parse(JSON.stringify(value));
const rival=who=>who==='player'?'ai':'player';
const power=unit=>Math.max(0,Number(unit.power||0)+(unit.gear||[]).reduce((n,g)=>n+Number(g.power||0),0));
const cred=gigs=>gigs.length?gigs.reduce((n,d)=>n+Number(d.value),0):null;
const steals=p=>p<=0?0:Math.floor(p/10)+1;
const fail=reason=>({ok:false,reason});
const success=(state,events)=>({ok:true,state,events});
const targetAttack=(unit,defender,target)=>{
 if(!unit)return '找不到攻擊單位';
 if(unit.ready===false)return '角色已使用（Spent），尚未恢復就緒，不能再次攻擊';
 if(unit.lag)return '角色剛登場，有 Lag 限制：這個回合不能攻擊';
 if(!target||!['unit','gig'].includes(target.kind))return '請選擇有效攻擊目標';
 if(target.kind==='gig'){if(unit.name==='Ruthless Lowlife')return '狠毒混混（Ruthless Lowlife）只能攻擊對手的角色';if(!defender.gigs.length)return '對手委託區沒有委託骰，無法攻擊該區';}
 if(target.kind==='unit'){const t=defender.units.find(x=>x.id===target.id);if(!t)return '敵方單位不存在';if(t.ready!==false)return '一般只能主動攻擊對手已使用（Spent）的角色';}
 return null;
};
function fight(state,who,attackerId,defenderId,events){const ours=state[who],theirs=state[rival(who)],a=ours.units.find(x=>x.id===attackerId),b=theirs.units.find(x=>x.id===defenderId);const ap=power(a),bp=power(b);events.push('Fight：'+ap+' Power 對 '+bp+' Power');if(ap>=bp){theirs.units=theirs.units.filter(x=>x.id!==b.id);events.push('敵方單位被擊敗')}if(ap<=bp){ours.units=ours.units.filter(x=>x.id!==a.id);events.push('我方單位被擊敗')}return events;}
function attack(state,who,attackerId,target,options={}){
 const s=copy(state),ours=s[who],theirs=s[rival(who)];if(!ours||!theirs)return fail('玩家資料不完整');const unit=ours.units.find(x=>x.id===attackerId);
 const reason=targetAttack(unit,theirs,target);if(reason)return fail(reason);
 const blocker=options.blockWithId?theirs.units.find(x=>x.id===options.blockWithId):null;
 if(options.blockWithId){if(target.kind!=='gig'||!blocker||!blocker.blocker||blocker.ready===false||blocker.lag)return fail('所選攔截角色（Blocker）目前不能攔截');}
 if(target.kind==='gig'&&!blocker){const count=Math.min(steals(power(unit)),theirs.gigs.length);
  const picks=options.dieIds??theirs.gigs.slice(0,count).map(d=>d.id);
  if(picks.length!==count||new Set(picks).size!==picks.length||picks.some(id=>!theirs.gigs.some(d=>d.id===id)))return fail('請選擇 '+count+' 顆不同的對手委託骰');
 }
 unit.ready=false;const events=['角色宣告攻擊，橫置成為已使用（Spent）'];
 if(blocker){blocker.ready=false;events.push('攔截（Blocker）成功，改為角色交戰（Fight），這次不能搶委託骰');fight(s,who,unit.id,blocker.id,events);}
 else if(target.kind==='unit'){fight(s,who,unit.id,target.id,events);}
 else{const n=Math.min(steals(power(unit)),theirs.gigs.length);const ids=options.dieIds??theirs.gigs.slice(0,n).map(d=>d.id);const set=new Set(ids);const moved=theirs.gigs.filter(d=>set.has(d.id));theirs.gigs=theirs.gigs.filter(d=>!set.has(d.id));ours.gigs.push(...moved);events.push('成功搶走 '+moved.length+' 顆委託骰');}
 return success(s,events);
}
function rollIn(state,who,sides,rolled){const s=copy(state),p=s[who];if(!p||!Array.isArray(p.fixer))return fail('合事佬區（Fixer Area）資料不完整');if(!p.fixer.includes(sides))return fail('這顆骰子不在合事佬區');if(sides===20&&p.fixer.length>1)return fail('20 面骰（d20）必須留到最後才能擲出');if(!Number.isInteger(rolled)||rolled<1||rolled>sides)return fail('骰子點數必須在有效範圍');p.fixer.splice(p.fixer.indexOf(sides),1);p.gigs.push({id:'roll-'+sides+'-'+p.gigs.length,sides,value:rolled});return success(s,['從合事佬區擲出 '+({4:'四面骰',6:'六面骰',8:'八面骰',10:'十面骰',12:'十二面骰',20:'二十面骰'}[sides]||sides+'面骰')+'（d'+sides+'），點數 '+rolled]);}
function startWin(state,who){const p=state[who];return !!p&&p.gigs.length>=7;}
function playTrigger(state,who,card,targetId){const s=copy(state),p=s[who],opp=s[rival(who)];if(!p||!opp)return fail('玩家資料不完整');const events=[];if(card.name==='Field Operator'&&cred(p.gigs)!==null&&cred(p.gigs)%2===0){if(!p.deck.length)return fail('必須抽牌但牌庫已空：依官方規則判負');p.hand.push(p.deck.pop());events.push('外勤幹員：街頭聲望為偶數，抽 1 張牌');}else if(card.name==='Minotaur'&&cred(p.gigs)!==null&&(cred(opp.gigs)===null||cred(p.gigs)>cred(opp.gigs))){const target=opp.units.find(x=>x.id===targetId&&power(x)<=5);if(target){opp.units=opp.units.filter(x=>x.id!==target.id);events.push('牛頭怪登場能力擊敗戰力 5 以下的對手角色');}else events.push('牛頭怪符合發動條件，但沒有指定有效目標');}else events.push('此條件下未觸發額外能力');return success(s,events);}
function endTurnGear(state,who){const s=copy(state);const events=[];for(const u of s[who].units){u.lag=false;if((u.gear||[]).some(g=>g.name==='Sandevistan')){u.ready=true;events.push(u.name+' 因 Sandevistan 恢復就緒（Ready）');}}return success(s,events);}
return {power,cred,steals,targetAttack,attack,rollIn,startWin,playTrigger,endTurnGear};
});