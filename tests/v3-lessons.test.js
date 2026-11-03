/* V3 beginner lessons integration acceptance tests. Run: node tests/v3-lessons.test.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const beta=JSON.parse(read('beta-cards.json')).cards;
const starters=read('starter-decks.js');
const lessonSource=read('v3/trainer-modules.js');
const official=read('official-cards.js');
const cardNames=new Set(beta.map(c=>c.name));
for(const m of starters.matchAll(/\["([^"]+)",\d+\]/g))cardNames.add(m[1]);
const expected=['Ruthless Lowlife','Field Operator','Minotaur','Mantis Blades','Secondhand Bombus'];
for(const name of expected){
 assert(cardNames.has(name),'Card used by V3 is missing from canonical Beta/Starter data: '+name);
 assert(official.includes('name:"'+name+'"'),'Card missing from curated lesson references: '+name);
}
for(const [en,zh] of [['Ruthless Lowlife','狠毒混混'],['Field Operator','外勤幹員'],['Mantis Blades','螳螂刀'],['Secondhand Bombus','二手蜂型機器人']]){
 assert(beta.some(c=>c.name===en&&c.nameZh===zh),'Mismatch with checked Beta translation for '+en);
}
assert(starters.includes('"Minotaur"'),'Minotaur must be referenced from Starter, not Beta booster');

class El{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attributes={};this.style={};this.className='';this.textContent='';this.onclick=null;this.classList={add:(name)=>{this.className+=' '+name}};}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(k,v){this.attributes[k]=v;}
 getAttribute(k){return this.attributes[k];}
}
const elements={chapterNav:new El(),labStage:new El(),verifiedCardList:new El()};
const storage=new Map();
const window={};
const context={window,document:{
 getElementById:id=>elements[id]||null,
 createElement:tag=>new El(tag)
},localStorage:{
 getItem:k=>storage.has(k)?storage.get(k):null,
 setItem:(k,v)=>storage.set(k,v)
},console};
window.NCTRules=require('../rules-core.js');
vm.runInNewContext(read('localization.js'),{window,globalThis:window});
vm.runInNewContext(official,{window});
window.NCT_OFFICIAL_CARDS=window.NCT_OFFICIAL_CARDS||[];
vm.runInNewContext(lessonSource,context,{filename:'v3/trainer-modules.js'});
const all=(parent,tag)=>parent.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...all(child,tag)]);
const buttons=()=>all(elements.labStage,'button');
const action=(text)=>{const b=buttons().find(x=>x.textContent===text);assert(b,'Missing button: '+text);b.onclick();};
const choose=(n)=>{const a=all(elements.labStage,'div').find(x=>x.className==='actions');assert(a,'Missing quiz choices');const bs=a.children.filter(x=>x.tag==='button');assert(bs[n],'Missing choice '+n);bs[n].onclick();};
const goto=i=>{const b=elements.chapterNav.children[i];assert(b,'Missing lesson '+(i+1));b.onclick();};
const progress=()=>JSON.parse(storage.get('nct-integrated-lessons-v3')||'[]');
assert.equal(elements.chapterNav.children.length,11,'Exactly 11 chapters should be available');
const colorRoot=all(elements.labStage,'section').find(x=>x.className==='lesson-colors');
assert(colorRoot,'Lesson 01 needs a visible color reference');
const tiles=all(colorRoot,'details');
assert.equal(tiles.length,4,'Four native color disclosures must exist');
assert.equal(tiles[0].getAttribute('open'),'','Red explanation must be visible immediately');
const explanations=new Set();
for(const [i,color] of ['紅色','綠色','藍色','黃色'].entries()){
 const summary=all(tiles[i],'summary')[0];
 const body=all(tiles[i],'div').find(x=>x.className==='lesson-color-tile-body');
 assert(summary.textContent.includes(color),'Color selector must be labeled: '+color);
 assert(body,'Each color should have an explanation container');
 const explanation=all(body,'p')[0];
 assert(explanation && explanation.textContent.length>20,'Each color needs substantive content');
 explanations.add(explanation.textContent);
}
assert.equal(explanations.size,4,'Color explanations must differ');
for(let i=0;i<11;i++){assert.equal(typeof elements.chapterNav.children[i].onclick,'function','Chapter must be freely selectable: '+i);}
goto(5);
choose(0);
assert.equal(progress().length,0,'Invalid attack must not pass lesson 06');
choose(1);
assert(progress().includes(5),'Valid attack must pass lesson 06');
action('重新練習這一課');
assert(all(elements.labStage,'button').some(b=>b.textContent.includes('攻擊對手已使用的角色')),'Retry should restore the exercise');
assert(progress().includes(5),'Retry must preserve recorded completion');
const correct=[0,0,0,0,0,1,0,0,0,0,0];
for(let i=0;i<11;i++){
 goto(i);
 if(progress().includes(i))action('重新練習這一課');
 choose(correct[i]);
 assert(progress().includes(i),'Lesson '+(i+1)+' must be completable');
}
assert.equal(progress().length,11,'All eleven lessons must complete independently');
goto(10);
assert(all(elements.labStage,'button').some(b=>b.textContent==='重設教學進度'),'Reset should appear after all completed');
action('重設教學進度');
assert.equal(progress().length,0,'Reset clears lesson progress');
assert.equal(elements.chapterNav.children.length,11,'Reset preserves free navigation');
console.log('PASS: 11 lessons, invalid choices, free navigation, retry, progress and reset');
console.log('PASS: five named cards and four Beta Chinese names match canonical card datasets');
