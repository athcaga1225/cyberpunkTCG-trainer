/* V3 actual-starter-card integration regression. */
'use strict';
const assert=require('node:assert/strict');
const H=require('../v3/heist-practice.js');
const P=require('../v3/turn-practice.js');
assert.equal(H.cardCount,40);
let s=H.fresh();
assert.equal(s.practiceKind,'the-heist');
assert.equal(s.player.hand.length,6);
assert.equal(s.player.deck.length,34);
assert.equal(s.player.eddies.length,0,'The Heist starts without an invented Eddie');
assert.equal(s.player.legends.length,3);
assert.equal(s.player.legends.filter(x=>x.ready).length,1,'Two legends start spent');
assert(s.player.hand.some(x=>x.name==='Secondhand Bombus'&&x.cost===2&&x.type==='Unit'&&!x.sellTag&&!x.unimplementedEffect));
assert(s.player.hand.some(x=>x.name==='Kiroshi Optics'&&x.sellTag));
assert.equal(H.byName.get('Evelyn Parker: Scheming Siren').unimplementedEffect,false,'Attack-only ability does not block basic deployment');
assert.equal(H.byName.get('Evelyn Parker: Scheming Siren').attackEffect,'evelyn','Mirror engine resolves Evelyn attack ability explicitly');
assert.equal(H.byName.get('Psycho Squad').unimplementedEffect,false,'Vanilla unit is available');
assert.equal(H.byName.get('Kiroshi Optics').unimplementedEffect,false,'Verified Gear can be equipped');
assert.equal(H.byName.get('Mandibular Upgrade').unimplementedEffect,false,'Blocker Gear can be equipped');
assert.equal(H.byName.get("Afterparty at Lizzie's").unimplementedEffect,false,'Verified program can resolve');

assert.equal(H.byName.get('MT0D12 Flathead').sellTag,true,'Unit can have sell tag');
let r=P.ready(s);assert(r.ok);s=r.state;r=P.draw(s);assert(r.ok);s=r.state;r=P.roll(s,4,3);assert(r.ok);s=r.state;
const bomb=s.player.hand.find(x=>x.name==='Secondhand Bombus');
const kiroshi=s.player.hand.find(x=>x.name==='Kiroshi Optics');
const evelyn=s.player.hand.find(x=>x.name==='Evelyn Parker: Scheming Siren');
assert.equal(P.sell(s,bomb.id).ok,false,'Unit without sell tag must not sell');
assert.equal(P.play(s,bomb.id,[{kind:'legend',id:'legend-jackie'}]).ok,false,'Do not allow underpayment');
r=P.sell(s,kiroshi.id);assert(r.ok);s=r.state;
assert.equal(P.sell(s,kiroshi.id).ok,false,'One sell per turn');
const newEddie=s.player.eddies[0];
assert(newEddie.ready,'Sold actual card is a ready Eddie');
const evelynPlay=P.play(s,evelyn.id,[{kind:'eddie',id:newEddie.id},{kind:'legend',id:'legend-jackie'}]);
assert(evelynPlay.ok,'Attack-only ability allows deploying a unit');
assert.equal(evelynPlay.state.player.hand.length,s.player.hand.length-1,'Deployment does not execute Attack-triggered draw');
assert.equal(s.player.eddies[0].ready,true,'A simulated legal play does not mutate its input state');
r=P.play(s,bomb.id,[{kind:'eddie',id:newEddie.id},{kind:'legend',id:'legend-jackie'}]);assert(r.ok);s=r.state;
assert.equal(s.player.units.length,1);
assert.equal(s.player.units[0].name,'Secondhand Bombus');
assert.equal(s.player.units[0].lag,true);
assert.equal(s.player.hand.some(c=>c.id===bomb.id),false);
assert.equal(s.player.eddies[0].ready,false);
assert.equal(s.player.legends[2].ready,false);
assert.equal(H.fresh().player.hand.length,6,'Fresh state is independent of prior play');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../v3/index.html'),'utf8');
const ui=fs.readFileSync(path.resolve(__dirname,'../v3/turn-practice-ui.js'),'utf8');
assert(html.includes('src="v3/heist-practice.js?v=7"'),'Heist module must load in V3');
assert(html.indexOf('src="v3/heist-practice.js?v=7"')<html.indexOf('src="v3/turn-practice-ui.js?v=52"'),'Module must load before UI');
assert(html.includes('id="v3TurnPractice"'),'Practice host must be present');
assert(ui.includes("rail.replaceChildren()"),'UI must render actual hand in tabletop rail');
assert(ui.includes("selectedPayments=new Set()"),'UI must allow explicit selection of payment sources');
assert(ui.includes("renderField()"),'UI must update tabletop field cards');

