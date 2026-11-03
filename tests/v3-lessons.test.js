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
assert(!buttons().some(x=>x.textContent==='← 上一課'),'Previous lesson button must not appear');
goto(5);
assert(!buttons().some(x=>x.textContent==='← 上一課'),'Previous lesson button is redundant because chapter navigation exists');

// Control layout is consistent after lesson completion.
goto(0);
assert(!all(elements.labStage,'div').some(x=>x.textContent==='先閱讀上方解說，再選一個操作。'),'Do not show idle instruction notice');
assert(!all(elements.labStage,'button').some(x=>x.textContent==='重新練習這一課 ↻'),'Retry must not appear before lesson completion');
assert(!all(elements.labStage,'h3').some(x=>x.textContent==='本課重點'),'Redundant lesson label is removed');
const colorRoot=all(elements.labStage,'section').find(x=>x.className==='lesson-colors');
assert(colorRoot,'Lesson 01 must show color reference');
const colorButtons=all(colorRoot,'button');
const colorPanels=all(colorRoot,'div').filter(x=>x.className==='lesson-color-detail');
assert.equal(colorButtons.length,4,'Four compact color buttons');
assert.equal(colorPanels.length,4,'Four descriptions must exist from initial render');
assert.equal(colorPanels[0].style.display,'block','Red description visible by default');
const explanations=new Set();
for(const [i,color] of ['紅色','綠色','藍色','黃色'].entries()){
 const title=all(colorPanels[i],'strong')[0];
 const description=all(colorPanels[i],'p')[0];
 assert(title.textContent.includes(color),'Named description: '+color);
 assert(description.textContent.length>20,'Description populated on initial render: '+color);
 explanations.add(description.textContent);
 colorButtons[i].onclick();
 assert.equal(colorButtons[i].getAttribute('aria-pressed'),'true','Active color selection');
 assert.equal(colorPanels[i].style.display,'block','Selected color description visible');
 assert.equal(colorPanels.filter(p=>p.style.display==='block').length,1,'Only one visible description');
}
assert.equal(explanations.size,4,'Different content for each color');
for(let i=0;i<11;i++){assert.equal(typeof elements.chapterNav.children[i].onclick,'function','Chapter must be freely selectable: '+i);}
goto(5);
choose(0);
assert.equal(progress().length,0,'Invalid attack must not pass lesson 06');
choose(1);
assert(progress().includes(5),'Valid attack must pass lesson 06');
assert(all(elements.labStage,'button').some(x=>x.textContent==='重新練習這一課 ↻'),'Retry appears after completion');
assert(all(elements.labStage,'button').some(x=>x.textContent==='下一課 →'),'Next lesson appears after completion');
action('重新練習這一課 ↻');
assert(all(elements.labStage,'button').some(b=>b.textContent.includes('攻擊對手已使用的角色')),'Retry should restore the exercise');
assert(progress().includes(5),'Retry must preserve recorded completion');
goto(5);
assert(!all(elements.labStage,'strong').some(x=>x.textContent.includes('本課已通過')),'Revisiting a completed lesson should allow a fresh attempt');
assert(all(elements.labStage,'button').some(x=>x.textContent.includes('攻擊對手已使用的角色')),'Completed lesson must still display question choices');
const correct=[0,0,0,0,0,1,0,0,0,0,0];
for(let i=0;i<11;i++){
 goto(i);
 assert(!all(elements.labStage,'strong').some(x=>x.textContent.includes('本課已通過')),'Lesson must not auto-pass on navigation: '+i);
 choose(correct[i]);
 assert(progress().includes(i),'Lesson '+(i+1)+' must be completable');
 if(i===0){const notice=all(elements.labStage,'div').find(x=>x.className==='notice');assert(notice?.textContent.includes('事前準備正確：'),'Correct answer explanation remains');assert(!notice.textContent.includes('答對了，已記錄本課完成進度'),'Redundant success suffix removed');assert(!notice.textContent.includes('。。'),'No doubled sentence punctuation');}
}
assert.equal(progress().length,11,'All eleven lessons must complete independently');
goto(10);
assert(all(elements.labStage,'button').some(b=>b.textContent==='重設教學進度'),'Reset should appear after all completed');
action('重設教學進度');
assert.equal(progress().length,0,'Reset clears lesson progress');
assert.equal(elements.chapterNav.children.length,11,'Reset preserves free navigation');
console.log('PASS: 11 lessons, invalid choices, free navigation, retry, progress and reset');
console.log('PASS: five named cards and four Beta Chinese names match canonical card datasets');
