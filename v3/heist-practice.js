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
const supported=new Set(['Dexter DeShawn: One Last Chance','Secondhand Bombus','Psycho Squad','Delamain Cab','MT0D12 Flathead','Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Mandibular Upgrade','Kiroshi Optics','Zetatech Faceplate',"Afterparty at Lizzie's"]);
const powers={'Dexter DeShawn: One Last Chance':4,'Secondhand Bombus':0,'Psycho Squad':6,'Delamain Cab':4,'MT0D12 Flathead':7,'Evelyn Parker: Scheming Siren':0,'T-Bug: Amateur Philosopher':4,'Mandibular Upgrade':0,'Kiroshi Optics':1,'Zetatech Faceplate':2};
const byName=new Map(specs.map(([name,qty,type,cost,sellTag])=>[name,{
 name,type,cost,sellTag,power:powers[name]??null,
 unimplementedEffect:!supported.has(name),
 onPlayGigAdjust:name==='Dexter DeShawn: One Last Chance',
 blocker:name==='Secondhand Bombus'||name==='Mandibular Upgrade',
 cannotBeBlockedIfLowerCred:name==='MT0D12 Flathead',
 deferredEffect:['Dexter DeShawn: One Last Chance','Kiroshi Optics','Delamain Cab','Mandibular Upgrade','MT0D12 Flathead','Evelyn Parker: Scheming Siren','T-Bug: Amateur Philosopher','Zetatech Faceplate'].includes(name)
}]));
function fresh(){
 const s=P.fresh();
 const cards=specs.flatMap(([name,qty])=>Array.from({length:qty},(_,i)=>({...byName.get(name),id:'heist-'+name.replace(/[^a-z0-9]/gi,'-')+'-'+(i+1)})));
 const opening=['Secondhand Bombus','Kiroshi Optics','Mandibular Upgrade',"Afterparty at Lizzie's",'Evelyn Parker: Scheming Siren','Psycho Squad'];
 const hand=opening.map(name=>cards.splice(cards.findIndex(c=>c.name===name),1)[0]);
 // Deterministic 34-card remainder for repeatable training, not a shuffled official opening.
 s.player.hand=hand;s.player.deck=cards;
 s.player.eddies=[];s.player.legends=[
  {id:'legend-viktor',name:'Viktor Vektor: Sit Down and Relax',ready:false,faceUp:false},
  {id:'legend-v',name:'V: Corporate Exile',ready:false,faceUp:false},
  {id:'legend-jackie',name:'Jackie Welles: Pour One Out For Me',ready:true,faceUp:false}
 ];s.practiceKind='the-heist';return s;
}
return {fresh,byName,cardCount:total};
});