/* Gear requires a valid target, exact payment, and never mutates a rejected state. */
let g=H.fresh();g.turn='player';g.phase='main';
const gearCard=g.player.hand.find(c=>c.name==='Kiroshi Optics');
const gearUnit=g.player.hand.find(c=>c.name==='Secondhand Bombus');
g.player.eddies.push({id:'cash',ready:true});
assert.equal(P.gear(g,gearCard.id,[{kind:'eddie',id:'cash'}],'missing').ok,false,'Cannot equip without a valid target');
assert.equal(g.player.eddies[0].ready,true,'Failed equip must not spend Eddie');
let deployed=P.play(g,gearUnit.id,[{kind:'eddie',id:'cash'},{kind:'legend',id:'legend-jackie'}]);
assert(deployed.ok,'Base Unit must deploy');g=deployed.state;
g.player.eddies[0].ready=true;
let equipped=P.gear(g,gearCard.id,[{kind:'eddie',id:'cash'}],gearUnit.id);
assert(equipped.ok,'Kiroshi must attach to Unit');g=equipped.state;
assert.equal(g.player.units[0].gear.length,1);
assert.equal(g.player.units[0].gear[0].name,'Kiroshi Optics');
assert.equal(g.player.eddies[0].ready,false);
assert.equal(g.player.hand.some(c=>c.id===gearCard.id),false);
/* Program: adjust selected Gig, draw only if 2 distinct friendly values, then trash. */
let p=H.fresh();p.turn='player';p.phase='main';
p.player.hand.push({...H.byName.get("Afterparty at Lizzie's"),id:'test-program'});
p.player.eddies=[{id:'cash',ready:true}];
p.player.gigs=[{id:'gig-1',sides:4,value:2},{id:'gig-2',sides:6,value:2}];
const handBefore=p.player.hand.length;
assert.equal(P.program(p,'test-program',[{kind:'eddie',id:'cash'}],{gigId:'missing',delta:1}).ok,false);
let cast=P.program(p,'test-program',[{kind:'eddie',id:'cash'}],{gigId:'gig-2',delta:1});
assert(cast.ok,'Program must resolve valid target');p=cast.state;
assert.equal(p.player.gigs[1].value,3);
assert.equal(p.player.trash.length,1);
assert.equal(p.player.hand.length,handBefore,'Played card leaves hand and drawing replaces it');
assert.equal(p.player.eddies[0].ready,false);
assert.equal(P.program(p,'test-program',[{kind:'eddie',id:'cash'}],{delta:0}).ok,false,'Cannot reuse discarded program');
/* Neutral option is legal, and not every cast draws a card. */
let p2=H.fresh();p2.turn='player';p2.phase='main';p2.player.eddies=[{id:'cash',ready:true}];
p2.player.hand.push({...H.byName.get("Afterparty at Lizzie's"),id:'zero-adjust'});
p2.player.gigs=[{id:'gig-1',sides:4,value:2}];
const deckBefore=p2.player.deck.length;
let neutral=P.program(p2,'zero-adjust',[{kind:'eddie',id:'cash'}],{delta:0});
assert(neutral.ok&&neutral.state.player.deck.length===deckBefore,'One Gig cannot trigger draw');
/* Invalid source must be rejected without exception. */
const A=require('../v3/battle-actions.js');
assert.equal(A.pay(g,'player',1,[null]).ok,false);
/* Stage 2: official passive card facts and exact controller targeting. */
assert.equal(H.byName.get('MT0D12 Flathead').unimplementedEffect,false,'Flathead is playable before attack timing exists');
assert.equal(H.byName.get('MT0D12 Flathead').power,7);
assert.equal(H.byName.get('MT0D12 Flathead').deferredEffect,false,'Flathead unblockable condition is enabled in mirror combat');
assert.equal(H.byName.get('Secondhand Bombus').blocker,true);
assert.equal(H.byName.get('Mandibular Upgrade').blocker,true);
const stats=A.unitStats(g.player.units[0]);
assert.equal(stats.power,1,'Kiroshi +1 Power applies to the attached Bombus');
assert.equal(stats.blocker,true,'Bombus retains Blocker');
const gearTarget={name:'Psycho Squad',power:6,gear:[{name:'Mandibular Upgrade',power:0,blocker:true}]};
assert.deepEqual(A.unitStats(gearTarget),{power:6,blocker:true,cannotBeBlockedIfLowerCred:false});
let flat=H.fresh();flat.turn='player';flat.phase='main';
const flatCard=flat.player.deck.find(x=>x.name==='MT0D12 Flathead');
flat.player.hand.push({...flatCard,id:'manual-flathead'});
flat.player.eddies=Array.from({length:5},(_,i)=>({id:'cash-'+i,ready:true}));
const flatPay=flat.player.eddies.map(c=>({kind:'eddie',id:c.id}));
const playedFlat=P.play(flat,'manual-flathead',flatPay);
assert(playedFlat.ok&&playedFlat.state.player.units.at(-1).cannotBeBlockedIfLowerCred,'Flathead can enter with deferred combat passive');
/* Gig IDs are not unique across opponents: adjusting ai:gig-1 must not adjust player:gig-1. */
let rival=H.fresh();rival.turn='player';rival.phase='main';
rival.player.eddies=[{id:'cash',ready:true}];
rival.player.hand.push({...H.byName.get("Afterparty at Lizzie's"),id:'versus'});
rival.player.gigs=[{id:'gig-1',sides:4,value:2}];
rival.ai.gigs=[{id:'gig-1',sides:6,value:4}];
assert.equal(P.program(rival,'versus',[{kind:'eddie',id:'cash'}],{side:'opponent',gigId:'gig-1',delta:1}).ok,false,'Unknown controller rejected');
const rivalResult=P.program(rival,'versus',[{kind:'eddie',id:'cash'}],{side:'ai',gigId:'gig-1',delta:1});
assert(rivalResult.ok,'Adjusting rival Gig is valid');
assert.equal(rivalResult.state.ai.gigs[0].value,5);
assert.equal(rivalResult.state.player.gigs[0].value,2);
assert.equal(rival.player.eddies[0].ready,true,'Rejecting invalid target must not spend payment');
const edge=H.fresh();edge.turn='player';edge.phase='main';
edge.player.eddies=[{id:'cash',ready:true}];
edge.player.hand.push({...H.byName.get("Afterparty at Lizzie's"),id:'boundary'});
edge.player.gigs=[{id:'gig-1',sides:4,value:4}];
assert.equal(P.program(edge,'boundary',[{kind:'eddie',id:'cash'}],{side:'player',gigId:'gig-1',delta:1}).ok,false,'Cannot exceed a die maximum');
assert.equal(edge.player.eddies[0].ready,true);
/* Stage 2: correct Dexter Play trigger and separate deferred Attack/Defeated triggers. */
assert.equal(H.byName.get('Dexter DeShawn: One Last Chance').onPlayGigAdjust,true);
assert.equal(H.byName.get('Dexter DeShawn: One Last Chance').deferredEffect,false);
for(const name of ['Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Zetatech Faceplate']){
 assert.equal(H.byName.get(name).unimplementedEffect,false,name+' can enter play before its trigger');
 assert.equal(H.byName.get(name).deferredEffect,false,name+' flags match current mirror trigger support');
}
const faceplate=H.byName.get('Zetatech Faceplate');
assert.equal(faceplate.cost,2);assert.equal(faceplate.power,2);
let d=H.fresh();d.turn='player';d.phase='main';
d.player.hand.push({...H.byName.get('Dexter DeShawn: One Last Chance'),id:'dexter-demo'});
d.player.eddies=Array.from({length:3},(_,i)=>({id:'cash-'+i,ready:true}));
d.player.gigs=[{id:'gig-1',sides:4,value:2}];
const dexterPayment=d.player.eddies.map(x=>({kind:'eddie',id:x.id}));
assert.equal(P.play(d,'dexter-demo',dexterPayment,{gigId:'gig-1',side:'player',delta:3}).ok,false,'Out-of-range Dexter effect is rejected before payment');
assert.equal(d.player.eddies[0].ready,true);
let dexter=P.play(d,'dexter-demo',dexterPayment,{gigId:'gig-1',side:'player',delta:1});
assert(dexter.ok,'Dexter resolves its Play adjustment');assert.equal(dexter.state.player.gigs[0].value,3);
assert.equal(dexter.state.player.units.at(-1).name,'Dexter DeShawn: One Last Chance');
assert(dexter.state.player.eddies.every(x=>!x.ready));
let face=H.fresh();face.turn='player';face.phase='main';
face.player.eddies=[{id:'a',ready:true},{id:'b',ready:true}];
face.player.units=[{id:'unit-1',name:'Psycho Squad',power:6,ready:true,gear:[]}];
face.player.hand.push({...faceplate,id:'faceplate-1'});
let faceResult=P.gear(face,'faceplate-1',[{kind:'eddie',id:'a'},{kind:'eddie',id:'b'}],'unit-1');
assert(faceResult.ok);assert.equal(A.unitStats(faceResult.state.player.units[0]).power,8,'Faceplate gives +2 Power');
/* Additional basic Gear cards whose triggered effects are deferred until the combat/spend engine. */
for(const [name,cost,power] of [["Dying Night: V's Pistol",2,2],['Tetratronic Rippler',1,1]]){
 const c=H.byName.get(name);
 assert.equal(c.unimplementedEffect,false,name+' should be attachable');
 assert.equal(c.deferredEffect,false,name+' keeps only unimplemented spend triggers deferred');
 assert.equal(c.cost,cost);assert.equal(c.power,power);
 const state=H.fresh();state.turn='player';state.phase='main';
 state.player.units.push({id:'sample-unit',name:'Psycho Squad',power:6,ready:true,gear:[]});
 state.player.eddies=Array.from({length:cost},(_,i)=>({id:'cash-'+i,ready:true}));
 state.player.hand.push({...c,id:'gear-under-test'});
 const paid=state.player.eddies.map(e=>({kind:'eddie',id:e.id}));
 const r=P.gear(state,'gear-under-test',paid,'sample-unit');
 assert(r.ok,name+' basic attachment');
 assert.equal(A.unitStats(r.state.player.units[0]).power,6+power);
 assert.equal(r.state.player.units[0].gear.length,1);
}
/* Heywood: optional defeat, Gear is trashed by its controller, and matching Gig draws. */
let hh=H.fresh();hh.turn='player';hh.phase='main';
hh.player.hand.push({...H.byName.get('Heywood Ripperdoc'),id:'ripper'});
hh.player.eddies=Array.from({length:6},(_,i)=>({id:'cash-'+i,ready:true}));
hh.player.gigs=[{id:'gig-1',sides:4,value:1}];
hh.ai.units=[{id:'rival-unit',name:'Opponent test unit',power:4,ready:true,gear:[{id:'rival-gear',name:'Kiroshi Optics',type:'Gear',cost:1,power:1}]}];
const gearPayment=hh.player.eddies.map(x=>({kind:'eddie',id:x.id}));
assert.equal(P.play(hh,'ripper',gearPayment,{gearTargetId:'bad',gearSide:'ai'}).ok,false);
assert.equal(hh.player.eddies.every(x=>x.ready),true,'Invalid optional Gear target cannot spend resources');
const hhHand=hh.player.hand.length,hhDeck=hh.player.deck.length;
const hhResult=P.play(hh,'ripper',gearPayment,{gearTargetId:'rival-gear',gearSide:'ai'});
assert(hhResult.ok);
assert.equal(hhResult.state.ai.units[0].gear.length,0);
assert.equal(hhResult.state.ai.trash[0].id,'rival-gear');
assert.equal(hhResult.state.player.deck.length,hhDeck-1,'Matched own Gig draws 1');
assert.equal(hhResult.state.player.hand.length,hhHand,'Unit leaves hand and conditional draw replaces it');
/* Malfini: spend itself plus one ready rival Unit; disallow missing target. */
let mm=H.fresh();mm.turn='player';mm.phase='main';
mm.player.hand.push({...H.byName.get('Offduty Malfini'),id:'malfini'});
mm.player.eddies=Array.from({length:4},(_,i)=>({id:'m-'+i,ready:true}));
mm.ai.units=[{id:'rival-ready',name:'Rival',ready:true,power:2}];
const malPay=mm.player.eddies.map(x=>({kind:'eddie',id:x.id}));
assert.equal(P.play(mm,'malfini',malPay).ok,false,'A rival ready unit must be selected');
assert.equal(mm.player.eddies[0].ready,true);
const mal=P.play(mm,'malfini',malPay,{rivalUnitId:'rival-ready'});
assert(mal.ok);assert.equal(mal.state.player.units.at(-1).ready,false);
assert.equal(mal.state.ai.units[0].ready,false);
/* Quick Program uses official Main Phase timing; ends this turn and cannot mutate a failed play. */
const quick=H.fresh('quick');
assert.equal(quick.player.hand.length,6);
assert.equal(quick.player.deck.length,34);
assert(quick.player.hand.some(c=>c.name==='Floor It'&&!c.unimplementedEffect));
assert(quick.ai.units.some(c=>c.trainingTarget&&c.name==='Ruthless Lowlife'));
assert.throws(()=>H.fresh('unknown'));
let fq=quick;fq.turn='player';fq.phase='main';
const quickCard=fq.player.hand.find(c=>c.name==='Floor It');
const quickSource=[{kind:'legend',id:'legend-jackie'}];
const quickStartHand=fq.player.hand.length;
assert.equal(P.program(fq,quickCard.id,quickSource,{rivalUnitId:'invalid'}).ok,false);
assert.equal(fq.player.legends[2].ready,true,'Invalid Quick target must not spend payment');
let quickResult=P.program(fq,quickCard.id,quickSource,{rivalUnitId:'training-rival-ruthless'});
assert(quickResult.ok);
assert.equal(quickResult.state.ai.units[0].tempPowerModifier,-1);
assert.equal(A.unitStats(quickResult.state.ai.units[0]).power,3);
assert.equal(quickResult.state.player.trash[0].name,'Floor It');
assert.equal(quickResult.state.player.hand.length,quickStartHand,'Quick Program is replaced by draw');
assert.equal(quickResult.state.player.legends[2].ready,false);
quickResult=P.pass(quickResult.state);
assert(quickResult.ok,'Pass after Floor It');
assert.equal(A.unitStats(quickResult.state.ai.units[0]).power,4,'Temporary debuff expires at end of turn');
const quickNext=P.next(quickResult.state);assert(quickNext.ok);
assert.equal(quickNext.state.ai.units[0].ready,true,'Training rival is reset for repeatable turns');
const practiceUI=fs.readFileSync(path.resolve(__dirname,'../v3/turn-practice-ui.js'),'utf8');
assert(practiceUI.includes('renderRivalField()'),'Rival training target must render');
assert(practiceUI.includes("freshPractice(scenario,{preGame:true,defense:defensePreset,aiMode:opponentMode,randomizeLegends:true})"),'Practice hand scenarios must be wired');
/* Reboot Optics may be played in the open Main Phase; effect is pending until combat exists. */
assert.equal(H.byName.get('Reboot Optics').unimplementedEffect,false);
let protect=H.fresh('quick');protect.turn='player';protect.phase='main';
const reboot=protect.player.hand.find(c=>c.name==='Reboot Optics');
assert(reboot&&reboot.cost===2);
protect.player.eddies=[{id:'cash-1',ready:true}];
const rebootPayment=[{kind:'eddie',id:'cash-1'},{kind:'legend',id:'legend-jackie'}];
const queued=P.program(protect,reboot.id,rebootPayment,{});
assert(queued.ok);assert.equal(queued.state.player.pendingRebootOptics,1);
assert.equal(queued.state.player.trash.at(-1).name,'Reboot Optics');
assert.equal(queued.state.player.hand.some(c=>c.id===reboot.id),false);
assert.equal(protect.player.pendingRebootOptics,undefined,'Pure action must not mutate its input');
assert.equal(P.program(queued.state,reboot.id,rebootPayment,{}).ok,false,'Queued card cannot replay from trash');
const expired=P.pass(queued.state);
assert(expired.ok&&expired.state.player.pendingRebootOptics===0,'Queued turn-limited protection expires without a fight');
/* Dealing animation safety: only when cards enter, never for routine hand selection. */
const animatedUI=fs.readFileSync(path.resolve(__dirname,'../v3/turn-practice-ui.js'),'utf8');
assert(animatedUI.includes("entryDealt=false"),'First visit should reset entry deal state');
assert(animatedUI.includes("new MutationObserver(dealOnEntry)"),'Battle navigation must trigger its initial deal');
assert(animatedUI.includes("const added=state.player.hand.map(c=>c.id).filter(id=>!before.has(id))"),'Draw animation detects actual new cards');
assert(animatedUI.includes("pendingDeal=added"),'Newly drawn cards should animate without redealing existing hand');
assert(animatedUI.includes("const sequence=++renderSequence"),'Stale renders must not animate');
assert(animatedUI.includes("prefers-reduced-motion: reduce"),'Reduced motion must be respected');
assert(animatedUI.includes("animation.finished.then(clean,clean)"),'Transient flying cards must be removed on success and cancel');
assert(!animatedUI.includes('setInterval('),'No permanent animation loops');
assert(animatedUI.includes("document.documentElement.append(layer)"),'Flight layer must escape the grid CSS coordinate system');
assert(animatedUI.includes("clone.style.left=end.left+'px'"),'Flight destination must use measured card position');
assert(animatedUI.includes("clone.style.top=end.top+'px'"),'Flight destination must use measured viewport Y');
assert(animatedUI.includes("start.left+start.width/2"),'Flight origin must be deck centre');
assert(animatedUI.includes("startY-(end.top+end.height/2)"),'Flight path must account for the target centre');
assert(animatedUI.includes("document.querySelectorAll('[data-v3-deal-layer]')"),'Canceled animations must remove the overlay');
/* V3 hover is a single delegated preview; preview-deck hover must yield ownership. */
const legacyPreview=fs.readFileSync(path.resolve(__dirname,'../battle-preview.js'),'utf8');
assert(legacyPreview.includes("rail.dataset.v3HoverOwned==='true'"),'Legacy hover must yield to active practice');
assert(legacyPreview.includes("if(rail?.dataset.v3HoverOwned==='true'){hideHover();return;}"),'Legacy leave timer must not affect active practice');
assert(legacyPreview.includes("anchor?.closest('.player-hand')?.querySelector('[data-v3-hover-owned=\"true\"]')"),'Legacy show handler must not create a second hand preview');
assert(animatedUI.includes("hover.id='v3HandPreview'"),'Live practice must own one standalone preview');
assert(animatedUI.includes("hover.style.display='flex'"),'Preview is shown without rebuilding hand cards');
assert(animatedUI.includes("hover.style.display='none'"),'Preview can be hidden cleanly');
assert(animatedUI.includes("rail.dataset.v3HoverOwned='true'"),'Legacy hover is disabled for the live hand');
assert(animatedUI.includes("document.addEventListener('pointermove',event=>"),'One document-level pointer tracker must be used');
assert(!animatedUI.includes("rail.addEventListener('pointermove',update)"),'Legacy rail pointermove must not be duplicated in live mode');
assert(animatedUI.includes("document.elementFromPoint(x,y)"),'Hand selection respects covering UI before resolving stable fan slots');
assert(animatedUI.includes("liveHandAt(lastPointerX,lastPointerY)"),'Delayed hover validates the latest pointer coordinates');
assert(animatedUI.includes("if(hoverPendingId===card.id)return"),'Repeated pointer moves must not restart debounce timer');
assert(animatedUI.includes("},70)"),'Hover transition uses a bounded debounce');
assert(animatedUI.includes("const slotLeft=railRect.left+el.offsetLeft"),'Floating preview must anchor to hovered card');
assert(animatedUI.includes("let left=slotRight+gap"),'Preview should appear to the right of hovered card');
assert(animatedUI.includes("if(left+w>innerWidth-pad)left=slotLeft-w-gap"),'Preview should move left when no room');
assert(animatedUI.includes("const slotBottom=slotTop+el.offsetHeight"),'Preview should align with the original hand slot');
assert(animatedUI.includes("hoverImageCache.get(image)"),'Repeated hover imagery is cached');
assert(animatedUI.includes("if(previewId===card.id&&!hover.hidden)return"),'Unchanged hovered card must not rebuild preview');
assert(animatedUI.includes("if(token!==previewLoad)return"),'Stale async artwork must never replace the current card');
// Desktop geometry, hover and stacking are asserted using computed styles in browser tests.

