/* V3 beginner lessons integration acceptance tests. Run: node tests/v3-lessons.test.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const beta=JSON.parse(read('beta-cards.json')).cards;
// Catalogue integrity: cross-check Retail self-hosted art, Beta links and mechanic fields.
const retail=JSON.parse(read('v3/retail-printings.json')).cards;
assert.equal(beta.length,178,'Beta must contain 172 B-numbered variants plus 6 T cards');
assert.equal(retail.length,172,'Retail must contain 172 distinct printings (005A/005B)');
assert.equal(new Set(retail.map(c=>c.id)).size,172,'Retail card numbers must be unique');
const betaById=new Map(beta.map(c=>[c.id,c]));
assert.equal(betaById.size,178,'Beta IDs must be unique');
for(const card of retail){
 assert(card.name && card.id && card.retailImageUrl,'Retail name, ID and local image required: '+card.id);
 const match=betaById.get(card.betaId);
 assert(match,'Retail references missing Beta printing: '+card.id);
 assert.equal(card.name,match.name,'Retail and Beta English card names mismatch: '+card.id);
 assert(card.retailImageUrl.startsWith('v3/retail-art/'),'Retail must use a self-hosted image: '+card.id);
 assert(fs.existsSync(path.join(root,card.retailImageUrl)),'Missing Retail image file: '+card.id);
 assert(fs.statSync(path.join(root,card.retailImageUrl)).size>0,'Empty Retail image file: '+card.id);
}
for(const card of beta){
 assert(card.name&&card.nameZh&&card.abilityEnglish&&card.abilityZh,'Beta card must contain bilingual name and ability: '+card.id);
 assert(card.ram!=null,'Beta RAM must be provided: '+card.id);
 if(card.type==='Program')assert(card.power==null,'Programs have no printed Power: '+card.id);
 else if(card.type==='Legend'){
  assert.equal(card.cost!=null,/\bGo Solo\b/i.test(card.abilityEnglish),'Legend cost and Go Solo should be consistent: '+card.id);
  assert.equal(card.power!=null,card.cost!=null,'Legend printed Power should match cost availability: '+card.id);
 }else{
  assert(card.cost!=null&&card.power!=null,'Unit/Gear requires cost and printed Power: '+card.id);
 }
}

// V3-only card ability vocabulary: the shared Beta source and V2 are never rewritten.
const gallerySource=read('v3/beta-gallery.js');
const abilityMatch=gallerySource.match(/const localizedAbilityText=value=>([\\s\\S]*?);\\nconst searchIdentifiers/);
assert(abilityMatch,'V3 ability terminology formatter must be present');
const formatAbility=vm.runInNewContext('(()=>{const localizedAbilityText=value=>'+abilityMatch[1]+';return localizedAbilityText})()');
const example='【獨闖（Go Solo）】【阻擋（Blocker）】【快速（Quick）】將一顆任務骰重置。攻擊已橫置的單位。以重置狀態打出。【橫置（Spend）】';
assert.equal(formatAbility(example),'【獨武俠（Go Solo）】【攔截（Blocker）】【快速反應（Quick）】將一顆委託骰重置。攻擊已使用的單位。以就緒狀態打出。【橫置（Spend）】','Standardize only equivalent card ability terminology while retaining action verbs');
let impacted=0;
for(const card of beta){
 const translated=formatAbility(card.abilityZh);
 if(translated!==card.abilityZh)impacted++;
 for(const old of ['任務骰','獨闖（Go Solo）','阻擋（Blocker）','快速（Quick）','重置狀態','已橫置的']){
  assert(!translated.includes(old),'Old terminology leaked into V3 card detail: '+card.id+' / '+old);
 }
 assert.equal(formatAbility(translated),translated,'Terminology formatter must be idempotent: '+card.id);
}
assert(impacted>=79,'At least the 79 historical Gig Die translations must be standardized');
assert(gallerySource.includes('localizedAbilityText(c.abilityZh'),'Card detail must display the standardized wording');
assert(gallerySource.includes('abilityZh:localizedAbilityText(source.abilityZh'),'Starter cards must use the standardized wording');
const starters=read('starter-decks.js');
const lessonSource=read('v3/trainer-modules.js');
const v3Html=read('v3/index.html');
assert(v3Html.includes('V3 shared visual rhythm'),'Shared type and panel system must remain present');
assert(v3Html.includes('#rules .term-entry>summary *'),'Rule accordion text selection guard must remain present');
assert(v3Html.includes('#rules .term-entry[open]>summary span::before'),'Rule accordion has matching CSS minus indicator');
assert(v3Html.includes('#home .grid .panel,#rules>.panel'),'Home and rules panels use shared treatment');
assert(v3Html.includes('#home>h1,#learn>h1,#rules>h1,#decks>h1'),'Major pages use one heading scale');
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
assert(!all(elements.labStage,'span').some(x=>x.textContent.includes('已完成 ')&&x.textContent.includes(' 課')),'No redundant completed-lesson count beside lesson label');
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
const incorrect=new Map([[0,1],[1,1],[2,1],[3,1],[4,2],[5,2],[7,1],[8,1],[9,1],[10,1]]);
const notice=()=>all(elements.labStage,'div').find(x=>x.className.includes('lesson-feedback'));
const feedbackDetail=()=>notice()?.children.find(x=>x.className==='lesson-feedback-detail')?.textContent||'';
const feedbackTitle=()=>notice()?.children.find(x=>x.className==='lesson-feedback-title')?.textContent||'';
for(let i=0;i<11;i++){
 goto(i);
 assert(!all(elements.labStage,'strong').some(x=>x.textContent.includes('本課已通過')),'Lesson must not auto-pass on navigation: '+i);
 if(incorrect.has(i)){
  const previous=progress();
  choose(incorrect.get(i));
  assert.deepEqual(progress(),previous,'Incorrect option must not advance completion: '+i);
  assert(notice()?.className.includes('is-error'),'Wrong answer must render error feedback: '+i);
  assert.equal(feedbackTitle(),'請再試一次','Wrong answer heading: '+i);
  assert(feedbackDetail().length>0,'Wrong answer must explain its failure: '+i);
  if(i===8)assert(feedbackDetail().includes('不攔截也符合規則'),'Lesson 09 must explain legal-but-wrong choice');
  assert(!all(elements.labStage,'strong').some(x=>x.textContent.includes('已完成本課')),'Wrong answer must not pass: '+i);
  assert(all(elements.labStage,'div').find(x=>x.className==='actions')?.children.some(x=>x.tag==='button'),'Wrong answer keeps exercise choices available: '+i);
 }
 choose(correct[i]);
 assert(progress().includes(i),'Lesson '+(i+1)+' must be completable');
 assert(notice()?.className.includes('is-success'),'Correct answer must render success feedback: '+i);
 assert.equal(feedbackTitle(),'操作正確','Correct answer heading: '+i);
 if(i===8){
  assert(feedbackDetail().includes('攔截'),'Lesson 09 should resolve correctly after wrong legal choice');
 }
 if(i===0){assert(feedbackDetail().includes('事前準備正確：'),'Correct answer explanation remains');assert(!feedbackDetail().includes('答對了，已記錄本課完成進度'),'Redundant success suffix removed');assert(!feedbackDetail().includes('。。'),'No doubled sentence punctuation');}
}
assert.equal(progress().length,11,'All eleven lessons must complete independently');
// Lesson 07 intentionally has two valid gig targets; both are correct.
goto(6);
choose(1);
assert(all(elements.labStage,'strong').some(x=>x.textContent.includes('已完成本課')),'Second valid gig choice also passes lesson 07');

goto(10);
assert(all(elements.labStage,'button').some(b=>b.textContent==='重設教學進度'),'Reset should appear after all completed');
action('重設教學進度');
assert.equal(progress().length,0,'Reset clears lesson progress');
assert.equal(elements.chapterNav.children.length,11,'Reset preserves free navigation');
console.log('PASS: 11 lessons, invalid choices, free navigation, retry, progress and reset');
console.log('PASS: five named cards and four Beta Chinese names match canonical card datasets');
