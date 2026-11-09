'use strict';
const assert = require('node:assert/strict');
const H = process.env.V3_TEST_DECK==='embracingPower'?require('../v3/embracing-practice'):require('../v3/heist-practice');
const P = require('../v3/turn-practice');
const E = require('../v3/heist-effects');
const C = require('../v3/mirror-combat');

function random(seed) {
 let n = seed;
 return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}
function checkInventory(s) {
 const dice = [], gigIds = [];
 for (const who of ['player', 'ai']) {
  const p = s[who];
  const cards = [...p.hand, ...p.deck, ...(p.trash || []), ...(p.removed || []), ...p.units, ...p.legends];
  for (const host of [...p.units, ...p.legends]) cards.push(...(host.gear || []));
  const normal = cards.filter(c => c.type !== 'Legend').map(c => c.id)
   .concat(p.eddies.map(c => c.id.replace(/^eddie-/, '')));
  assert.equal(normal.length, 40, who + ': no main-deck card lost or created');
  assert.equal(new Set(normal).size, 40, who + ': no card in multiple zones');
  assert.equal(cards.filter(c => c.type === 'Legend').length, 3, who + ': all Legends accounted for');
  for (const g of p.gigs) { assert(g.value >= 1 && g.value <= g.sides); dice.push(g.sides); gigIds.push(g.id); }
  dice.push(...p.fixer);
 }
 assert.equal(new Set(gigIds).size,gigIds.length,'no duplicated Gig identities after swapping or stealing');
 assert.equal(dice.length, 12);
 for (const d of [4, 6, 8, 10, 12, 20]) assert.equal(dice.filter(x => x === d).length, 2);
}
function choice(s, e) {
 const cards = E.options(s, e);
 switch (e.type) {
  case 'order': return {effectId: cards[0].id};
  case 'search': return {cardIds: cards.filter(c => c.type === 'Gear' && c.cost <= 2).slice(0, 2).map(c => c.id)};
  case 'rippler': return {trash: false};
  case 'peekOne': return {legendId: cards[0].id};
  case 'peekResult': return {kind: 'ack'};
  case 'freeCall': return {};
  case 'discard': return {cardId: cards[0].id};
  case 'readyEddies': return {eddieIds: cards.slice(0, e.count).map(c => c.id)};
  case 'adjust': return {delta: 0};
  case 'radioport': return {skip: true};
  case 'swapGigs': return {skip: true};
  case 'defeatUnit': return {side: cards[0].side, unitId: cards[0].id};
  case 'spendUnit': return {unitId: cards[0].id};
  case 'shatteredDraw': return {draw: false};
  default: throw Error('Uncovered effect: ' + e.type);
 }
}
const savedRandom = Math.random, results = {}, coverage = new Set();
try {
 for (let seed = 1; seed <= 100; seed++) {
  Math.random = random(seed);
  let s = H.fresh('random', {aiMode: 'mirror', preGame: true});
  function use(action, ...args) {
   const previous = JSON.stringify(s), r = P[action](s, ...args);
   assert.equal(JSON.stringify(s), previous, action + ': input snapshot remains immutable');
   assert(r.ok, 'seed ' + seed + ' ' + action + ': ' + r.reason);
   s = r.state; checkInventory(s); coverage.add(action);
   if (s.ai.legends.some(l => l.faceUp)) coverage.add('ai-call');
   if (s.ai.units.some(u => u.goSolo)) coverage.add('ai-go-solo');
   if ([...s.ai.units, ...s.ai.legends].some(u => u.gear?.length)) coverage.add('ai-gear');
   if (s.overtime) coverage.add('overtime');
  }
  use('rollForOrder', 20, 1);
  use('chooseOrder', seed % 2 ? 'player' : 'ai');
  use('openingHand', seed % 3 ? 'keep' : 'mulligan');
  use('beginOpening');
  const sources = cost => [
   ...s.player.eddies.filter(c => c.ready).map(c => ({kind: 'eddie', id: c.id})),
   ...s.player.legends.filter(c => c.ready && (!c.faceUp || c.sellTag)).map(c => ({kind: 'legend', id: c.id}))
  ].slice(0, cost);
  let actions = 0;
  while (!s.finished && actions++ < 500) {
   const e = E.pending(s);
   if (e) { coverage.add('effect-' + e.type); use('resolveEffect', choice(s, e)); continue; }
   if (s.phase === 'react') { use('defend', {kind: 'end'}); continue; }
   if (s.turn === 'ai') {
    const d = s.ai.fixer.find(d => d !== 20) ?? s.ai.fixer[0];
    use('opponentTurn', d ? Math.floor(Math.random() * d) + 1 : null); continue;
   }
   if (s.phase === 'start') {
    if (s.step === 'ready') use('ready');
    else if (s.step === 'draw') use('draw');
    else { const d = s.player.fixer[0]; use('roll', d, Math.floor(Math.random() * d) + 1); }
    continue;
   }
   assert.equal(s.phase, 'main');
   if (!s.player.soldThisTurn) {
    const sale = s.player.hand.find(c => c.sellTag);
    if (sale) { use('sell', sale.id); continue; }
   }
   const unit = s.player.hand.filter(c => c.type === 'Unit' && c.cost <= sources(Infinity).length)
    .sort((a, b) => b.power - a.power)[0];
   if (unit) {
    const opts = {delta: 0};
    if (unit.onPlaySpendRival) opts.rivalUnitId = s.ai.units.find(c => c.ready)?.id;
    use('play', unit.id, sources(unit.cost), opts); continue;
   }
   let attack;
   for (const u of s.player.units) {
    const legal = C.targets(s, 'player', u.id);
    const defender = s.ai.units.find(d => legal.units.includes(d.id) && C.power(u) > C.power(d));
    if (defender) { attack = {id: u.id, target: {kind: 'unit', defenderId: defender.id}}; break; }
    if (legal.gigs && C.power(u) > 0) attack = {id: u.id, target: {kind: 'gig'}};
   }
   if (attack) { use('reactAttack', attack.id, attack.target); continue; }
   use('pass');
  }
  assert(s.finished, 'seed ' + seed + ': match must finish without a loop or deadlock');
  assert.equal(s.phase, 'finished'); assert.equal(s.pendingAttack, null);
  assert.equal(s.pendingEffects.length, 0); assert(!s.afterEffects);
  const frozen = JSON.stringify(s);
  for (const r of [P.ready(s), P.draw(s), P.roll(s, 4, 1), P.pass(s), P.concede(s), P.opponentTurn(s, 1)]) assert(!r.ok);
  assert.equal(JSON.stringify(s), frozen, 'finished match cannot be changed by further actions');
  const key = s.winner + ':' + s.outcome.reason; results[key] = (results[key] || 0) + 1;
 }
} finally { Math.random = savedRandom; }
if(process.env.V3_TEST_DECK!=='embracingPower')for (const key of ['player:seven-at-start', 'ai:seven-at-start', 'ai:overtime-seven']) assert(results[key] > 0, key);
for (const key of ['sell', 'play', 'reactAttack', 'defend', 'resolveEffect', 'ai-call', 'ai-go-solo', 'ai-gear']) assert(coverage.has(key), key);
console.log('PASS 100 seeded complete random-opening matches, both first players, keep/Mulligan, exact inventory/dice conservation after every action, immutable commands, automatic AI/effect resumption, normal and Overtime outcomes, and terminal action guards:', JSON.stringify(results));
