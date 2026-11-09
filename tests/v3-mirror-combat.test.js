'use strict';
const assert=require('node:assert/strict'),H=require('../v3/heist-practice.js'),P=require('../v3/turn-practice.js'),C=require('../v3/mirror-combat.js');
const unit=(name,id,extra={})=>({...H.byName.get(name),id,ready:true,lag:false,gear:[],...extra});
const fresh=()=>{const s=H.fresh('quick',{aiMode:'mirror'});s.turn='ai';s.phase='main';s.ai.units=[unit('Psycho Squad','a')];s.player.units=[unit('Secondhand Bombus','b')];s.player.gigs=[{id:'p1',sides:4,value:3},{id:'p2',sides:6,value:5}];s.player.eddies=[{id:'e1',ready:true},{id:'e2',ready:true},{id:'e3',ready:true}];return s;};
const good=r=>{assert(r.ok,r.reason);return r.state};
let s=fresh(),snapshot=JSON.stringify(s);s=good(C.begin(s,'ai','a',{kind:'gig'}));
assert.equal(s.ai.units[0].ready,false,'attacker spent at declaration');assert.equal(s.player.gigs.length,2,'declaration does not steal');assert.equal(JSON.parse(snapshot).ai.units[0].ready,true);
assert.equal(P.next(s).ok,false,'cannot skip pending defense');assert.equal(P.pass(s).ok,false);assert.equal(C.react(s,'ai',{kind:'block',blockerId:'b'}).ok,false);
s=good(C.react(s,'player',{kind:'block',blockerId:'b'}));assert.equal(s.player.units[0].ready,false);assert.equal(s.pendingAttack.target.defenderId,'b');
const reboot=s.player.hand.find(c=>c.name==='Reboot Optics');snapshot=JSON.stringify(s);
assert.equal(C.react(s,'player',{kind:'quick',cardId:reboot.id,sources:[]}).ok,false);assert.equal(JSON.stringify(s),snapshot,'bad payment leaves reaction intact');
s=good(C.react(s,'player',{kind:'quick',cardId:reboot.id,sources:[{kind:'eddie',id:'e1'},{kind:'eddie',id:'e2'}]}));
assert(s.pendingAttack,'Quick does not end defense');assert.equal(s.player.pendingRebootOptics,1);
s=good(C.end(s,'player'));assert.equal(s.player.units.length,1,'Reboot protects defeated blocker');assert.equal(s.player.pendingRebootOptics,0);assert.equal(s.player.gigs.length,2,'block prevents stealing');
// Ties, zero-power exception, attached gear trash, and negative-power comparisons.
s=fresh();s.player.units=[unit('Psycho Squad','b',{ready:false,gear:[{id:'g',power:0}]})];s=good(C.begin(s,'ai','a',{kind:'unit',defenderId:'b'}));s=good(C.end(s,'player'));assert.equal(s.player.units.length+s.ai.units.length,0);assert(s.player.trash.some(c=>c.id==='g'));
s=fresh();s.ai.units[0].power=-1;s.player.units[0].ready=false;s=good(C.begin(s,'ai','a',{kind:'unit',defenderId:'b'}));s=good(C.end(s,'player'));assert.equal(s.player.units.length+s.ai.units.length,2,'power below zero counts as zero; neither zero defeats');
// Quick changes the steal threshold; target dice are chosen after reactions.
s=fresh();s.ai.units[0].power=10;s=good(C.begin(s,'ai','a',{kind:'gig'}));const floor=s.player.hand.find(c=>c.name==='Floor It');const deck=s.player.deck.length;
s=good(C.react(s,'player',{kind:'quick',cardId:floor.id,sources:[{kind:'eddie',id:'e1'}]}));assert.equal(s.player.deck.length,deck-1);assert.equal(C.power(s.ai.units[0]),9);assert.equal(s.player.eddies[0].ready,false);snapshot=JSON.stringify(s);assert.equal(C.end(s,'player',['p1','p2']).ok,false);assert.equal(JSON.stringify(s),snapshot);s=good(C.end(s,'player',['p2']));assert.equal(s.ai.gigs.at(-1).value,5);assert.equal(s.player.gigs.length,1);
// Multiple Blockers are separate reactions and the last one becomes the defender.
s=fresh();s.player.units.push(unit('Secondhand Bombus','b2'));s=good(C.begin(s,'ai','a',{kind:'gig'}));s=good(C.react(s,'player',{kind:'block',blockerId:'b'}));s=good(C.react(s,'player',{kind:'block',blockerId:'b2'}));s=good(C.end(s,'player'));assert(s.player.units.some(c=>c.id==='b'));assert(!s.player.units.some(c=>c.id==='b2'));
// Draw failure during Quick is a loss, with payment/card resolution preserved.
s=fresh();s.player.deck=[];s=good(C.begin(s,'ai','a',{kind:'gig'}));s=good(C.react(s,'player',{kind:'quick',cardId:floor.id,sources:[{kind:'eddie',id:'e1'}]}));assert.equal(s.winner,'ai');assert.equal(s.finished,true);assert.equal(s.pendingAttack,null);
// Unverified effects and lag cannot be silently skipped.
s=fresh();s.player.units[0].deferredEffect=true;assert.equal(C.begin(s,'ai','a',{kind:'gig'}).ok,false);assert.equal(C.plan(s,'ai'),null);
s=fresh();s.ai.units[0].lag=true;assert.equal(C.begin(s,'ai','a',{kind:'gig'}).ok,false);
// Real opponent turn draws/rolls once, waits for each attack, then hands over.
s=fresh();s.phase='opponent';s.step='pendingBot';s.ai.units.push(unit('Psycho Squad','a2'));s.player.units=[];s.player.gigs.push({id:'p3',sides:8,value:7});const beforeDeck=s.ai.deck.length;
s=good(P.opponentTurn(s,2));assert.equal(s.phase,'react');assert.equal(s.ai.deck.length,beforeDeck-1);s=good(P.defend(s,{kind:'end'}));assert.equal(s.phase,'react','second existing attacker gets its own defense window');assert.equal(s.ai.deck.length,beforeDeck-1);s=good(P.defend(s,{kind:'end'}));assert.equal(s.turn,'player');assert.equal(s.step,'ready');assert.equal(s.player.gigs.length,1);assert.equal(s.ai.practiceBot.turnsTaken,1);assert.equal(s.ai.deck.length,beforeDeck-1);assert(s.ai.units.every(u=>!u.lag));
// Player attacks real mirror Gigs; mirror Blocker reacts automatically.
s=fresh();s.turn='player';s.player.units=[unit('Psycho Squad','p')];s.ai.units=[unit('Secondhand Bombus','botblock')];s.ai.gigs=[{id:'ai-gig',sides:4,value:4}];s.ai.hand=[];s=good(P.reactAttack(s,'p',{kind:'gig',gigIds:['ai-gig']}));assert.equal(s.ai.gigs.length,1);assert.equal(s.ai.units.length,0);assert.equal(s.player.units[0].ready,false);
// Equipment Blocker and automated mirror Quick use official card costs.
s=fresh();s.player.units=[unit('Psycho Squad','p',{gear:[{...H.byName.get('Mandibular Upgrade'),id:'blockergear'}]})];s=good(C.begin(s,'ai','a',{kind:'gig'}));assert.equal(C.blockers(s)[0].id,'p');
s=fresh();s.turn='player';s.player.units=[unit('Psycho Squad','p')];s.ai.units=[unit('Secondhand Bombus','botblock')];s.ai.hand=[{...H.byName.get('Floor It'),id:'aiquick'},{...H.byName.get('Reboot Optics'),id:'aiprotect'}];s.ai.eddies=[{id:'q1',ready:true},{id:'q2',ready:true},{id:'q3',ready:true}];s.ai.legends=[];s.ai.gigs=[{id:'ai-gig',sides:4,value:4}];s=good(P.reactAttack(s,'p',{kind:'gig',gigIds:['ai-gig']}));assert.equal(s.player.units[0].tempPowerModifier,-1);assert.equal(s.ai.trash.filter(c=>c.type==='Program').length,2);assert.equal(s.ai.eddies.filter(c=>c.ready).length,0);assert.equal(s.ai.units.length,1,'automated Reboot saves mirror Blocker');assert.equal(s.ai.pendingRebootOptics,0);
console.log('PASS mirror combat: declaration, reaction timing, exact Quick payment, Blocker sequencing, protection, ties/zero power, steal threshold, draw failure, unsupported effects, AI multiattack and automatic defense.');