assert(animatedUI.includes("raisedHandId=anchor?null:card.id"),'Only the active real card is magnified');
assert(animatedUI.includes("el.dataset.cardId===raisedHandId"),'No other cards are raised');
assert(animatedUI.includes("el.classList.remove('is-hand-hover')"),'Hover class must clear when pointer leaves');
/* Desktop game page is viewport-locked, with gameplay controls in a tray. */
assert(animatedUI.includes('board.append(tableControls)'),'Actions must be hosted on the table');
assert(animatedUI.includes("toggleActions?.addEventListener('click'"),'Overlay toggle must be wired');
assert(animatedUI.includes("root.classList.toggle('is-open',open)"),'Overlay must open and close without destroying game state');
assert(animatedUI.includes("renderTableControls()"),'Selecting a card updates tabletop contextual controls');
assert(animatedUI.includes("deckSelect.addEventListener('change'"),'Deck selection must remain available in the action tray');
assert(!animatedUI.includes("tourButton.addEventListener('click'"),'The tour must not occupy live turn controls');
assert(animatedUI.includes("const handSelect=document.createElement('select')"),'Starting hand must be selected before the match');
assert(animatedUI.includes("defensePreset='none'"),'Scripted rival reactions must be chosen before the match');
assert(animatedUI.includes("defenderLabel=add('label','腳本對手反應"),'React practice settings belong in pregame');


