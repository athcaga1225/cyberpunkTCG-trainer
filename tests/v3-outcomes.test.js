'use strict';
const assert=require('node:assert/strict'),H=require('../v3/heist-practice'),P=require('../v3/turn-practice'),C=require('../v3/mirror-combat'),E=require('../v3/heist-effects'),A=require('../v3/battle-actions');
const good=r=>{assert(r.ok,r.reason);return r.state};
const gig=(id,value=1)=>({id,sides:4,value});
const gigs=(n,p='p')=>Array.from({length:n},(_,i)=>gig(p+i));
const fresh=()=>good(P.chooseOrder(good(P.rollForOrder(H.fresh('basic',{aiMode:'mirror',preGame:true}),20,1)),'player'));
const field=()=>({...H.byName.get('Psycho Squad'),id:'attacker',ready:true,lag:false,gear:[]});
// Normal play only wins with seven at that side's start, before readiness or draw.
let s=fresh();s.player.gigs=gigs(7);s.player.deck=[];s=good(P.ready(s));assert.equal(s.winner,'player');assert.equal(s.outcome.reason,'seven-at-start');assert.equal(s.phase,'finished');assert.equal(P.draw(s).ok,false);assert.equal(A.pay(s,'player',0,[]).ok,false);
s=fresh();s.player.gigs=gigs(7);s.phase='main';E.pump(s);assert.equal(s.finished,false,'normal seven in the middle of a turn does not win yet');s.ai.units=[];s=good(P.pass(s));assert.equal(s.finished,false);s=good(P.opponentTurn(s,1));assert.equal(s.winner,'player');assert.equal(s.outcome.reason,'seven-at-start');
// A last die rolled during a turn does not count as an empty START.
s=fresh();s.player.fixer=[20];s.ai.fixer=[];s.turnStart={who:'player',bothFixersEmpty:false,completed:false};s.phase='start';s.step='roll';s=good(P.roll(s,20,1));s.ai.hand=[];s.ai.units=[];s=good(P.pass(s));assert.equal(s.emptyStartStreak,0);assert.equal(s.overtime,undefined);assert.equal(s.turnStart.bothFixersEmpty,true);
s=good(P.opponentTurn(s,null));assert.equal(s.emptyStartStreak,1);assert.equal(s.overtime,undefined);assert.equal(s.turnStart.who,'player');s.phase='main';s=good(P.pass(s));assert.equal(s.emptyStartStreak,2);assert.equal(s.overtime,true,'activates after the second complete empty-start turn');
// A nonempty start resets the consecutive count; completing the same turn twice does not count twice.
s=fresh();s.player.fixer=[];s.ai.fixer=[];s.emptyStartStreak=1;s.turnStart={who:'player',bothFixersEmpty:false,completed:false};E.completeTurn(s);assert.equal(s.emptyStartStreak,0);E.completeTurn(s);assert.equal(s.emptyStartStreak,0);
// Start with a legal forty-card manifest arranged to avoid AI unit deployment for seven full rounds.
s=fresh();for(const who of ['player','ai']){const p=s[who],all=[...p.deck,...p.hand];p.deck=[...all.filter(c=>c.type==='Unit'),...all.filter(c=>c.type!=='Unit')];p.hand=[];for(let i=0;i<6;i++)p.hand.push(p.deck.pop());}
for(let turn=1;turn<=7;turn++){
 s=good(P.ready(s));s=good(P.draw(s));if(s.player.fixer.length)s=good(P.roll(s,s.player.fixer[0],1));else assert.equal(s.phase,'main','no dice remains: automatically enter Main');
 s=good(P.pass(s));const d=s.ai.fixer[0];s=good(P.opponentTurn(s,d?1:null));assert.equal(s.finished,false);assert.equal(Boolean(s.overtime),turn===7);
}assert.equal(s.player.gigs.length,6);assert.equal(s.ai.gigs.length,6);assert.equal(s.emptyStartStreak,2);
// End effects finish before Overtime: a pending draw can lose before activation.
s=fresh();s.phase='main';s.player.fixer=[];s.ai.fixer=[];s.emptyStartStreak=1;s.turnStart={who:'player',bothFixersEmpty:true,completed:false};s.player.deck=[];E.queue(s,'player','draw',{source:'end effect',count:1});s.afterEffects='pass';s.phase='end';E.pump(s);assert.equal(s.finished,true);assert.equal(s.winner,'ai');assert.equal(s.overtime,undefined);assert.equal(s.afterEffects,undefined);
// Overtime activation can itself end the game before the next turn begins.
s=fresh();s.phase='main';s.player.fixer=[];s.ai.fixer=[];s.player.gigs=gigs(7);s.ai.gigs=gigs(5,'a');s.player.units=[{...field(),tempPowerModifier:-2}];s.emptyStartStreak=1;s.turnStart={who:'player',bothFixersEmpty:true,completed:false};s=good(P.pass(s));assert.equal(s.overtime,true);assert.equal(s.winner,'player');assert.equal(s.outcome.reason,'overtime-seven');assert.equal(s.turn,'player');assert.equal(s.player.units[0].tempPowerModifier,0,'this-turn effects clear before overtime activation');
// Stealing to seven during Overtime immediately ends combat, before another action/effect.
s=fresh();s.phase='main';s.overtime=true;s.player.gigs=gigs(6);s.ai.gigs=gigs(6,'a');s.player.units=[field()];s.ai.units=[];s=good(C.begin(s,'player','attacker',{kind:'gig'}));s=good(C.end(s,'ai',['a0']));assert.equal(s.winner,'player');assert.equal(s.player.gigs.length,7);assert.equal(s.outcome.reason,'overtime-seven');assert.equal(s.pendingAttack,null);assert.equal(s.pendingEffects.length,0);assert.equal(P.pass(s).ok,false);
s=fresh();s.overtime=true;s.player.gigs=gigs(7);s.player.deck=[];E.queue(s,'player','draw',{count:2});E.pump(s);assert.equal(s.winner,'player');assert.equal(s.outcome.reason,'overtime-seven','instant win supersedes a later pending draw');
// Symmetric overtime victory and simultaneous condition handling.
s=fresh();s.phase='main';s.overtime=true;s.turn='ai';s.ai.gigs=gigs(6,'a');s.player.gigs=gigs(6);s.ai.units=[field()];s.player.units=[];s=good(C.begin(s,'ai','attacker',{kind:'gig'}));s=good(C.end(s,'player',['p0']));assert.equal(s.winner,'ai');
s=fresh();s.overtime=true;s.player.gigs=gigs(7);s.ai.gigs=gigs(7,'a');E.checkVictory(s);assert.equal(s.outcome.kind,'draw');assert.equal(s.winner,null);assert.equal(E.resultSummary(s).title,'平手');
// Mandatory draw loss, multi-draw loss and Quick loss all use the same outcome and stop choices.
s=fresh();s=good(P.ready(s));s.player.deck=[];s=good(P.draw(s));assert.equal(s.outcome.reason,'empty-deck');assert.equal(s.winner,'ai');assert.equal(s.phase,'finished');
s=fresh();s.player.deck=[{id:'last',name:'last'}];E.queue(s,'player','draw',{count:2});E.pump(s);assert(s.player.hand.some(c=>c.id==='last'));assert.equal(s.outcome.reason,'empty-deck');assert.equal(s.pendingEffects.length,0);
s=fresh();s.turn='ai';s.phase='main';s.ai.units=[field()];s.player.gigs=gigs(1);s.player.deck=[];s.player.eddies=[{id:'cash',ready:true}];s.player.hand=[{...H.byName.get('Floor It'),id:'quick'}];s=good(C.begin(s,'ai','attacker',{kind:'gig'}));s=good(P.defend(s,{kind:'quick',cardId:'quick',sources:[{kind:'eddie',id:'cash'}]}));assert.equal(s.outcome.reason,'empty-deck');assert.equal(s.phase,'finished');assert.equal(s.pendingAttack,null);
// Concede is legal during a pending ability, clears it, and cannot be repeated or used pregame.
s=fresh();E.queue(s,'player','peekResult',{source:'test',cards:[]});s=good(P.concede(s));assert.equal(s.winner,'ai');assert.equal(s.outcome.reason,'concede');assert.equal(s.pendingEffects.length,0);assert.equal(P.concede(s).ok,false);assert.equal(P.concede(H.fresh('random',{aiMode:'mirror'})).ok,false);
const restarted=H.fresh('random',{aiMode:'mirror',preGame:true});assert.equal(restarted.finished,false);assert.equal(restarted.overtime,undefined);assert.equal(restarted.outcome,undefined);assert.equal(restarted.player.gigs.length,0);
console.log('PASS outcomes: normal start win, empty-start streak and full-round Overtime, end-effect ordering, immediate symmetric steals, simultaneous tie, all draw-loss paths, stop guards, concede and clean restart.');
