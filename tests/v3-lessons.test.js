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
assert(gallerySource.includes("'Japantown Jonin':'日本城精銳'"),'V3 name for Japantown Jonin must match requested terminology');

const abilityMatch=gallerySource.match(/const localizedAbilityText=value=>([\s\S]*?);\s*\/\/ Two choice cards/);
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
// Bilingual gameplay audit: compare all 178 cards' printed effect labels and
// preserve one Chinese wording for identical English effects across printings.
const triggerLabels=[
 [/\{Call\}/,'【呼叫（Call）】'],[/\{Play\}/,'【打出（Play）】'],
 [/\{Attack\}/,'【攻擊（Attack）】'],[/\{Spend\}/,'【橫置（Spend）】'],
 [/\{Quick\}/,'【快速（Quick）】'],[/\{Blocker\}/,'【阻擋（Blocker）】'],
 [/\{Defeated\}/,'【被擊敗（Defeated）】'],[/\{Go Solo\}/,'【獨闖（Go Solo）】']
];
const sameRuleChinese=new Map();
for(const card of beta){
 const en=card.abilityEnglish,zh=card.abilityZh;
 for(const [pattern,marker] of triggerLabels){
  assert.equal(pattern.test(en),zh.includes(marker),'English/Chinese trigger mismatch: '+card.id+' / '+marker);
 }
 const established=sameRuleChinese.get(en);
 if(established!==undefined)assert.equal(zh,established,'Same English ability must use the same Chinese wording: '+card.id);
 else sameRuleChinese.set(en,zh);
}
for(const entry of retail){
 if(entry.officialRulesEnglish!=null){
  assert.equal(entry.officialRulesEnglish,betaById.get(entry.betaId).abilityEnglish,'Retail rule override differs from shared Chinese ability reference: '+entry.id);
 }
}
const corrected=gallerySource.match(/const correctedAbilityByName=(\{[\s\S]*?\});\nconst localizedAbilityForCard/);
assert(corrected,'V3 card-specific corrections must be defined');
const special=vm.runInNewContext('('+corrected[1]+')');
assert(special['Pyramid Song'].includes('兩項都執行')&&special['Pyramid Song'].includes('②'),'Pyramid Song must apply both effects when d4 condition holds');
assert(special['Towerfall'].includes('兩項都執行')&&special['Towerfall'].includes('②'),'Towerfall must apply both effects when Street Cred condition holds');
assert(special['Nocturne OP55 N1'].includes('可以使用【獨武俠（Go Solo）】'),'Nocturne must preserve optional Go Solo permission');
assert(special['Trust No One'].includes('最多降低 3。然後，若'),'Trust No One must resolve the die adjustment before checking the draw condition');
assert.equal(betaById.get('B139').abilityEnglish,'Decrease a Gig by up to 3. Then, if you control a min Gig, draw 1.','Trust No One original English effect preserved');
assert(special['Nocturne OP55 N1'].includes('最低仍為 1'),'Nocturne retains minimum one Eddie cost');
assert(gallerySource.includes('abilityZh:localizedAbilityForCard(card)'),'Special rules corrections must reach Beta and Retail detail views');
assert.equal(formatAbility('處於已橫置狀態，將已重置的單位放到任務骰區'), '處於已使用狀態，將就緒的單位放到委託區','State terms are normalized without changing active verbs');
assert.equal(formatAbility('攻擊任務骰區，搶走一顆任務骰'),'攻擊委託區，搶走一顆委託骰','Gig area must not become Gig dice area when normalizing terminology');
// Keep official errata tied to the exact misprinted Beta Iconic printing.
assert(gallerySource.includes("c.set==='beta'&&c.id==='B159'"),'B159 Sell-tag warning must be printing-specific');
assert(gallerySource.includes('可變賣（Sell）標記為誤印'),'Official errata must mention the misprinted Sell tag');
assert(betaById.get('B159').name==='Johnny Silverhand: Never Stop Fighting','B159 official erratum must match card');
assert(betaById.get('B061').abilityEnglish.includes('Equip to a friendly Unit or face-up Legend'),'Kiroshi Optics source already reflects official reminder erratum');
// Catalogue pagination and complete 178-printing bilingual audit regression.
assert(gallerySource.includes('const PAGE_SIZE=25;'),'Catalogue must display 25 cards on each full page');
assert.equal(Math.ceil(beta.length/25),8,'178 Beta printings must span 8 pages with 25 per full page');
assert.equal(beta.length-25*7,3,'Last Beta-only page contains 3 cards');
const reviewedRows=read('v3/ability-audit-2026-11-03.md').split('## 逐張核對清單')[1].split('## 下一個驗證門檻')[0].split('\n').filter(line=>/^\| (?:B\d{3}[AB]?|T\d{3}) \|/.test(line));
assert.equal(reviewedRows.length,178,'Audit document must include each of 178 printings');
const reviewIds=reviewedRows.map(line=>line.split('|')[1].trim());
assert.equal(new Set(reviewIds).size,178,'Audit must not duplicate a printing');
for(const card of beta)assert(reviewIds.includes(card.id),'Audit missing '+card.id);
const englishFamilies=new Map();
for(const card of beta){
 const current=englishFamilies.get(card.abilityEnglish);
 if(current!==undefined)assert.equal(card.abilityZh,current,'Identical English rules translated inconsistently: '+card.id);
 else englishFamilies.set(card.abilityEnglish,card.abilityZh);
}
assert.equal(englishFamilies.size,146,'Ability source has 146 distinct English gameplay texts');
assert(special['Meredith Stout: Stone Cold Corpo'].includes('由該對手控制的委託骰'),'Meredith must identify whose Gigs are changed');
assert(special['The Heist'].includes('可以改為免費打出'),'The Heist must present the free play as alternative to putting Gear in hand');
// Record each directly checked official Retail page separately from Beta-derived assumptions.
const sourceVerified=JSON.parse(read('v3/retail-official-verification.json')).entries;
assert.equal(sourceVerified.length,139,'139 Retail printings checked against the official card pages');
assert.equal(new Set(sourceVerified.map(x=>x.retailId)).size,139,'Official Retail snapshots must have unique printing numbers');
const cleanCurrentText=x=>String(x).replaceAll('☆ (Street Cred)','Street Cred').replace(/\s+/g,' ').trim();
for(const evidence of sourceVerified){
 const item=retail.find(c=>c.id===evidence.retailId);
 assert(item,'Official snapshot must match an existing Retail printing '+evidence.retailId);
 assert.equal(item.betaId,evidence.betaId,'Snapshot Beta mapping '+evidence.retailId);
 const base=betaById.get(evidence.betaId);
 assert.equal(evidence.officialRulesEnglish && cleanCurrentText(evidence.officialRulesEnglish),cleanCurrentText(base.abilityEnglish),'Official English content changed vs Beta '+evidence.retailId);
 assert.equal(evidence.cost,base.cost,'Official COST mismatch '+evidence.retailId);
 assert.equal(evidence.power,base.power,'Official PWR mismatch '+evidence.retailId);
 assert.equal(evidence.ram,base.ram,'Official RAM mismatch '+evidence.retailId);
 assert(evidence.officialUrl.startsWith('https://cyberpunktcg.com/cards/'),'Official source URL missing '+evidence.retailId);
}
assert(gallerySource.includes("c.set==='retail'&&c.retailNumber==='138'"),'Retail 138 printing alone should show Towerfall artist erratum');
assert(gallerySource.includes('Dardo Studios'),'Towerfall artist credit corrected per official Oct 28 errata');
const audit=JSON.parse(read('v3/retail-172-audit.json'));
assert.equal(audit.entries.length,172);
assert.equal(new Set(audit.entries.map(c=>c.retailNumber)).size,172);
for(const [status,n] of Object.entries({'official-page-current-text-checked':139,'official-printing-listed-shared-card-rules':32,'cross-source-card-database':1})){
 assert.equal(audit.entries.filter(c=>c.verificationStatus===status).length,n);
}
for(const c of audit.entries){
 const item=retail.find(x=>x.id===c.retailNumber),base=betaById.get(c.betaSource);
 assert(item&&base,'Missing mapped Retail record '+c.retailNumber);
 assert.equal(c.betaSource,item.betaId);
 assert.equal(c.currentEnglishRules,base.abilityEnglish);
 assert.equal(c.cost,base.cost);assert.equal(c.ram,base.ram);assert.equal(c.power,base.power);
 assert.equal(c.printedNumberDirectlyVerified,sourceVerified.some(x=>x.retailId===c.retailNumber));
}
const starters=read('starter-decks.js');
const lessonSource=read('v3/trainer-modules.js');
const v3Html=read('v3/index.html');
const v3Layout=read('v3/table-layout.css').replace(/\s+/g,'');
assert(v3Html.includes('class="v3-rotate-overlay"'),'V3 battle must provide a portrait rotation gate');
assert(v3Layout.includes('@mediascreenand(orientation:portrait)and(max-width:900px)'),'Portrait gating must apply only to phone-sized viewports');
assert(v3Layout.includes('body.battle-wide#battle>:not(.v3-rotate-overlay){display:none;'),'Portrait must block access to battle controls');
assert(v3Html.includes('class="btn" data-go="home">返回首頁'),'The rotation gate must allow returning to other website sections');