// Public attack planning values threats rather than array order, and avoids protected Gigs.
s=fresh();s.ai.units[0].power=10;s.player.units=[unit('Psycho Squad','small',{ready:false,power:1}),unit('Psycho Squad','large',{ready:false,power:9}),unit('Psycho Squad','too-strong',{ready:false,power:12})];
snapshot=JSON.stringify(s);assert.deepEqual(C.plan(s,'ai'),{attackerId:'a',target:{kind:'unit',defenderId:'large'}});assert.equal(JSON.stringify(s),snapshot,'planning is read-only');
s.player.units.reverse();assert.equal(C.plan(s,'ai').target.defenderId,'large','field insertion order does not change threat priority');
const publicPlan=C.plan(s,'ai');s.player.hand=[{id:'hidden-hand',name:'Reboot Optics'}];s.player.deck=[{id:'hidden-deck',name:'Floor It'}];s.player.legends.filter(l=>!l.faceUp).forEach(l=>l.name='unknown');assert.deepEqual(C.plan(s,'ai'),publicPlan,'hidden rival information does not change target choice');
s=fresh();s.player.units=[];s.ai.units[0].power=2;s.player.chromeProtection=true;s.player.gigs=[{id:'protected',sides:6,value:5}];assert.equal(C.plan(s,'ai'),null,'do not spend an attack that cannot steal a protected Gig');
s.player.gigs.push({id:'eligible',sides:4,value:2});assert.deepEqual(C.plan(s,'ai'),{attackerId:'a',target:{kind:'gig'}});s=good(C.begin(s,'ai','a',C.plan(s,'ai').target));s=good(C.end(s,'player',['eligible']));assert(s.ai.gigs.some(g=>g.id==='eligible'));assert(s.player.gigs.some(g=>g.id==='protected'));
console.log('PASS public attack planning: strongest defeatable threat, immutable and hidden-information independent decisions, and Chrome-protected Gig eligibility.');

