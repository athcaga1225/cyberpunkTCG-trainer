/* V3-only The Heist starter-card bridge.
 * Starter list: official cyberpunktcg.com/blog/wnc-starter-decks
 * Cost, types and Sell Tag: https://cyberpunktcg.wiki/decks/the-heist/
 * Basic cards can be deployed; attack/defeat/turn-triggered abilities remain pending until their timing engine exists.
 * Official card text determines when a passive effect becomes applicable.
 */
(function(root,factory){'use strict';const base=(typeof module!=='undefined'&&module.exports)?require('./turn-practice.js'):root.NCTV3TurnPractice;const api=factory(base);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Heist=api;})(typeof globalThis!=='undefined'?globalThis:this,function(P){'use strict';
const specs=[
 ['Dexter DeShawn: One Last Chance',2,'Unit',3,false],
 ['Heywood Ripperdoc',2,'Unit',6,false],
 ['Offduty Malfini',2,'Unit',4,false],
 ['Secondhand Bombus',2,'Unit',2,false],
 ['T-Bug: Amateur Philosopher',2,'Unit',4,false],
 ['Kiroshi Optics',3,'Gear',1,true],
 ['Mandibular Upgrade',3,'Gear',1,true],
 ['Zetatech Faceplate',3,'Gear',2,true],
 ["Afterparty at Lizzie's",2,'Program',1,true],
 ['Delamain Cab',3,'Unit',4,false],
 ['Evelyn Parker: Scheming Siren',3,'Unit',2,false],
 ['MT0D12 Flathead',2,'Unit',5,true],
 ['Psycho Squad',2,'Unit',4,false],
 ["Dying Night: V's Pistol",2,'Gear',2,true],
 ['Tetratronic Rippler',2,'Gear',1,true],
 ['Floor It',3,'Program',1,true],
 ['Reboot Optics',2,'Program',2,true]
];
const total=specs.reduce((n,c)=>n+c[1],0);
if(total!==40)throw Error('The Heist manifest must have 40 cards');
// Whitelist only effects that are accurately represented by the current practice state.
const supported=new Set(['Floor It','Reboot Optics','Dexter DeShawn: One Last Chance','Heywood Ripperdoc','Offduty Malfini','Secondhand Bombus','Psycho Squad','Delamain Cab','MT0D12 Flathead','Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Mandibular Upgrade','Kiroshi Optics','Zetatech Faceplate',"Dying Night: V's Pistol",'Tetratronic Rippler',"Afterparty at Lizzie's"]);
const powers={'Heywood Ripperdoc':8,'Offduty Malfini':5,'Dexter DeShawn: One Last Chance':4,'Secondhand Bombus':0,'Psycho Squad':6,'Delamain Cab':4,'MT0D12 Flathead':7,'Evelyn Parker: Scheming Siren':0,'T-Bug: Amateur Philosopher':4,'Mandibular Upgrade':0,'Kiroshi Optics':1,'Zetatech Faceplate':2,"Dying Night: V's Pistol":2,'Tetratronic Rippler':1};
const byName=new Map(specs.map(([name,qty,type,cost,sellTag])=>[name,{
 name,type,cost,sellTag,power:powers[name]??null,
 unimplementedEffect:!supported.has(name),
 onPlayGigAdjust:name==='Dexter DeShawn: One Last Chance',
 onPlayDefeatGear:name==='Heywood Ripperdoc',
 onPlaySpendRival:name==='Offduty Malfini',
 blocker:name==='Secondhand Bombus'||name==='Mandibular Upgrade',
 cannotBeBlockedIfLowerCred:name==='MT0D12 Flathead',
 deferredEffect:['Dexter DeShawn: One Last Chance','Kiroshi Optics','Delamain Cab','Mandibular Upgrade','MT0D12 Flathead','Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Zetatech Faceplate',"Dying Night: V's Pistol",'Tetratronic Rippler'].includes(name)
}]));
function fresh(scenario='basic',opts={}){
 if(!['basic','quick'].includes(scenario))throw new Error('Unknown Heist practice scenario');
 const s=P.fresh();
 const cards=specs.flatMap(([name,qty])=>Array.from({length:qty},(_,i)=>({...byName.get(name),id:'heist-'+name.replace(/[^a-z0-9]/gi,'-')+'-'+(i+1)})));
 const opening=scenario==='basic'
 ? ['Secondhand Bombus','Kiroshi Optics','Mandibular Upgrade',"Afterparty at Lizzie's",'Evelyn Parker: Scheming Siren','Dexter DeShawn: One Last Chance']
 : ['Floor It','Offduty Malfini','Heywood Ripperdoc','Psycho Squad',"Dying Night: V's Pistol",'Reboot Optics'];
 const hand=opening.map(name=>cards.splice(cards.findIndex(c=>c.name===name),1)[0]);
 // Deterministic 34-card remainder for repeatable training, not a shuffled official opening.
 s.player.hand=hand;s.player.deck=cards;
 s.player.eddies=[];s.player.legends=[
  {id:'legend-viktor',name:'Viktor Vektor: Sit Down and Relax',ready:false,faceUp:false},
  {id:'legend-v',name:'V: Corporate Exile',ready:false,faceUp:false},
  {id:'legend-jackie',name:'Jackie Welles: Pour One Out For Me',ready:true,faceUp:false}
 ];
 // A clearly labeled training target, NOT a simulated opponent opening or AI decision.
 s.ai.units=[{id:'training-rival-ruthless',name:'Ruthless Lowlife',type:'Unit',power:4,ready:true,lag:false,gear:[],trainingTarget:true}];
 // Scripted public Gig targets, not an AI's simulated opening hand or turn.
 s.ai.gigs=[{id:'training-gig-d4',sides:4,value:2,trainingTarget:true},{id:'training-gig-d6',sides:6,value:4,trainingTarget:true},{id:'training-gig-d8',sides:8,value:5,trainingTarget:true}];
 // Optional one-use scripted defender Quick. No autonomous opponent decisions.
 s.ai.quickExercise={enabled:false};
 if(opts.preGame){
  s.turn='none';s.phase='pregame';s.step='choose-order';
  s.opening={resolved:false,winner:null};
  // The first player is unknown until Rule 7.5 finishes.
  for(const legend of s.player.legends)legend.ready=true;
 }
 s.practiceKind='the-heist';s.practiceScenario=scenario;return s;
}
return {fresh,byName,cardCount:total};
});