assert(v3Html.includes('v3/site.css?v=1')&&v3Html.includes('v3/design-system.css?v=3'),'V3 visual roles load as external stylesheets');

assert(!v3Html.includes('官方規則優先</h2>'),'Redundant official rules explanation is removed');
assert(v3Html.includes('class="rules-official-link"'),'Official rules link remains available');
assert(v3Html.includes('class="rules-official-link"><a href="https://cyberpunktcg.com/comprehensive-rules"'),'Official rules link is plain text, not a framed button');
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
window.NCTV3Actions=require('../v3/battle-actions.js');
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
assert.equal(elements.chapterNav.children.length,12,'Exactly 12 chapters should be available');
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
for(let i=0;i<12;i++){assert.equal(typeof elements.chapterNav.children[i].onclick,'function','Chapter must be freely selectable: '+i);}
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
const correct=[0,0,0,0,0,1,0,0,0,0,0,0];
const incorrect=new Map([[0,1],[1,1],[2,1],[3,1],[4,2],[5,2],[7,1],[8,1],[9,1],[10,1],[11,1]]);
const notice=()=>all(elements.labStage,'div').find(x=>x.className.includes('lesson-feedback'));
const feedbackDetail=()=>notice()?.children.find(x=>x.className==='lesson-feedback-detail')?.textContent||'';
const feedbackTitle=()=>notice()?.children.find(x=>x.className==='lesson-feedback-title')?.textContent||'';
for(let i=0;i<12;i++){
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
 if(i===11){
  assert(!progress().includes(i),'Lesson 12 requires both payment steps');
  assert.equal(all(elements.labStage,'div').find(x=>x.className==='actions').children.filter(x=>x.tag==='button').length,2,'Second stage also offers two choices');
  choose(1);
  assert(!progress().includes(i),'Cannot sell twice in the same turn');
  choose(0);
 }
 assert(progress().includes(i),'Lesson '+(i+1)+' must be completable');
 assert(notice()?.className.includes('is-success'),'Correct answer must render success feedback: '+i);
 assert.equal(feedbackTitle(),'操作正確','Correct answer heading: '+i);
 if(i===8){
  assert(feedbackDetail().includes('攔截'),'Lesson 09 should resolve correctly after wrong legal choice');
 }
 if(i===0){assert(feedbackDetail().includes('事前準備正確：'),'Correct answer explanation remains');assert(!feedbackDetail().includes('答對了，已記錄本課完成進度'),'Redundant success suffix removed');assert(!feedbackDetail().includes('。。'),'No doubled sentence punctuation');}
}
assert.equal(progress().length,12,'All twelve lessons must complete independently');
// Lesson 07 intentionally has two valid gig targets; both are correct.
goto(6);
choose(1);
assert(all(elements.labStage,'strong').some(x=>x.textContent.includes('已完成本課')),'Second valid gig choice also passes lesson 07');

goto(10);
assert(all(elements.labStage,'button').some(b=>b.textContent==='重設教學進度'),'Reset should appear after all completed');
action('重設教學進度');
assert.equal(progress().length,0,'Reset clears lesson progress');
assert.equal(elements.chapterNav.children.length,12,'Reset preserves free navigation');
console.log('PASS: 12 lessons, invalid choices, free navigation, retry, progress and reset');
console.log('PASS: five named cards and four Beta Chinese names match canonical card datasets');
