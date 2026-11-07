'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),H=require('../v3/heist-practice');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../v3/card-reference.js'),'utf8'),sandbox);const references=sandbox.window.NCTV3CardReference;
const state=H.fresh('basic',{aiMode:'mirror'}),names=new Set([...H.byName.keys(),...state.player.legends.map(l=>l.name)]);assert.equal(names.size,20);
for(const name of names){const ref=references[name];assert(ref,'exact printed name: '+name);assert.equal(typeof ref.abilityZh,'string',name);assert(ref.abilityZh.length>8,'readable ability: '+name);assert.equal(typeof ref.abilityEnglish,'string',name);if(H.byName.has(name))assert.equal(ref.cost,H.byName.get(name).cost,'correct card version/cost: '+name)}
assert.match(references['Dexter DeShawn: One Last Chance'].abilityEnglish,/Defeated/);assert.doesNotMatch(references['Dexter DeShawn: One Last Chance'].abilityEnglish,/Call/);assert.match(references['MT0D12 Flathead'].abilityEnglish,/can't be blocked/);assert.match(references['Tetratronic Rippler'].abilityZh,/查看/);
console.log('PASS twenty exact The Heist card/Legend references, nonempty bilingual abilities, current cost alignment, correct Dexter variant and Flathead/Rippler text');