// Bounded combat exercise regression: only spent rival Units may be attacked.
{
 const battle=require('../v3/battle-actions.js');
 const source=H.fresh();
 const setup=P.ready(source);assert(setup.ok);
 const drawStep=P.draw(setup.state);assert(drawStep.ok);
 const main=P.roll(drawStep.state,4,2);assert(main.ok);
 const training=P.prepareTrainingTarget(main.state,'training-rival-ruthless');
 assert(training.ok,'Trainer can explicitly spend its dedicated training target');
 assert.equal(training.state.ai.units[0].ready,false);
 assert.equal(main.state.ai.units[0].ready,true,'Training setup does not mutate input');
 const attacker={id:'training-attacker',name:'Test attacker',power:6,ready:true,lag:false,gear:[]};
 const battleState=structuredClone(training.state);battleState.player.units.push(attacker);
 const won=P.fight(battleState,attacker.id,'training-rival-ruthless');
 assert(won.ok,'Stronger ready attacker defeats spent rival');
 assert.equal(won.state.player.units[0].ready,false,'Attack spends surviving attacker');
 assert.equal(won.state.ai.units.length,0,'Defeated rival leaves field');
 assert.equal(won.state.ai.trash.length,1,'Defeated rival enters trash');
 assert.equal(battleState.ai.units.length,1,'Combat does not mutate input');
 const readyTarget=structuredClone(battleState);readyTarget.ai.units[0].ready=true;
 assert.equal(P.fight(readyTarget,attacker.id,'training-rival-ruthless').ok,false,'Cannot directly attack ready Unit');
 const lagged=structuredClone(battleState);lagged.player.units[0].lag=true;
 assert.equal(P.fight(lagged,attacker.id,'training-rival-ruthless').ok,false,'Lag prevents attacks');
 const tied=structuredClone(battleState);tied.player.units[0].power=4;
 const tie=P.fight(tied,attacker.id,'training-rival-ruthless');
 assert(tie.ok,'Equal power combat resolves');
 assert.equal(tie.state.player.units.length,0,'Tie defeats attacker');
 assert.equal(tie.state.ai.units.length,0,'Tie defeats defender');
 const deferred=structuredClone(battleState);deferred.player.units[0].deferredEffect=true;
 assert.equal(P.fight(deferred,attacker.id,'training-rival-ruthless').ok,false,'Deferred combat effect must not be skipped');
}

