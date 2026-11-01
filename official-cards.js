/* Curated official card facts. Traditional Chinese descriptions are summaries,
   not authoritative translations. Always consult the linked official English text.
   These entries deliberately mark unsupported interactions. */
window.NCT_OFFICIAL_CARDS=[
  {name:"Ruthless Lowlife",type:"Unit",cost:2,power:4,ram:1,summary:"這張角色只能攻擊對手的角色，不能攻擊任務區來搶骰子。",implemented:["targetRestriction"],source:"https://cyberpunktcg.com/cards/ruthless-lowlife"},
  {name:"Secondhand Bombus",type:"Unit",cost:2,power:0,ram:2,summary:"具有攔截（Blocker）能力。對手攻擊時，可將這張就緒的角色橫置，讓它代替原本的目標承受攻擊。它的戰力是 0，無法靠一般攻擊搶任務骰。",implemented:["blocker"],source:"https://cyberpunktcg.com/cards/secondhand-bombus"},
  {name:"Field Operator",type:"Unit",cost:3,power:2,ram:2,summary:"登場時，把你所有任務骰的點數相加，算出街頭聲望。如果是偶數，就抽 1 張牌。",implemented:["playDrawEven"],source:"https://cyberpunktcg.com/cards/field-operator"},
  {name:"Mantis Blades",type:"Gear",cost:1,power:2,ram:1,summary:"可裝在己方角色或已翻開的傳奇角色上，讓裝備者增加 2 點戰力。",implemented:["powerBonus"],source:"https://cyberpunktcg.com/cards/mantis-blades"},
  {name:"Kiroshi Optics",type:"Gear",cost:1,power:1,ram:1,summary:"裝備後，在攻擊時可以私下查看一張自己尚未翻開的傳奇角色卡；不必讓對手看到。",implemented:[],source:"https://cyberpunktcg.com/cards/kiroshi-optics"},
  {name:"Zetatech Faceplate",type:"Gear",cost:2,power:2,ram:2,summary:"裝備這張牌的角色被橫置使用時，可能調整任務骰點數，並依照條件抽牌。詳細條件請以卡面為準。",implemented:[],source:"https://cyberpunktcg.com/cards/zetatech-faceplate"},
  {name:"Minotaur",type:"Unit",cost:7,power:9,ram:2,summary:"登場時，如果你的街頭聲望比對手高，可以擊敗對手一張戰力 5 以下的角色。",implemented:["playDefeatLowPower"],source:"https://cyberpunktcg.com/cards/minotaur"},
  {name:"Sandevistan",type:"Gear",cost:3,power:2,ram:3,summary:"回合結束時，讓裝備這張牌的角色或傳奇角色恢復就緒（轉回直立）。",implemented:["readyAtEnd"],source:"https://cyberpunktcg.com/cards/sandevistan"}
];