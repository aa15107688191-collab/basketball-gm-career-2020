require('./hex-engine.js');
const H = global.HexEngine;
const powers = [], wins = [], playerStats = new Map(), hexStats = new Map(), buildStats = new Map();
let champions = 0;

function add(map, key, seasonWins, champion) {
  const item = map.get(key) || { games: 0, wins: 0, champions: 0 };
  item.games++; item.wins += seasonWins; item.champions += champion ? 1 : 0; map.set(key, item);
}

for (let i = 0; i < 1000; i++) {
  const rng = H.mulberry32(260000 + i);
  const roster = H.sample(H.players, 8, rng);
  const starters = H.sample(roster, 5, rng);
  const cores = H.sample(starters, 3, rng);
  const augments = H.sample(H.hexes, 4, rng);
  const team = H.calculateTeam(roster, starters.map(p => p.id), cores.map(p => p.id), augments.map(h => h.id));
  const opponents = H.generateOpponents(rng);
  let seasonWins = 0;
  for (let game = 0; game < 82; game++) seasonWins += H.simulateGame(team, opponents[game % 30], { home: game % 2 === 0 }, rng).win ? 1 : 0;
  let champion = seasonWins >= 41;
  if (champion) {
    const playoffTeam = H.calculateTeam(roster, starters.map(p => p.id), cores.map(p => p.id), augments.map(h => h.id), true);
    for (const power of [86, 89, 92, 94]) {
      let own = 0, other = 0;
      while (own < 4 && other < 4) H.simulateGame(playoffTeam, { power, style: 'BALANCED' }, { playoffs: true }, rng).win ? own++ : other++;
      if (other === 4) { champion = false; break; }
    }
  }
  if (champion) champions++;
  powers.push(team.power); wins.push(seasonWins);
  roster.forEach(p => add(playerStats, p.name, seasonWins, champion));
  augments.forEach(h => add(hexStats, h.name, seasonWins, champion));
  const build = team.space >= 92 ? '五外' : team.rebound >= 92 ? '双塔' : team.defense >= 92 ? '防守' : team.usage > 18.5 ? '巨星持球' : '均衡';
  add(buildStats, build, seasonWins, champion);
}

const average = values => values.reduce((a,b) => a+b, 0) / values.length;
const summarize = map => Object.fromEntries([...map.entries()].map(([key, value]) => [key, { averageWins: Number((value.wins/value.games).toFixed(1)), championRate: Number((value.champions/value.games*100).toFixed(1)) + '%' }]));
console.log(JSON.stringify({
  teams: 1000,
  averagePower: Number(average(powers).toFixed(1)),
  powerRange: [Math.min(...powers), Math.max(...powers)],
  averageWins: Number(average(wins).toFixed(1)),
  winRange: [Math.min(...wins), Math.max(...wins)],
  playoffRate: Number((wins.filter(w => w >= 41).length / 10).toFixed(1)) + '%',
  championRate: Number((champions / 10).toFixed(1)) + '%',
  playerResults: summarize(playerStats),
  hexResults: summarize(hexStats),
  buildResults: summarize(buildStats)
}, null, 2));
