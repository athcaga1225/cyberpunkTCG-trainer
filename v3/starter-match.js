/* V3 starter matchup composition. Each preset owns its own card identities and
 * Legends; both use the existing bounded mirror-turn protocol. */
(function(root,factory){const node=typeof module!=='undefined'&&module.exports,api=factory(node?require('./heist-practice'):root.NCTV3Heist,node?require('./embracing-practice'):root.NCTV3Embracing);if(node)module.exports=api;if(root)root.NCTV3StarterMatch=api;})(typeof globalThis!=='undefined'?globalThis:this,(H,EP)=>{'use strict';
const presets={theHeist:H,embracingPower:EP},names={theHeist:'The Heist',embracingPower:'Embracing Power'};
function fresh(deckKey='theHeist',opts={}){
 const opponentDeckKey=opts.opponentDeckKey||deckKey,scenario=opts.scenario||'random';
 if(!presets[deckKey]||!presets[opponentDeckKey])throw Error('Unknown starter deck');
 if(opts.aiMode&&opts.aiMode!=='mirror')throw Error('Starter matchups require automatic opponent mode');
 if(deckKey!==opponentDeckKey&&scenario!=='random')throw Error('Cross-deck matches require random opening');
 const s=presets[deckKey].fresh(scenario,{...opts,aiMode:'mirror',preGame:true});
 if(deckKey!==opponentDeckKey)s.ai=presets[opponentDeckKey].fresh('random',{...opts,aiMode:'mirror',preGame:true}).ai;
 s.deckKey=deckKey;s.opponentDeckKey=opponentDeckKey;
 return s;
}
return {fresh,names};});
