'use strict';
const assert=require('node:assert/strict'),M=require('../v3/starter-match'),P=require('../v3/turn-practice');
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const good=r=>{assert(r.ok,r.reason);return r.state;};
const keys=['theHeist','embracingPower'],who=['player','ai'];
const snapshot=p=>[...p.hand,...p.deck].map(c=>({id:c.id,name:c.name})).sort((a,b)=>a.id.localeCompare(b.id));
const manifest=s=>Object.fromEntries(who.map(w=>[w,snapshot(s[w])]));
function verify(s,expected){
 assert.deepEqual(manifest(s),expected,'each owner keeps exactly their original forty physical cards');
 const ids=[];for(const w of who){assert.equal(s[w].hand.length,6);assert.equal(s[w].deck.length,34);assert.equal(s[w].legends.length,3);assert(s[w].legends.every(l=>!l.faceUp&&!l.knownToOwner));assert.equal(s[w].gigs.length,0);assert.equal(s[w].units.length,0);assert.equal(s[w].eddies.length,0);ids.push(...snapshot(s[w]).map(c=>c.id),...s[w].legends.map(l=>l.id));}
 assert.equal(new Set(ids).size,86,'no physical identity is duplicated across players or zones');
 assert.equal(s.ai.practiceBot.turnsTaken,0,'AI cannot act before opening confirmation');
}
let deals=0;
for(const own of keys)for(const rival of keys){
 const distinct={player:new Set(),ai:new Set()},legendOrders={player:new Set(),ai:new Set()};
 for(const first of who)for(const choice of ['keep','mulligan'])for(let seed=1;seed<=100;seed++){
  let s=M.fresh(own,{opponentDeckKey:rival});const expected=manifest(s),initial=JSON.stringify(s);let randomCalls=0;
  const rng=seeded(seed),random=()=>{randomCalls++;return rng();};
  assert.equal(P.ready(s).ok,false);assert.equal(P.openingHand(s,choice).ok,false);assert.equal(P.beginOpening(s).ok,false);assert.equal(JSON.stringify(s),initial);
  const tied=good(P.rollForOrder(s,10,10));assert.equal(tied.opening.winner,null);assert.equal(tied.player.hand.length+tied.ai.hand.length,0);assert.equal(P.chooseOrder(tied,first,random).ok,false);assert.equal(randomCalls,0);
  s=good(P.rollForOrder(s,20,1));s=good(P.chooseOrder(s,first,random));verify(s,expected);
  assert.equal(s.opening.first,first);if(first==='ai')assert(['keep','mulligan'].includes(s.opening.handDecisions.ai));else assert.equal(s.opening.handDecisions.ai,null);
  for(const w of who){assert.deepEqual(s[w].legends.map(l=>l.ready),w===first?[false,false,true]:[true,true,true]);distinct[w].add(s[w].hand.map(c=>c.id).join());legendOrders[w].add(s[w].legends.map(l=>l.id).join());}
  const old=JSON.stringify(s),rivalBefore=JSON.stringify(s.ai),rivalDecision=s.opening.handDecisions.ai,rivalLegends=JSON.stringify(s.ai.legends),legendsBefore=JSON.stringify(s.player.legends),handBefore=JSON.stringify(s.player.hand),deckBefore=JSON.stringify(s.player.deck);
  const r=P.openingHand(s,choice,seeded(seed+1000));assert.equal(JSON.stringify(s),old,'opening command does not mutate its input');s=good(r);verify(s,expected);
  if(rivalDecision!==null||s.opening.handDecisions.ai==='keep')assert.equal(JSON.stringify(s.ai),rivalBefore,'an already decided rival hand never changes again');assert.equal(JSON.stringify(s.ai.legends),rivalLegends);assert.equal(JSON.stringify(s.player.legends),legendsBefore);
  assert.equal(s.opening.mulliganUsed.player,choice==='mulligan');assert(['keep','mulligan'].includes(s.opening.handDecisions.ai));assert.equal(s.opening.mulliganUsed.ai,s.opening.handDecisions.ai==='mulligan');
  if(choice==='keep'){assert.equal(JSON.stringify(s.player.hand),handBefore);assert.equal(JSON.stringify(s.player.deck),deckBefore);}
  const confirmed=JSON.stringify(s);for(const next of ['keep','mulligan','partial'])assert.equal(P.openingHand(s,next).ok,false);assert.equal(P.chooseOrder(s,'player').ok,false);assert.equal(P.rollForOrder(s,1,20).ok,false);assert.equal(P.ready(s).ok,false);assert.equal(JSON.stringify(s),confirmed);
  s=good(P.beginOpening(s));assert.equal(s.turn,first);assert.equal(s.opening.resolved,true);assert.equal(s.step,first==='player'?'ready':'pendingBot');assert.equal(P.beginOpening(s).ok,false);assert.equal(P.openingHand(s,choice).ok,false);
  if(first==='player'){s=good(P.ready(s));assert.deepEqual(s.player.legends.map(l=>l.ready),[false,false,true]);s=good(P.draw(s));assert.equal(s.player.hand.length,7);assert.equal(s.player.deck.length,33);}
  const restarted=M.fresh(own,{opponentDeckKey:rival});assert.deepEqual(manifest(restarted),expected);assert.equal(restarted.opening.winner,null);assert.equal(restarted.player.hand.length+restarted.ai.hand.length,0);assert.equal(restarted.player.deck.length+restarted.ai.deck.length,80);assert.equal(restarted.finished,false);deals++;
 }
 for(const w of who){assert(distinct[w].size>=90,'both real decks vary across seeds');assert.equal(legendOrders[w].size,6,'all six hidden Legend orders occur');}
 console.log('PASS opening matrix: '+own+' / '+rival+'; both orders, keep/Mulligan and 100 seeds per branch');
}
// A legal redraw may include every card from the original hand: do not bias the shuffle to force new cards.
let s=good(P.chooseOrder(good(P.rollForOrder(M.fresh(),20,1)),'player',()=>.999999));const originalIds=s.player.hand.map(c=>c.id).sort();s=good(P.openingHand(s,'mulligan',()=>.999999));assert.deepEqual(s.player.hand.map(c=>c.id).sort(),originalIds);assert.equal(s.opening.mulliganUsed.player,true);
console.log('PASS '+deals+' opening flows: exact independent manifests, hidden Legends, first-turn readiness, no premature bot actions, immutable/one-time choices, clean restart, and legal repeat cards on Mulligan.');
