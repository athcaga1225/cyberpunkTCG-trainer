'use strict';
const assert=require('node:assert/strict'),M=require('../v3/starter-match'),P=require('../v3/turn-practice');
const good=r=>{assert(r.ok,r.reason);return r.state;},identity=()=>.999999;
function prepare(names,deck='theHeist'){
 const s=M.fresh(deck),cards=[...s.ai.deck],hand=[];
 for(const name of names){const i=cards.findIndex(c=>c.name===name);assert(i>=0,name+' exists in actual manifest');hand.push(cards.splice(i,1)[0]);}
 s.ai.deck=[...cards,...hand.reverse()];return good(P.rollForOrder(s,20,1));
}
const allPrograms=['Floor It','Floor It','Floor It',"Afterparty at Lizzie's","Afterparty at Lizzie's",'Reboot Optics'];
const cheap=['Dexter DeShawn: One Last Chance','Kiroshi Optics','Mandibular Upgrade','Floor It',"Afterparty at Lizzie's",'Reboot Optics'];
const medium=['Offduty Malfini','Kiroshi Optics','Mandibular Upgrade','Floor It',"Afterparty at Lizzie's",'Reboot Optics'];
const noCash=['Dexter DeShawn: One Last Chance','Secondhand Bombus','Secondhand Bombus','Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Offduty Malfini'];
const identities=p=>[...p.hand,...p.deck].map(c=>c.id).sort();
for(const names of [allPrograms,cheap,medium,noCash])for(const first of ['player','ai']){
 const base=prepare(names),before=JSON.stringify(base),inventory=identities(base.ai);let calls=0;const random=()=>{calls++;return identity();};
 let s=good(P.chooseOrder(base,first,random));assert.equal(JSON.stringify(base),before);
 const expected=names===cheap||names===medium&&first==='player'?'keep':'mulligan';
 const alreadyDecided=first==='ai',callsAfterDeal=calls;assert.equal(s.opening.handDecisions.ai,alreadyDecided?expected:null);
 assert.equal(calls,alreadyDecided&&expected==='mulligan'?121:82,'each full shuffle is bounded; no repeated hunt for a better hand');
 const aiBefore=JSON.stringify(s.ai),myBefore=JSON.stringify(s.player),legendBefore=JSON.stringify(s.ai.legends);
 s=good(P.openingHand(s,'keep',random));assert.equal(s.opening.handDecisions.ai,expected);assert.equal(s.opening.mulliganUsed.ai,expected==='mulligan');assert.equal(JSON.stringify(s.player),myBefore,'bot decision never changes human cards');assert.equal(JSON.stringify(s.ai.legends),legendBefore);assert.deepEqual(identities(s.ai),inventory);assert.equal(s.ai.hand.length,6);assert.equal(s.ai.deck.length,34);
 if(alreadyDecided||expected==='keep')assert.equal(JSON.stringify(s.ai),aiBefore);assert.equal(calls-callsAfterDeal,!alreadyDecided&&expected==='mulligan'?39:0);
 if(names===allPrograms)assert(s.ai.hand.every(c=>c.type==='Program'),'accept even a second weak hand after the single legal redraw');
 const final=JSON.stringify(s);assert.equal(P.openingHand(s,'mulligan',random).ok,false);assert.equal(JSON.stringify(s),final);
}
// A sold Unit cannot also be the Unit to play: two distinct cards are required.
let s=good(P.chooseOrder(prepare(['MT0D12 Flathead','MT0D12 Flathead','Heywood Ripperdoc','Heywood Ripperdoc','T-Bug: Amateur Philosopher','T-Bug: Amateur Philosopher']),'player',identity));s.ai.hand.forEach(c=>{c.sellTag=false;c.cost=6});Object.assign(s.ai.hand[0],{cost:2,sellTag:true});s=good(P.openingHand(s,'keep',identity));assert.equal(s.opening.handDecisions.ai,'mulligan');
// All own-hand decisions are independent of rival hand, rival deck, and either hidden Legend order.
for(const humanChoice of ['keep','mulligan']){
 const a=good(P.chooseOrder(prepare(allPrograms),'player',identity)),b=JSON.parse(JSON.stringify(a));
 [b.player.hand[0],b.player.deck[0]]=[b.player.deck[0],b.player.hand[0]];b.player.deck.reverse();b.player.legends.reverse();b.ai.legends.reverse();
 const r1=good(P.openingHand(a,humanChoice,identity)),r2=good(P.openingHand(b,humanChoice,identity));assert.equal(r1.opening.handDecisions.ai,r2.opening.handDecisions.ai);assert.deepEqual(r1.ai.hand,r2.ai.hand);assert.deepEqual(r1.ai.deck,r2.ai.deck);
 const c=JSON.parse(JSON.stringify(a));c.ai.deck.reverse();assert.equal(good(P.openingHand(c,humanChoice,identity)).opening.handDecisions.ai,r1.opening.handDecisions.ai,'never peek at own future draws to decide');
}
// Both players may use one Mulligan; each full redraw consumes exactly one shuffle.
s=good(P.chooseOrder(prepare(allPrograms),'player',identity));let redrawCalls=0;s=good(P.openingHand(s,'mulligan',()=>{redrawCalls++;return identity();}));assert.deepEqual(s.opening.mulliganUsed,{player:true,ai:true});assert.equal(redrawCalls,78);
// EP uses the same strategy with its real starter cards.
const epGood=['Ruthless Lowlife','Industrial Assembly','Field Operator','Chrome Fang','Minotaur','Swordwise Huscle'];
s=good(P.chooseOrder(prepare(epGood,'embracingPower'),'ai',identity));assert.equal(s.opening.handDecisions.ai,'keep');
s=good(P.chooseOrder(prepare(['Chrome Fang','Chrome Fang','Minotaur','Minotaur','Arasaka Emergency Radioport','Arasaka Emergency Radioport'],'embracingPower'),'ai',identity));assert.equal(s.opening.handDecisions.ai,'mulligan');
// Fixed exercises retain their predetermined setup and never enter Mulligan strategy.
s=M.fresh('theHeist',{scenario:'basic'});const fixed=JSON.stringify(s.ai.hand);s=good(P.chooseOrder(good(P.rollForOrder(s,20,1)),'player',identity));assert.equal(JSON.stringify(s.ai.hand),fixed);assert.equal(s.opening.handDecisions,undefined);
console.log('PASS AI opening: distinct sale + cheap Unit, first/second thresholds, keep and redraw, positional decisions, exactly one full shuffle, accept weak redraw, immutable owner inventories and Legends, no hidden/future-card dependence, both starters and fixed exercises.');
