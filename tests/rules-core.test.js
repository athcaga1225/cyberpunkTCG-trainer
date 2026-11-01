/* Run with: node tests/rules-core.test.js */
'use strict';const assert=require('node:assert/strict');const R=require('../rules-core.js');
const d=(id,value)=>({id,sides:6,value});
const u=(id,name,power,ready=true,extra={})=>({id,name,power,ready,lag:false,gear:[],...extra});
const game=(p={},a={})=>({player:{gigs:[],units:[],fixer:[],hand:[],deck:[],...p},ai:{gigs:[],units:[],fixer:[],hand:[],deck:[],...a}});
function test(name,fn){fn();console.log('PASS '+name);}
test('zero power cannot steal',()=>{assert.equal(R.steals(0),0);assert.equal(R.steals(9),1);assert.equal(R.steals(10),2);assert.equal(R.steals(20),3)});
test('street cred null and counted',()=>{assert.equal(R.cred([]),null);assert.equal(R.cred([d('a',2),d('b',4)]),6)});
test('d20 rolls last',()=>{const s=game({fixer:[4,20]});assert.equal(R.rollIn(s,'player',20,12).ok,false);assert.equal(R.rollIn(s,'player',4,2).state.player.gigs[0].value,2)});
test('seven gig win at start',()=>assert.equal(R.startWin(game({gigs:Array.from({length:7},(_,i)=>d('g'+i,1))}),'player'),true));
test('cannot attack ready units',()=>{const s=game({units:[u('a','Field Operator',2)]},{units:[u('b','Ruthless Lowlife',4)]});assert.equal(R.attack(s,'player','a',{kind:'unit',id:'b'}).ok,false)});
test('lag restricts attacking',()=>{const s=game({units:[u('a','Field Operator',2,true,{lag:true})]},{gigs:[d('g',4)]});assert.equal(R.attack(s,'player','a',{kind:'gig'}).ok,false)});
test('Ruthless Lowlife only attacks units',()=>{const s=game({units:[u('a','Ruthless Lowlife',4)]},{gigs:[d('g',4)]});assert.equal(R.attack(s,'player','a',{kind:'gig'}).ok,false)});
test('fight compares powers (not hit points)',()=>{const s=game({units:[u('a','Ruthless Lowlife',4)]},{units:[u('b','Field Operator',2,false)]});const r=R.attack(s,'player','a',{kind:'unit',id:'b'});assert.equal(r.state.ai.units.length,0);assert.equal(r.state.player.units[0].ready,false);assert.equal(s.player.units[0].ready,true)});
test('tied powers defeat both',()=>{const s=game({units:[u('a','Ruthless Lowlife',4)]},{units:[u('b','Ruthless Lowlife',4,false)]});const r=R.attack(s,'player','a',{kind:'unit',id:'b'});assert.equal(r.state.ai.units.length,0);assert.equal(r.state.player.units.length,0)});
test('gig stealing chooses dice',()=>{const s=game({units:[u('a','Field Operator',2)]},{gigs:[d('x',1),d('y',5)]});const r=R.attack(s,'player','a',{kind:'gig'},{dieIds:['y']});assert.deepEqual(r.state.player.gigs.map(x=>x.id),['y']);assert.deepEqual(r.state.ai.gigs.map(x=>x.id),['x'])});
test('Mantis blades raises power and steals two',()=>{const s=game({units:[u('a','Minotaur',9,true,{gear:[{name:'Mantis Blades',power:2}]})]},{gigs:[d('x',1),d('y',2),d('z',3)]});assert.equal(R.power(s.player.units[0]),11);const r=R.attack(s,'player','a',{kind:'gig'},{dieIds:['x','z']});assert.equal(r.state.player.gigs.length,2)});
test('blocker redirects attack to fight',()=>{const s=game({units:[u('a','Field Operator',2)]},{units:[u('b','Secondhand Bombus',0,true,{blocker:true})],gigs:[d('x',3)]});const r=R.attack(s,'player','a',{kind:'gig'},{blockWithId:'b'});assert.equal(r.state.player.gigs.length,0);assert.equal(r.state.ai.units.length,0)});
test('Field Operator draws on even non-null street cred',()=>{const s=game({gigs:[d('x',2),d('y',4)],deck:[{name:'drawn'}]});const r=R.playTrigger(s,'player',{name:'Field Operator'});assert.equal(r.state.player.hand.length,1)});
test('Field Operator does not draw at null street cred',()=>{const s=game({deck:[{name:'drawn'}]});const r=R.playTrigger(s,'player',{name:'Field Operator'});assert.equal(r.state.player.hand.length,0)});
test('Minotaur play conditional defeats low power',()=>{const s=game({gigs:[d('x',6)]},{gigs:[d('y',2)],units:[u('b','Field Operator',2)]});assert.equal(R.playTrigger(s,'player',{name:'Minotaur'},'b').state.ai.units.length,0)});
test('Sandevistan readies equipped unit at end turn',()=>{const s=game({units:[u('a','Field Operator',2,false,{gear:[{name:'Sandevistan',power:2}]})]});assert.equal(R.endTurnGear(s,'player').state.player.units[0].ready,true)});
console.log('All 16 official-mechanic subset tests passed.');