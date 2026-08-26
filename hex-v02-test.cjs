const assert=require('assert'),fs=require('fs');
require('./hex-engine.js');require('./hex-v02.js');
const H=global.HexEngine,V=global.HexV02;

assert.strictEqual(V.DAILY_RULES.length,15);
assert.strictEqual(V.SYNERGIES.length,10);
assert.strictEqual(V.RARE_ENDINGS.length,15);
assert(Object.values(V.COMMENTS).flat().length>=40);
assert.strictEqual(Object.keys(V.BUILD_TAGS).length,24);
assert.strictEqual(V.normalizeSeed('hx-test-0001'),'HX-TEST-0001');
assert.deepStrictEqual(Array.from({length:8},()=>V.rngFor('HX-TEST-0001','proof',7)()),Array(8).fill(V.rngFor('HX-TEST-0001','proof',7)()));

function draft(seed,choices=Array(8).fill(0)){
  const roster=[],hexIds=[],playerOffers=[],hexOffers=[];
  for(let round=0;round<8;round++){
    const pool=H.players.filter(p=>!roster.includes(p.id));
    const offer=H.sample(pool,3,V.rngFor(seed,'player_offer',round)).map(p=>p.id);playerOffers.push(offer);
    roster.push(offer[choices[round]%offer.length]);
    if((round+1)%2===0){const step=(round+1)/2,offerHex=H.offerHexes(step,hexIds,V.rngFor(seed,'hex_offer',step)).map(h=>h.id);hexOffers.push(offerHex);hexIds.push(offerHex[0]);}
  }
  return{roster,hexIds,playerOffers,hexOffers};
}
function season(seed,run){const roster=run.roster.map(id=>H.players.find(p=>p.id===id)),starterIds=run.roster.slice(0,5),coreIds=[...starterIds].sort((a,b)=>H.playerOff(H.players.find(p=>p.id===b))-H.playerOff(H.players.find(p=>p.id===a))).slice(0,3),state={seed,gameMode:'NORMAL',dailyRule:null,roster,starterIds,coreIds,hexIds:run.hexIds},team=V.enhancedTeam(H,state,false),opponents=H.generateOpponents(V.rngFor(seed,'ai',0));let wins=0;const scores=[];for(let game=0;game<82;game++){const result=H.simulateGame(team,opponents[game%30],{home:game%2===0},V.rngFor(seed,'regular',game));wins+=result.win?1:0;scores.push(`${result.own}-${result.opp}`);}return{wins,scores,opponents,team,state};}
const runA=draft('HX-TEST-0001'),runB=draft('HX-TEST-0001');
assert.deepStrictEqual(runA,runB,'same seed must reproduce all draft and hex offers');
const seasonA=season('HX-TEST-0001',runA),seasonB=season('HX-TEST-0001',runB);
assert.deepStrictEqual(seasonA.opponents,seasonB.opponents,'same seed must reproduce AI league');
assert.deepStrictEqual({wins:seasonA.wins,scores:seasonA.scores},{wins:seasonB.wins,scores:seasonB.scores},'same seed and choices must reproduce season');
assert.notDeepStrictEqual(draft('HX-TEST-0002').playerOffers,runA.playerOffers,'different seeds should change offers');

const shooters=['curry16','klay16','durant17','ray01','dirk11','paul08','davis20','iguodala15'].map(id=>H.players.find(p=>p.id===id));
const shooterState={roster:shooters,starterIds:shooters.slice(0,5).map(p=>p.id),coreIds:['durant17','curry16','dirk11'],hexIds:['three_rain','one_star_four_shooters','cosmic','run_gun'],dailyRule:null};
const shooterTeam=V.enhancedTeam(H,shooterState,false),shooting=shooterTeam.builds.find(b=>b.tag==='SHOOTING');
assert.strictEqual(shooting.level,3,'shooting build should reach III');
assert(V.detectSynergies(H,shooterState,shooterTeam).includes('splash'));

const oldCollection=V.migrateCollection({players:['curry16'],hexes:null});
assert.deepStrictEqual(oldCollection.players,['curry16']);assert.deepStrictEqual(oldCollection.hexes,[]);
const html=fs.readFileSync('./hex.html','utf8'),ui=fs.readFileSync('./hex-ui.js','utf8');
assert(html.includes('legacy-v01')&&ui.includes("STORAGE='nba_hex_dynasty_v01'"),'V0.1 save key must remain compatible');
new Function(fs.readFileSync('./hex-v02.js','utf8'));new Function(ui);
console.log(`V0.2 seed QA passed: ${seasonA.wins} wins reproduced exactly for HX-TEST-0001.`);