// Scripted Gig attack: selection, transfer, power thresholds, and safety restrictions.
{
 const practice=H.fresh();
 assert.equal(practice.ai.gigs.length,3,'Scripted rival starts with three explicitly labeled Gigs');
 let r=P.ready(practice);assert(r.ok);r=P.draw(r.state);assert(r.ok);r=P.roll(r.state,4,2);assert(r.ok);
 const base=r.state;const actor={id:'attack-gig-unit',name:'Basic training attacker',type:'Unit',power:6,ready:true,lag:false,gear:[]};
 base.player.units.push(actor);
 assert.equal(P.steal(base,actor.id,[]).ok,false,'Gig count must match attack power');
 assert.equal(P.steal(base,actor.id,['training-gig-d4','training-gig-d4']).ok,false,'Duplicate Gig choices rejected');
 let result=P.steal(base,actor.id,['training-gig-d4']);
 assert(result.ok,'Power 6 can steal one Gig');
 assert.equal(result.state.player.gigs.length,2,'Stolen Gig enters friendly area');
 assert.equal(result.state.ai.gigs.length,2,'Stolen Gig leaves rival area');
 assert.equal(result.state.player.units.at(-1).ready,false,'Attack spends its Unit');
 assert.equal(base.ai.gigs.length,3,'Steal must not mutate its input');
 const stronger=JSON.parse(JSON.stringify(base));stronger.player.units.at(-1).power=10;
 result=P.steal(stronger,actor.id,['training-gig-d4','training-gig-d6']);
 assert(result.ok,'Power 10 steals two Gigs');
 assert.equal(result.state.ai.gigs.length,1);
 const zero=JSON.parse(JSON.stringify(base));zero.player.units.at(-1).power=0;
 result=P.steal(zero,actor.id,[]);
 assert(result.ok,'Power 0 attacks but steals zero Gigs');
 assert.equal(result.state.player.units.at(-1).ready,false);
 const lag=JSON.parse(JSON.stringify(base));lag.player.units.at(-1).lag=true;
 assert.equal(P.steal(lag,actor.id,['training-gig-d4']).ok,false,'Lag prevents Gig attack');
 const deferred=JSON.parse(JSON.stringify(base));deferred.player.units.at(-1).deferredEffect=true;
 assert.equal(P.steal(deferred,actor.id,['training-gig-d4']).ok,false,'Unresolved trigger cannot be silently skipped');
}

