/* Embracing Power official starter adapter. Uses the existing mirror-turn protocol;
 * each card's behavior is implemented in the V3 effect/combat modules.
 * https://cyberpunktcg.com/blog/wnc-starter-decks */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./heist-practice'):root.NCTV3Heist);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Embracing=api;})(typeof globalThis!=='undefined'?globalThis:this,H=>{'use strict';
const specs=[
 {
  "name": "Chrome Fang",
  "qty": 2,
  "type": "Unit",
  "cost": 5,
  "power": 6,
  "color": "Red",
  "tags": [
   "GANGER",
   "NETRUNNER",
   "TYGER CLAWS"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "entryEffect": "chrome"
 },
 {
  "name": "Minotaur",
  "qty": 2,
  "type": "Unit",
  "cost": 7,
  "power": 9,
  "color": "Red",
  "tags": [
   "ARASAKA",
   "DRONE",
   "MILITECH"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "entryEffect": "minotaur"
 },
 {
  "name": "Ruthless Lowlife",
  "qty": 3,
  "type": "Unit",
  "cost": 2,
  "power": 4,
  "color": "Red",
  "tags": [
   "GANGER",
   "MAELSTROM"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "unitTargetsOnly": true
 },
 {
  "name": "Swordwise Huscle",
  "qty": 2,
  "type": "Unit",
  "cost": 3,
  "power": 3,
  "color": "Red",
  "tags": [
   "MERC"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "attackEffect": "swordwise"
 },
 {
  "name": "Emergency Atlus",
  "qty": 2,
  "type": "Unit",
  "cost": 3,
  "power": 4,
  "color": "Green",
  "tags": [
   "TRAUMA TEAM",
   "VEHICLE",
   "ZETATECH"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false
 },
 {
  "name": "Field Operator",
  "qty": 2,
  "type": "Unit",
  "cost": 3,
  "power": 2,
  "color": "Green",
  "tags": [
   "ARASAKA",
   "CORPO",
   "TECHIE"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "entryEffect": "even-draw"
 },
 {
  "name": "Goro Takemura: Losing His Way",
  "qty": 2,
  "type": "Unit",
  "cost": 4,
  "power": 4,
  "color": "Green",
  "tags": [
   "ARASAKA",
   "CORPO"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "attackEffect": "goro"
 },
 {
  "name": "MaxTac AV",
  "qty": 2,
  "type": "Unit",
  "cost": 5,
  "power": 8,
  "color": "Green",
  "tags": [
   "NCPD",
   "VEHICLE"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "entryEffect": "swap"
 },
 {
  "name": "Arasaka Emergency Radioport",
  "qty": 2,
  "type": "Gear",
  "cost": 2,
  "power": 2,
  "color": "Red",
  "tags": [
   "ARASAKA",
   "CYBERWARE"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "spendEffect": "radioport"
 },
 {
  "name": "Mantis Blades",
  "qty": 3,
  "type": "Gear",
  "cost": 1,
  "power": 2,
  "color": "Red",
  "tags": [
   "CYBERWARE"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false
 },
 {
  "name": "Satori: Sword of Saburo",
  "qty": 3,
  "type": "Gear",
  "cost": 2,
  "power": 2,
  "color": "Red",
  "tags": [
   "ARASAKA",
   "WEAPON"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "fightWinDraw": true
 },
 {
  "name": "Industrial Assembly",
  "qty": 2,
  "type": "Program",
  "cost": 1,
  "power": null,
  "color": "Red",
  "tags": [
   "ARASAKA",
   "BRAINDANCE"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "programEffect": "industrial"
 },
 {
  "name": "Over the Edge",
  "qty": 2,
  "type": "Program",
  "cost": 3,
  "power": null,
  "color": "Red",
  "tags": [
   "MERC"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "programEffect": "over-edge"
 },
 {
  "name": "Shattered Memories",
  "qty": 2,
  "type": "Program",
  "cost": 4,
  "power": null,
  "color": "Red",
  "tags": [
   "BRAINDANCE"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "programEffect": "shattered"
 },
 {
  "name": "Corpo Security",
  "qty": 3,
  "type": "Unit",
  "cost": 2,
  "power": 2,
  "color": "Green",
  "tags": [
   "CORPO"
  ],
  "sellTag": false,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "cannotAttack": true,
  "blocker": true
 },
 {
  "name": "Sandevistan",
  "qty": 3,
  "type": "Gear",
  "cost": 3,
  "power": 2,
  "color": "Green",
  "tags": [
   "CYBERWARE"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "endReadyHost": true
 },
 {
  "name": "Corporate Surveillance",
  "qty": 3,
  "type": "Program",
  "cost": 2,
  "power": null,
  "color": "Green",
  "tags": [
   "CORPO"
  ],
  "sellTag": true,
  "unimplementedEffect": false,
  "deferredEffect": false,
  "programEffect": "surveillance"
 }
];
const legends=[
 {
  "name": "Goro Takemura: Hands Unclean",
  "legendEffect": "goro-legend",
  "sellTag": true,
  "type": "Legend",
  "cost": 5,
  "power": 7,
  "color": "Green",
  "tags": [
   "ARASAKA",
   "CORPO"
  ],
  "goSolo": true,
  "blocker": true
 },
 {
  "name": "Yorinobu Arasaka: Embracing Destruction",
  "legendEffect": "yorinobu",
  "sellTag": true,
  "type": "Legend",
  "cost": null,
  "power": null,
  "color": "Red",
  "tags": [
   "ARASAKA",
   "CORPO"
  ]
 },
 {
  "name": "Saburo Arasaka: Stubborn Patriarch",
  "legendEffect": "saburo",
  "sellTag": true,
  "type": "Legend",
  "cost": null,
  "power": null,
  "color": "Green",
  "tags": [
   "ARASAKA",
   "CORPO"
  ]
 }
];
const byName=new Map(specs.map(({qty,...c})=>[c.name,c]));
function fresh(scenario='random',opts={}){
 if(scenario!=='random'||(opts.aiMode&&opts.aiMode!=='mirror'))throw Error('Embracing Power supports random-opening mirror mode');
 const s=H.fresh('random',{...opts,aiMode:'mirror',preGame:true});s.practiceKind='embracing-power';s.deckKey='embracingPower';s.practiceScenario='random';
 for(const who of ['player','ai']){const p=s[who];p.hand=[];p.deck=specs.flatMap(({qty,...c})=>Array.from({length:qty},(_,i)=>({...c,id:'ep-'+who+'-'+c.name.replace(/[^a-z0-9]/gi,'-')+'-'+i})));p.legends=legends.map((l,i)=>({...l,id:'ep-'+who+'-legend-'+i,ready:true,faceUp:false}));}
 return s;
}
return {specs,legends,byName,fresh};});
