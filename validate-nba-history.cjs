require('./hex-engine.js');
require('./hex-v02.js');
require('./hex-v021.js');
require('./hex-v022.js');
const result=global.HexV022.validateHistory();
console.log(`NBA history validation: ${result.teams} teams, ${result.players} players, ${result.assignments} assignments, ${result.errors.length} invalid assignments`);
if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1;}