// Explicit scripted React Step: Blocker redirect, pass, and zero-power fight.
{
 let r=P.ready(H.fresh());assert(r.ok);r=P.draw(r.state);assert(r.ok);r=P.roll(r.state,4,2);assert(r.ok);
 const base=r.state;
 base.player.units.push({id:'react-attacker',name:'Test attacker',type:'Unit',power:6,ready:true,lag:false,gear:[]});
 const added=P.addTrainingBlocker(base);assert(added.ok,'Training defender may create a script Blocker');
 const withBlocker=added.state;
 const attack={kind:'gig',gigIds:['training-gig-d4']};
 assert.equal(P.steal(withBlocker,'react-attacker',attack.gigIds).ok,false,'Direct Gig attacks cannot bypass ready Blocker response');
 assert.equal(P.reactAttack(withBlocker,'react-attacker',attack).ok,false,'React Step requires an explicit choice');
 assert.equal(P.reactAttack(withBlocker,'react-attacker',attack,{kind:'block',blockerId:'missing'}).ok,false,'Unknown blocker must fail');
 const intercepted=P.reactAttack(withBlocker,'react-attacker',attack,{kind:'block',blockerId:'training-blocker-bombus'});
 assert(intercepted.ok,'Ready Blocker redirects Gig attack to its fight');
 assert.equal(intercepted.state.ai.gigs.length,3,'Intercepted Gig attack must not steal Gigs');
 assert.equal(intercepted.state.player.units[0].ready,false,'Attacker is spent');
 assert(!intercepted.state.ai.units.some(u=>u.id==='training-blocker-bombus'),'Power 6 defeats Blocker at power 0');
 assert.equal(withBlocker.ai.units.at(-1).ready,true,'Intercept does not mutate old state');
 const passed=P.reactAttack(withBlocker,'react-attacker',attack,{kind:'pass'});
 assert(passed.ok,'Explicit defender pass allows normal Gig steal');
 assert.equal(passed.state.ai.gigs.length,2,'Unblocked attack steals one Gig');
 const equal=JSON.parse(JSON.stringify(withBlocker));equal.player.units[0].power=0;
 const noDefeat=P.reactAttack(equal,'react-attacker',{kind:'gig',gigIds:[]},{kind:'block',blockerId:'training-blocker-bombus'});
 assert(noDefeat.ok,'Two zero-power units may fight');
 assert.equal(noDefeat.state.ai.units.length,2,'Power zero cannot defeat the opposing unit');
 assert.equal(noDefeat.state.player.units.length,1,'Zero-power Blocker cannot defeat attacker');
}

