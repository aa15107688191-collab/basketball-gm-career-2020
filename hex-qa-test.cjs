const assert = require('assert');
require('./hex-engine.js');
const H = global.HexEngine;

assert(H, 'HexEngine should load');
assert.strictEqual(H.players.length, 40, 'player pool should contain 40 players');
assert.strictEqual(new Set(H.players.map(p => p.id)).size, 40, 'player ids should be unique');
assert.strictEqual(H.hexes.length, 24, 'hex pool should contain 24 entries');
assert.deepStrictEqual(
  Object.fromEntries(['SILVER','GOLD','PRISMATIC'].map(q => [q, H.hexes.filter(h => h.quality === q).length])),
  { SILVER: 12, GOLD: 8, PRISMATIC: 4 }
);
for (const p of H.players) {
  for (const value of Object.values(p.attributes)) assert(value >= 30 && value <= 99, `${p.id} attribute out of range`);
  for (const value of Object.values(p.hidden)) assert(value >= 1 && value <= 5, `${p.id} hidden value out of range`);
}

const seeded = H.mulberry32(20260826);
const offer = H.offerPlayers([], seeded);
assert.strictEqual(offer.length, 3);
assert.strictEqual(new Set(offer.map(p => p.id)).size, 3);
const hexOffer = H.offerHexes(4, [], seeded);
assert.strictEqual(hexOffer.length, 3);
assert.strictEqual(new Set(hexOffer.map(h => h.id)).size, 3);
assert(hexOffer.filter(h => h.quality === 'PRISMATIC').length <= 1);

const ids = (...values) => values.map(id => H.players.find(p => p.id === id));
const elite = ids('curry16','jordan91','durant17','garnett04','hakeem94','klay16','draymond16','rodman96');
const eliteTeam = H.calculateTeam(elite, elite.slice(0,5).map(p => p.id), ['jordan91','curry16','durant17'], ['share_ball','iron_defense']);
assert(eliteTeam.power >= 86, 'elite balanced lineup should grade as a contender');
assert(eliteTeam.offense >= 85 && eliteTeam.defense >= 85);

const small = ids('curry16','harden18','iverson01','kyrie16','nash07','paul08','rose11','luka24');
const smallTeam = H.calculateTeam(small, small.slice(0,5).map(p => p.id), ['curry16','harden18','iverson01'], []);
const towers = ids('paul08','klay16','garnett04','duncan03','hakeem94','rodman96','draymond16','davis20');
const towerTeam = H.calculateTeam(towers, towers.slice(0,5).map(p => p.id), ['garnett04','duncan03','paul08'], []);
assert(smallTeam.space > towerTeam.space, 'guard-heavy team should have better spacing');
assert(towerTeam.rebound > smallTeam.rebound, 'two-big lineup should rebound better');
assert(towerTeam.rimProtection > smallTeam.rimProtection, 'two-big lineup should protect the rim better');

function averageWins(starterIds, coreIds, seasons = 250) {
  const starters = starterIds.map(id => H.players.find(p => p.id === id));
  const roster = [...starters, ...H.players.filter(p => !starterIds.includes(p.id)).slice(0, 3)];
  const team = H.calculateTeam(roster, starterIds, coreIds, []);
  let total = 0;
  for (let season = 0; season < seasons; season++) {
    const rng = H.mulberry32(9000 + season), opponents = H.generateOpponents(rng);
    for (let game = 0; game < 82; game++) total += H.simulateGame(team, opponents[game % 30], { home: game % 2 === 0 }, rng).win ? 1 : 0;
  }
  return { team, wins: total / seasons };
}
const caseA = averageWins(['curry16','jordan91','durant17','garnett04','hakeem94'], ['curry16','jordan91','durant17']);
const caseB = averageWins(['harden18','luka24','iverson01','lebron13','shaq00'], ['harden18','luka24','iverson01']);
const caseC = averageWins(['paul08','klay16','kawhi19','garnett04','duncan03'], ['paul08','kawhi19','garnett04']);
assert(caseA.wins >= 65 && caseA.wins <= 75, `balanced elite wins should be 65-75, got ${caseA.wins}`);
assert(caseB.wins >= 52 && caseB.wins <= 61, `usage-conflict wins should be 52-61, got ${caseB.wins}`);
assert(caseB.team.chemistry < caseA.team.chemistry - 15, 'usage-conflict lineup should have clearly lower chemistry');
assert(caseC.wins >= 60 && caseC.wins <= 69, `team basketball wins should be 60-69, got ${caseC.wins}`);
assert(caseC.team.chemistry >= 95 && caseC.team.defense >= 85);

for (let i = 0; i < 1000; i++) {
  const rng = H.mulberry32(1000 + i);
  const roster = H.sample(H.players, 8, rng);
  const starters = H.sample(roster, 5, rng);
  const cores = H.sample(starters, 3, rng);
  const hexes = H.sample(H.hexes, 4, rng).map(h => h.id);
  const team = H.calculateTeam(roster, starters.map(p => p.id), cores.map(p => p.id), hexes);
  assert(Number.isFinite(team.power) && team.power >= 40 && team.power <= 105, 'power should stay finite and bounded');
  const result = H.simulateGame(team, H.generateOpponents(rng)[0], {}, rng);
  assert(Number.isFinite(result.own) && Number.isFinite(result.opp));
}

const fs = require('fs');
const html = fs.readFileSync('./hex.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).filter(Boolean);
for (const source of scripts) new Function(source);
assert(!/<select\b|type=["']checkbox/i.test(html), 'phone UI should avoid unstable native selection controls');
console.log(`Hex mode QA passed: A ${caseA.wins.toFixed(1)} wins, B ${caseB.wins.toFixed(1)}, C ${caseC.wins.toFixed(1)}.`);
