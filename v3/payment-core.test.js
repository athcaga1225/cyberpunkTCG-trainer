/* Run: node v3/payment-core.test.js */
'use strict';
const assert=require('node:assert/strict');
const {pay}=require('./payment-core');
const seed=()=>({player:{eddies:[{id:'e1',ready:true},{id:'e2',ready:true}],legends:[{id:'l1',ready:true},{id:'l2',ready:false}]},ai:{eddies:[],legends:[]}});
let s=seed(),r=pay(s,'player',2,{eddieIds:['e1'],legendIds:['l1']});
assert.equal(r.ok,true);
assert.equal(r.state.player.eddies[0].ready,false);
assert.equal(r.state.player.legends[0].ready,false);
assert.equal(s.player.eddies[0].ready,true,'payment must not mutate input');
assert.equal(pay(seed(),'player',2,{eddieIds:['e1','e1'],legendIds:[]}).ok,false,'no repeated resource');
assert.equal(pay(seed(),'player',2,{eddieIds:['e1'],legendIds:[]}).ok,false,'exact cost');
assert.equal(pay(seed(),'player',1,{eddieIds:[],legendIds:['l2']}).ok,false,'spent Legend');
assert.equal(pay(seed(),'player',1,{eddieIds:['unknown'],legendIds:[]}).ok,false,'unknown resource');
assert.equal(pay(seed(),'player',-1,{eddieIds:[],legendIds:[]}).ok,false,'invalid cost');
assert.equal(pay(seed(),'player',0,{eddieIds:[],legendIds:[]}).ok,true,'free cost');
assert.equal(pay(seed(),'player',1,{eddieIds:[],legendIds:['l1']}).ok,true,'pay using legend');
assert.equal(pay(seed(),'player',1,{eddieIds:['e1'],legendIds:[]}).ok,true,'pay using Eddie');
console.log('V3 payment core: 10 assertions passed');