// The scripted defending player resolves Floor It before blocker / combat.
// This covers a fixed teaching scenario, not arbitrary Quick cards or AI turns.
{
 let r=P.ready(H.fresh());assert(r.ok);r=P.draw(r.state);assert(r.ok);r=P.roll(r.state,4,2);assert(r.ok);
 const start=r.state;
 start.player.units.push({id:'quick-attacker',name:'Training attacker',type:'Unit',power:10,ready:true,lag:false,gear:[]});
 const setup=P.addTrainingQuick(start);assert(setup.ok,'Scripted defender Quick can be configured');
 const state=setup.state;
 assert.equal(state.ai.eddies.length,1,'Floor It costs exactly 1 defender resource per official card text');
 assert.equal(P.reactAttack(state,'quick-attacker',{kind:'gig',gigIds:['training-gig-d4']},{kind:'pass'}).ok,false,'Defending Quick choice must be explicit');
 let acted=P.reactAttack(state,'quick-attacker',{kind:'gig',gigIds:['training-gig-d4']},{kind:'pass',quick:true});
 assert(acted.ok,'Floor It resolves before normal Gig steal');
 assert.equal(acted.state.ai.gigs.length,2,'Power 10 reduced to 9 steals one Gig');
 assert.equal(acted.state.ai.eddies.filter(e=>e.ready).length,0,'Quick payment spends exactly 1 Eddie');
 assert.equal(acted.state.ai.deck.length,0,'Floor It draws exactly one card');
 assert.equal(acted.state.ai.trash[0].name,'Floor It','Played Quick moves to trash');
 assert.equal(acted.state.player.units[0].tempPowerModifier,-1,'Floor It lowers active attacker power');
 assert.equal(state.ai.hand.length,1,'Original defender state remains untouched');
 assert.equal(P.reactAttack(state,'quick-attacker',{kind:'gig',gigIds:['training-gig-d4','training-gig-d6']},{kind:'pass',quick:true}).ok,false,'Gig picks revalidate after power reduction');
 const blocker=P.addTrainingBlocker(state);assert(blocker.ok);
 acted=P.reactAttack(blocker.state,'quick-attacker',{kind:'gig',gigIds:['training-gig-d4']},{kind:'block',blockerId:'training-blocker-bombus',quick:true});
 assert(acted.ok,'Quick may resolve before the defender uses Blocker');
 assert.equal(acted.state.ai.gigs.length,3,'Redirected Quick attack does not steal Gigs');
 assert.equal(acted.state.ai.trash.some(c=>c.name==='Floor It'),true,'Quick card remains in trash after Blocker');
}

