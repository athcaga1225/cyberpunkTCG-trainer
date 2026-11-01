/* Verified against official starter decklist, Aug 21 2026.
   https://cyberpunktcg.com/blog/wnc-starter-decks
   No unverified card abilities are executed from this manifest. */
window.NCT_STARTER_DECKS=Object.freeze({
  theHeist:{
    name:"The Heist",source:"https://cyberpunktcg.com/blog/wnc-starter-decks",
    legends:[["V: Corporate Exile",1],["Viktor Vektor: Sit Down and Relax",1],["Jackie Welles: Pour One Out For Me",1]].map(([name,qty])=>({name,qty})),
    main:[
      ["Dexter DeShawn: One Last Chance",2],["Heywood Ripperdoc",2],["Offduty Malfini",2],
      ["Secondhand Bombus",2],["T-Bug: Amateur Philosopher",2],["Kiroshi Optics",3],
      ["Mandibular Upgrade",3],["Zetatech Faceplate",3],["Afterparty at Lizzie's",2],
      ["Delamain Cab",3],["Evelyn Parker: Scheming Siren",3],["MT0D12 Flathead",2],
      ["Psycho Squad",2],["Dying Night: V's Pistol",2],["Tetratronic Rippler",2],
      ["Floor It",3],["Reboot Optics",2]
    ].map(([name,qty])=>({name,qty}))
  },
  embracingPower:{
    name:"Embracing Power",source:"https://cyberpunktcg.com/blog/wnc-starter-decks",
    legends:[["Goro Takemura: Hands Unclean",1],["Yorinobu Arasaka: Embracing Destruction",1],["Saburo Arasaka: Stubborn Patriarch",1]].map(([name,qty])=>({name,qty})),
    main:[
      ["Chrome Fang",2],["Minotaur",2],["Ruthless Lowlife",3],["Swordwise Huscle",2],
      ["Emergency Atlus",2],["Field Operator",2],["Goro Takemura: Losing His Way",2],
      ["MaxTac AV",2],["Arasaka Emergency Radioport",2],["Mantis Blades",3],
      ["Satori: Sword of Saburo",3],["Industrial Assembly",2],["Over the Edge",2],
      ["Shattered Memories",2],["Corpo Security",3],["Sandevistan",3],
      ["Corporate Surveillance",3]
    ].map(([name,qty])=>({name,qty}))
  }
});