// Defend with the smallest winning Blocker and preserve unnecessary Quick payments.
s=fresh();s.turn='player';s.player.units=[unit('Psycho Squad','attacker',{power:3})];s.ai.units=[unit('Secondhand Bombus','large-block',{power:10}),unit('Secondhand Bombus','small-block',{power:4}),unit('Secondhand Bombus','losing-block',{power:1})];s.ai.hand=[{...H.byName.get('Reboot Optics'),id:'reserve-optics'}];s.ai.eddies=[{id:'reserve-1',ready:true},{id:'reserve-2',ready:true}];s.ai.legends=[];s.ai.gigs=[{id:'defended',sides:4,value:4}];s=good(P.reactAttack(s,'attacker',{kind:'gig'}));assert.equal(s.ai.units.find(u=>u.id==='small-block').ready,false);assert.equal(s.ai.units.find(u=>u.id==='large-block').ready,true);assert(s.ai.hand.some(c=>c.id==='reserve-optics'),'do not play Reboot when defender already wins');assert(s.ai.eddies.every(c=>c.ready));assert.equal(s.ai.gigs.length,1);
s=fresh();s.turn='player';s.player.units=[unit('Psycho Squad','attacker',{power:12})];s.ai.units=[unit('Secondhand Bombus','valuable',{power:10}),unit('Secondhand Bombus','chump',{power:1})];s.ai.hand=[];s.ai.legends=[];s.ai.gigs=[{id:'defended',sides:4,value:4}];s=good(P.reactAttack(s,'attacker',{kind:'gig'}));assert(s.ai.units.some(u=>u.id==='valuable'&&u.ready));assert(s.ai.trash.some(u=>u.id==='chump'));assert.equal(s.ai.gigs.length,1);
console.log('PASS conservative defense: smallest winning Blocker, preserve stronger ready units, and avoid unnecessary Reboot/payment.');