// Rule 7.5 opening: roll off before turns, winner selects turn order,
// and first player's two left-most Legends remain spent on the opening turn.
{
 const setup=H.fresh('basic',{preGame:true});
 assert.equal(setup.phase,'pregame','New interactive games begin at pregame');
 assert.equal(P.ready(setup).ok,false,'No turn action is legal before the roll-off');
 assert(setup.player.legends.every(l=>l.ready),'Legend orientation is undecided until the first player is selected');
 const tie=P.rollForOrder(setup,10,10);
 assert(tie.ok&&tie.state.opening.winner===null,'Tied d20 results require another roll');
 const win=P.rollForOrder(setup,17,6);
 assert(win.ok&&win.state.opening.winner==='player','Higher d20 wins choice');
 const first=P.chooseOrder(win.state,'player');
 assert(first.ok,'Roll winner can choose to play first');
 assert.deepEqual(first.state.player.legends.map(l=>l.ready),[false,false,true],'First player spends two left-most Legends');
 assert(P.ready(first.state).ok,'First turn can begin after selection');
 const second=P.chooseOrder(win.state,'ai');
 assert(second.ok,'Roll winner can choose second');
 assert(second.state.player.legends.every(l=>l.ready),'Second-player Legends begin ready');
 assert.equal(second.state.opening.scriptedOpponentTurnSkipped,true,'Skipped rival opening turn must be labeled');
 const lose=P.rollForOrder(setup,3,20);
 assert(lose.ok&&lose.state.opening.winner==='ai');
 assert.equal(P.chooseOrder(lose.state,'player').ok,false,'Player may not override rival selection');
 assert(P.chooseOrder(lose.state,'ai').ok,'Scripted rival chooses first when it wins the roll');
 assert.equal(P.chooseOrder(first.state,'ai').ok,false,'Cannot change order after beginning');
 assert.equal(P.rollForOrder(setup,21,2).ok,false,'Reject invalid dice');
}

// Desktop overlay regression: opening the practice tray closes the tutorial,
// opening the tutorial closes the tray, and the exit remains above both.
assert(animatedUI.includes("if(open)document.getElementById('closeBoardTour')?.click()"),
  'Opening turn controls must close the tutorial and its spotlight');
assert(animatedUI.includes("event.stopImmediatePropagation();guidanceOn=true;guideIntro=0;setActionTray(false);render()"),
  'Opening tour must dismiss turn controls');
assert(animatedUI.includes("const openingRoot=document.createElement('section')"),'Opening setup must be a standalone dialog');
assert(animatedUI.includes("const order=add('div','',openingRoot,'v3-selected-detail')"),'Roll-off must render outside the turn tray');
assert(animatedUI.includes("state.player.hand.map(c=>c.name).join('、')"),'Starting six cards must be listed in pregame');
assert(animatedUI.includes("tableControls.id='v3TableControls'"),'The playable actions need an on-table context surface');
assert(animatedUI.includes("P.play(state,card.id,pay||[],opts)"),'Selected hand units can be deployed from the table');
assert(animatedUI.includes("P.sell(state,card.id)"),'Selected hand can be sold from the table');
assert(animatedUI.includes("P.reactAttack(state,attackUnitId"),'Table attacks use the real training combat engine');
assert(animatedUI.includes("setActionTray(false)"),'Hand selection must not open the full-height test tray');

// Bounded mirror opponent turn: real cards and resource payments, no fake attacks.
{
 const source=H.fresh('basic',{preGame:true,aiMode:'mirror'});
 assert.equal(source.ai.hand.length,6,'Mirror opponent has 6 actual starter cards');
 assert.equal(source.ai.deck.length,34,'Mirror deck contains remaining 34 cards');
 assert.equal(source.ai.gigs.length,0,'Mirror opponent has no invented starting Gigs');
 const playerWins=P.rollForOrder(source,18,2);
 let start=P.chooseOrder(playerWins.state,'player');
 assert(start.ok,'Human may choose first');
 let r=P.ready(start.state);assert(r.ok);r=P.draw(r.state);assert(r.ok);r=P.roll(r.state,4,2);assert(r.ok);
 const pass=P.pass(r.state);
 assert(pass.ok&&pass.state.turn==='ai'&&pass.state.step==='pendingBot','Passing enters executable rival turn');
 assert.equal(P.opponentTurn(pass.state,9).ok,false,'Out-of-range dice rejected without changing the state');
 const done=P.opponentTurn(pass.state,3);
 assert(done.ok,'Mirror opponent can complete its turn');
 assert.equal(done.state.ai.deck.length,33,'Opponent draws exactly one');
 assert.equal(done.state.ai.gigs.length,1,'Opponent gains its first Gig');
 assert.equal(done.state.ai.eddies.length,1,'Opponent sells at most one card');
 assert.equal(done.state.ai.units.length,1,'Opponent deploys a payable vanilla Unit');
 assert.equal(done.state.ai.units[0].name,'Psycho Squad','Opponent plays its highest affordable vanilla Unit');
 assert.equal(done.state.ai.units[0].lag,false,'Lag ends with the opponent turn');
 assert.equal(done.state.turn,'player','Opponent completes and returns the turn to human');
 assert.equal(done.state.round,2,'Human receives the second round after playing first');
 assert.equal(pass.state.ai.units.length,0,'Opponent turn never mutates its input');
 const enemyWins=P.rollForOrder(source,4,17);
 start=P.chooseOrder(enemyWins.state,'ai');
 assert(start.ok&&start.state.turn==='ai','Opponent can truly take the opening turn');
 assert.equal(start.state.ai.legends.filter(l=>l.ready).length,1,'Mirror first player has two Legends spent');
 const first=P.opponentTurn(start.state,2);
 assert(first.ok&&first.state.turn==='player'&&first.state.round===1,'Opponent opening turn precedes human first turn');
 assert.equal(first.state.ai.units.length,1,'Opponent first turn pays for a two-cost Unit');
 assert.equal(first.state.ai.units[0].name,'Secondhand Bombus');
}
console.log('PASS V3 The Heist: 40 actual cards, hand selection data, sell tags, exact multi-source payment, unit deployment and unsupported ability safety.');
