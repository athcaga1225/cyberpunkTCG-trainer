/* Curated official card facts. Traditional Chinese descriptions are summaries,
   not authoritative translations. Always consult the linked official English text.
   These entries deliberately mark unsupported interactions. */
window.NCT_OFFICIAL_CARDS=[
  {name:"Ruthless Lowlife",type:"Unit",cost:2,power:4,ram:1,summary:"只能攻擊敵方單位，不能攻擊 Gig 區。",implemented:["targetRestriction"],source:"https://cyberpunktcg.com/cards/ruthless-lowlife"},
  {name:"Secondhand Bombus",type:"Unit",cost:2,power:0,ram:2,summary:"Blocker：可以消耗此單位，把敵方攻擊改為攻擊它。力量 0 無法搶 Gig。",implemented:["blocker"],source:"https://cyberpunktcg.com/cards/secondhand-bombus"},
  {name:"Field Operator",type:"Unit",cost:3,power:2,ram:2,summary:"登場時，若你的 Street Cred 為偶數，抽一張牌。",implemented:["playDrawEven"],source:"https://cyberpunktcg.com/cards/field-operator"},
  {name:"Mantis Blades",type:"Gear",cost:1,power:2,ram:1,summary:"裝備至友方單位或翻開的 Legend；提供 +2 Power。",implemented:["powerBonus"],source:"https://cyberpunktcg.com/cards/mantis-blades"},
  {name:"Kiroshi Optics",type:"Gear",cost:1,power:1,ram:1,summary:"裝備後，攻擊時可以查看一張自己蓋牌的 Legend，不公開給對手。",implemented:[],source:"https://cyberpunktcg.com/cards/kiroshi-optics"},
  {name:"Zetatech Faceplate",type:"Gear",cost:2,power:2,ram:2,summary:"裝備的角色被消耗時，可調整 Gig 數值；符合不同點數條件時抽牌。",implemented:[],source:"https://cyberpunktcg.com/cards/zetatech-faceplate"},
  {name:"Minotaur",type:"Unit",cost:7,power:9,ram:2,summary:"登場時若自己的 Street Cred 比對方高，擊敗對方一個 Power 5 以下的單位。",implemented:["playDefeatLowPower"],source:"https://cyberpunktcg.com/cards/minotaur"},
  {name:"Sandevistan",type:"Gear",cost:3,power:2,ram:3,summary:"回合結束時，讓裝備它的單位或 Legend 恢復 Ready。",implemented:["readyAtEnd"],source:"https://cyberpunktcg.com/cards/sandevistan"}
];