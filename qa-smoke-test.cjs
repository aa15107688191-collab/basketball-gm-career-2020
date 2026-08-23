const fs = require('fs');

const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('未找到内联游戏脚本');

global.document = {
  querySelector() {
    return {
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, focus() {}, scrollIntoView() {}, addEventListener() {},
      textContent: '', innerHTML: '', value: '', disabled: false
    };
  },
  querySelectorAll() { return []; },
  activeElement: null
};
global.window = { innerWidth: 1200, matchMedia: () => ({ matches: false }) };
const storage = new Map();
global.localStorage = {
  setItem(key, value) { storage.set(key, String(value)); },
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  removeItem(key) { storage.delete(key); }
};

const source = match[1].replace(/\n\s*init\(\);\s*$/, '');
const tests = String.raw`
  render = () => {};
  showToast = () => {};
  switchView = () => {};
  openModal = () => {};
  closeModal = () => {};

  const results = [];
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const test = (name, fn) => {
    fn();
    results.push('PASS  ' + name);
  };

  test('初始状态与现实自由市场占比', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    assert(state.year === 2020 && state.status === 'offseason', '初始年份或阶段错误');
    assert(state.roster.length >= 7 && state.roster.length <= 10, '初始阵容人数越界');
    assert(state.aiTeams.length === 29, 'AI球队数量不正确');
    const realCount = state.market.filter(player => player.realFreeAgent).length;
    assert(realCount > state.market.length / 2, '自由市场现实球员未占多数');
    assert(new Set(state.roster.map(player => player.name)).size === state.roster.length, '初始阵容存在重名');
  });

  test('30支球队均可正常创建生涯', () => {
    for (const team of teams) {
      state = newState(team, eras[0]);
      assert(state.team.id === team.id, team.name + '创建后球队错误');
      assert(state.roster.length >= 7 && state.roster.length <= 10, team.name + '初始阵容人数越界');
      assert(state.aiTeams.length === 29 && !state.aiTeams.some(club => club.id === team.id), team.name + '联盟分配错误');
      assert(state.rotationOrder.length === state.roster.length, team.name + '轮换名单不同步');
    }
  });

  test('2020—2035选秀名单完整且属性合法', () => {
    for (let year = 2020; year <= 2035; year++) {
      usedNames.clear();
      const draftClass = generateProspects(eras[0], false, year);
      assert(draftClass.length === 30, year + '届选秀人数不是30');
      assert(new Set(draftClass.map(player => player.name)).size === draftClass.length, year + '届存在重名');
      assert(draftClass.every((player, index) => player.boardRank === index + 1), year + '届球探榜顺序错误');
      assert(draftClass.every(player => player.ovr >= 40 && player.ovr <= 99 && player.potential >= player.ovr), year + '届综合或潜力越界');
      assert(draftClass.every(player => Object.values(player.attributes).every(value => value >= 40 && value <= 99)), year + '届属性越界');
      if (year <= 2026) assert(draftClass.some(player => player.historical), year + '届缺少现实重点新秀');
      if (year === 2027 || year === 2028) {
        assert(draftClass.some(player => player.future), year + '届缺少青年球员模型');
        assert(draftClass.some(player => player.historicRookie), year + '届缺少历史球员');
      }
      if (year >= 2029) assert(draftClass.some(player => player.historicRookie), year + '届缺少历史球员轮换');
    }
  });

  test('自由市场2020—2030始终以现实球员为主', () => {
    for (let year = 2020; year <= 2030; year++) {
      usedNames.clear();
      const market = generateMarket(year, []);
      assert(market.filter(player => player.realFreeAgent).length > market.length / 2, year + '年现实自由球员未占多数');
      assert(market.every(player => player.salary > 0 && player.years >= 1), year + '年自由球员合同非法');
    }
  });

  test('签约会更新名单、市场和操作次数', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    const player = state.market[0];
    player.salary = 0.1;
    const rosterBefore = state.roster.length;
    const marketBefore = state.market.length;
    const actionsBefore = state.actions;
    signPlayer(player.id);
    assert(state.roster.length === rosterBefore + 1, '签约后阵容未增加');
    assert(state.market.length === marketBefore - 1, '签约后市场未移除球员');
    assert(state.actions === actionsBefore - 1, '签约未消耗操作次数');
  });

  test('选秀顺位、名单和操作次数同步', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    autoDraftToUserPick();
    const prospect = state.prospects[0];
    const slot = state.draftSlots[0];
    const rosterBefore = state.roster.length;
    draftPlayer(prospect.id);
    assert(state.roster.length === rosterBefore + 1, '选秀后阵容未增加');
    assert(state.draftLog.some(item => !item.ai && item.pick === slot && item.name === prospect.name), '用户选秀记录错误');
    assert(!state.prospects.some(player => player.id === prospect.id), '已选球员仍留在选秀池');
    assert(state.actions === 2, '首次选秀应消耗一次操作');
  });

  test('一换一交易同步双方名单', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    const team = state.aiTeams[0];
    const outgoing = [...state.roster].sort((a, b) => b.ovr - a.ovr)[0];
    const incoming = [...team.roster].sort((a, b) => a.ovr - b.ovr)[0];
    state.tradeCenter.teamId = team.id;
    state.tradeCenter.offerIds = [outgoing.id];
    state.tradeCenter.targetIds = [incoming.id];
    const actionsBefore = state.actions;
    const evaluation = tradeEvaluation();
    assert(evaluation.valid && evaluation.delta >= -7, '测试交易未达到可成交条件');
    executeTrade(false);
    assert(state.roster.some(player => player.id === incoming.id), '用户未收到目标球员');
    assert(team.roster.some(player => player.id === outgoing.id), 'AI未收到送出球员');
    assert(!state.roster.some(player => player.id === outgoing.id), '送出球员仍在用户阵容');
    assert(state.actions === actionsBefore - 1, '交易未消耗操作次数');
  });

  test('存档JSON往返与载入迁移', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    state.year = 2027;
    save(false);
    const raw = localStorage.getItem(STORAGE_KEY);
    assert(raw && JSON.parse(raw).team.id === 'chi', '存档写入失败');
    state = null;
    assert(load() === true, '存档载入失败');
    assert(state.year === 2027 && state.team.id === 'chi', '载入后核心状态不一致');
    assert(state.marketVersion === 2 && state.draftClassVersion === 2 && state.leagueVersion === 1, '存档版本迁移失败');
  });

  test('损坏存档与存储禁用可安全降级', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    assert(load() === false && state === null, '损坏存档没有安全回退');
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('storage disabled'); };
    assert(save(false) === false, '存储禁用时未报告失败');
    localStorage.setItem = originalSetItem;
  });

  test('赛季剧情选择会记录并持续影响球队', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    queueStoryEvent('direction');
    const patienceBefore = state.patience;
    assert(state.story.pending === 'direction', '开局剧情没有进入待处理状态');
    resolveStoryChoice('patient');
    assert(state.story.history.length === 1 && state.story.seen.includes('2020:direction'), '剧情选择没有写入履历');
    assert(state.patience === patienceBefore - 3 && state.story.flags.direction === 'patient', '剧情选择后果没有生效');
    startRegularSeason();
    assert(state.story.pending === 'coach_plan', '常规赛剧情链没有继续');
    for (let i = 0; i < 10; i++) simulateWeek(false);
    assert(state.story.queue.some(item => item.id === 'pressure'), '赛季中期事件没有进入队列');
    assert(state.story.queue.some(item => item.id === 'deadline'), '交易截止日前事件没有进入队列');
  });

  test('球队路线、管理层收件箱与合同谈判形成总经理闭环', () => {
    state = newState(teams.find(team => team.id === 'chi'), eras[0]);
    const objectiveBefore = state.objective;
    setTeamDirection('rebuild', false);
    assert(state.frontOffice.direction === 'rebuild' && state.frontOffice.directionYear === state.year, '球队路线没有写入赛季状态');
    assert(state.objective === clamp(objectiveBefore - 7, 24, 58), '重建路线没有调整老板目标');
    assert(state.frontOffice.inbox.length > 0 && state.frontOffice.phaseKey, '管理层收件箱没有生成消息');

    const player = state.roster.find(item => item.years === 1) || state.roster[0];
    player.years = 1; player.salary = 1; player.morale = 95; player.personality = 'professional';
    const actionsBefore = state.actions;
    const originalRandom = Math.random;
    Math.random = () => 0;
    submitContractPackage(player.id, 'player', null);
    Math.random = originalRandom;
    assert(player.years === 4 && player.salary > 1 && player.rolePromise, '球员优先报价没有完成续约');
    assert(state.actions === actionsBefore - 1, '续约谈判没有消耗操作次数');

    state.status = 'regular'; state.frontOffice = {direction:null,directionYear:null,inbox:[],resolved:[],phaseKey:null,version:1};
    ensureFrontOfficeState();
    assert(state.frontOffice.direction === 'flexible' && state.frontOffice.directionYear === state.year, '旧赛季存档没有迁移到默认路线');
  });

  test('完整30赛季生涯模拟无状态中断', () => {
    state = newState(teams.find(team => team.id === 'bos'), eras[0]);
    state.patience = 100;
    for (let seasonIndex = 0; seasonIndex < CAREER_LENGTH; seasonIndex++) {
      state.objective = 0;
      startRegularSeason();
      let guard = 0;
      while (state.status === 'regular' && guard++ < 20) simulateWeek();
      assert(state.status === 'playoffs' || state.status === 'season_complete', '常规赛未能结束');
      if (state.status === 'playoffs') simulatePlayoffs();
      assert(state.status === 'season_complete', '季后赛未能结束');
      enterOffseason();
      if (seasonIndex < CAREER_LENGTH - 1) assert(state.status === 'offseason', '未能进入下一休赛期');
      assert(state.roster.length <= 10, '跨年后阵容超过上限');
      assert(state.aiTeams.length === 29, '跨年后AI联盟数量错误');
    }
    assert(state.seasonsPlayed === CAREER_LENGTH && state.year === 2049, '完整生涯推进计数错误');
    assert(state.leagueHistory.length === CAREER_LENGTH, '联盟历史记录缺失');
  });

  console.log(results.join('\n'));
  console.log('PASS  共' + results.length + '组发布前冒烟测试');
`;

new Function(source + '\n' + tests)();
