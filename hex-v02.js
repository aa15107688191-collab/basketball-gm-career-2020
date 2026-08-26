(function(root){
  'use strict';
  const BUILD_TAGS={
    three_rain:['SHOOTING'],paint_bully:['PAINT'],youth:['TRANSITION'],veterans:['TEAM'],bench_mob:['BENCH'],transition:['TRANSITION'],second_chance:['TWIN_TOWER','PAINT'],share_ball:['TEAM'],iron_defense:['DEFENSE'],fourth_quarter:['CLUTCH'],endless_energy:['TRANSITION'],hot_hand:['CLUTCH'],
    one_star_four_shooters:['SHOOTING','SUPERSTAR'],twin_towers:['TWIN_TOWER','PAINT'],death_lineup:['SMALL_BALL'],switch_everything:['DEFENSE','SMALL_BALL'],defense_titles:['DEFENSE'],run_gun:['TRANSITION','SHOOTING'],superstar_ball:['SUPERSTAR'],all_soldiers:['TEAM','BENCH'],
    cosmic:['SHOOTING'],absolute_core:['SUPERSTAR'],five_as_one:['TEAM'],gods:['SUPERSTAR']
  };
  const BUILD_NAMES={SHOOTING:'三分体系',TWIN_TOWER:'双塔体系',DEFENSE:'防守体系',SMALL_BALL:'五小体系',SUPERSTAR:'巨星体系',TEAM:'团队篮球',TRANSITION:'快攻体系',CLUTCH:'关键球体系'};
  const DAILY_RULES=[
    {id:'no_legend',name:'禁止传奇',description:'不能选择LEGEND球员。'},
    {id:'two_stars',name:'双星限制',description:'最多选择2名LEGEND。'},
    {id:'small_ball',name:'小球时代',description:'不能选择传统SIZE=5中锋。'},
    {id:'three_revolution',name:'三分革命',description:'所有球员三分能力＋3。'},
    {id:'iron_age',name:'铁血时代',description:'球队防守收益提高15%。'},
    {id:'veteran_league',name:'老兵联盟',description:'30岁以上版本球员进攻与稳定性提升。'},
    {id:'young_storm',name:'青春风暴',description:'25岁以下版本球员运动能力提升。'},
    {id:'one_ball',name:'一个球真不够',description:'球权冲突惩罚提高50%。'},
    {id:'team_game',name:'团队篮球',description:'化学反应收益提高30%。'},
    {id:'superstar_age',name:'巨星时代',description:'LEGEND更强，但球权冲突也更严重。'},
    {id:'defense_wins',name:'防守赢球',description:'季后赛进一步提高防守权重。'},
    {id:'paint_age',name:'内线时代',description:'终结与篮板收益提高。'},
    {id:'shooter_heaven',name:'投手天堂',description:'空间价值进一步提高。'},
    {id:'no_refresh',name:'无刷新',description:'本日不能刷新海克斯。'},
    {id:'mad_playoffs',name:'疯狂季后赛',description:'季后赛爆冷概率提高。'}
  ];
  const SYNERGIES=[
    {id:'splash',name:'水花兄弟',hint:'两位改变三分时代的队友。'},
    {id:'ok',name:'OK组合',hint:'紫金王朝最具统治力的内外组合。'},
    {id:'perfect_space',name:'极致空间',hint:'与极致外线空间有关。'},
    {id:'paint_lock',name:'禁区封锁',hint:'篮板与护框都达到顶级。'},
    {id:'ultimate_small',name:'五小终极形态',hint:'没有传统中锋也能攻守兼备。'},
    {id:'enough_ball',name:'一个球居然够',hint:'让高球权阵容学会分享。'},
    {id:'all_core',name:'人人都是核心',hint:'三个核心难分高下，配合却很默契。'},
    {id:'galaxy',name:'银河战舰',hint:'把至少四位传奇放进同一支球队。'},
    {id:'civilian',name:'平民奇迹',hint:'没有传奇，也能成为争冠队。'},
    {id:'two_way',name:'攻防一体',hint:'第一核心进攻无解，全队防守顶级。'}
  ];
  const RARE_ENDINGS=[
    {id:'perfect',name:'完美赛季',description:'82场，一场没丢。',rarity:'LEGENDARY'},
    {id:'historic',name:'历史级王朝',description:'至少75胜并捧起冠军。',rarity:'LEGENDARY'},
    {id:'runnerup73',name:'73胜总亚军',description:'常规赛载入史册，最后一步没走完。',rarity:'EPIC'},
    {id:'regular_king',name:'常规赛之王',description:'至少65胜，却没能进入总决赛。',rarity:'RARE'},
    {id:'underdog',name:'黑马奇迹',description:'并不被看好的阵容最终夺冠。',rarity:'EPIC'},
    {id:'def_dynasty',name:'防守王朝',description:'顶级防守带来了总冠军。',rarity:'EPIC'},
    {id:'firepower',name:'火力全开',description:'97进攻以上并最终夺冠。',rarity:'EPIC'},
    {id:'team_title',name:'团队篮球',description:'顶级化学反应带来了冠军。',rarity:'RARE'},
    {id:'galaxy_title',name:'银河战舰',description:'四位传奇以上完成夺冠。',rarity:'RARE'},
    {id:'galaxy_crash',name:'银河战舰坠毁',description:'五位传奇，四场假期。',rarity:'EPIC'},
    {id:'one_ball_crash',name:'一个球不够',description:'每个人都想终结，结果首轮就终结了。',rarity:'RARE'},
    {id:'game7_king',name:'抢七之王',description:'一届季后赛赢下至少三次抢七。',rarity:'EPIC'},
    {id:'sweep',name:'横扫联盟',description:'季后赛16胜0负。',rarity:'LEGENDARY'},
    {id:'comeback',name:'绝地求生',description:'从1比3落后翻盘，并最终夺冠。',rarity:'LEGENDARY'},
    {id:'choke',name:'被钉在耻辱柱',description:'3比1领先，最后还是输了。',rarity:'EPIC'}
  ];
  const COMMENTS={
    champion:['联盟研究了一整个赛季，最后决定放弃研究。','戒指已经戴上了，争论可以停了。','这套阵容最讲道理的地方，是最后总能赢。','冠军不是运气，是四轮对手轮流确认。'],
    great_no_title:['82场建立威信，最后几场全部还回去了。','常规赛像答案，季后赛像勘误表。','赢了一个赛季，输掉一句话。','胜场很漂亮，奖杯柜还是空的。'],
    galaxy_crash:['休赛期颁奖典礼已经结束。','传奇太多，篮球只有一个。','名人堂合影拍完了，季后赛也打完了。','纸面实力负责吓人，首轮负责解释。'],
    usage:['建议联盟下赛季同时发两个篮球。','这不是战术板，是球权分配表。','每个人都能单打，所以没人想跑位。','五个持球点，零个让步的人。'],
    no_space:['禁区比地铁早高峰还挤。','对手的防守策略：往里站就行。','三分线外很宽敞，因为没人需要出去。','空间不足，连突破路线都要预约。'],
    no_rebound:['篮板落下来以后，你们主要负责观看。','球投丢不可怕，可怕的是球权就此结束。','二次进攻属于对手的固定节目。','卡位做了，篮板还是别人的。'],
    elite_def:['对面想得分，需要先提交申请。','每个回合都像在过安检。','这支队的防守没有弱侧，只有陷阱。','比分不高，因为对面没有权限。'],
    elite_chem:['五个人共用一个脑子。','球还没到，人已经到了。','这不是默契，是局域网。','战术只画一半，他们能补完另一半。'],
    elite_off:['防守战术的核心是祈祷他们投丢。','一百分不是目标，是中场休息。','进攻回合唯一的问题是由谁得分。','记分牌先累了。'],
    five_guard:['身高不是问题，篮板是。','五个后卫都能运球，也都够不到球。','速度拉满，禁区交给命运。','阵容很现代，篮板很复古。'],
    balanced:['这套阵容没有明显短板，除了偶尔不讲道理。','不靠一种答案，反而最难被针对。','每个人都有活干，也有人愿意干脏活。','数据不夸张，赢球方式很多。']
  };
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function mulberry32(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function rngFor(seed,channel='main',index=0){return mulberry32(hash(`${normalizeSeed(seed)}|${channel}|${index}`));}
  function normalizeSeed(value){const raw=String(value||'').trim().toUpperCase().replace(/[^A-Z0-9-]/g,'');if(/^HEX-DAILY-\d{4}-\d{2}-\d{2}$/.test(raw))return raw;if(/^HX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(raw))return raw;const code=hash(raw||String(Date.now())).toString(36).toUpperCase().padStart(8,'0').slice(-8);return`HX-${code.slice(0,4)}-${code.slice(4)}`;}
  function createSeed(){const values=new Uint32Array(2);if(root.crypto?.getRandomValues)root.crypto.getRandomValues(values);else{values[0]=hash(String(Date.now()));values[1]=hash(String(root.performance?.now?.()||Date.now()));}const code=(values[0].toString(36)+values[1].toString(36)).toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(8,'0').slice(0,8);return`HX-${code.slice(0,4)}-${code.slice(4)}`;}
  function dateKey(date=new Date()){const local=new Date(date.getTime()-date.getTimezoneOffset()*60000);return local.toISOString().slice(0,10);}
  function dailySeed(date=new Date()){return`HEX-DAILY-${dateKey(date)}`;}
  function dailyRule(date=new Date()){return DAILY_RULES[hash(dateKey(date))%DAILY_RULES.length];}
  function eligiblePlayers(players,state){const rule=state?.dailyRule?.id;if(rule==='no_legend')return players.filter(p=>p.tier!=='LEGEND');if(rule==='two_stars'&&(state.roster||[]).filter(p=>p.tier==='LEGEND').length>=2)return players.filter(p=>p.tier!=='LEGEND');if(rule==='small_ball')return players.filter(p=>p.hidden.size!==5);return players;}
  function tagCounts(hexIds=[]){const counts={};for(const id of hexIds)for(const tag of BUILD_TAGS[id]||[])counts[tag]=(counts[tag]||0)+1;return counts;}
  function buildLevel(tag,count,team,context){const bigs=context.starters.filter(p=>p.hidden.size===5).length,legend=context.starters.filter(p=>p.tier==='LEGEND').length,clutch=context.starters.reduce((s,p)=>s+p.hidden.clutch,0)/Math.max(1,context.starters.length);if(tag==='SHOOTING')return count>=2&&team.space>=94?3:(count>=2||(count>=1&&team.space>=90))?2:count?1:0;if(tag==='TWIN_TOWER')return count>=1&&bigs>=2&&team.rebound>=92?3:(count>=2||(count>=1&&bigs>=2))?2:(count||bigs>=2)?1:0;if(tag==='DEFENSE')return count>=2&&team.defense>=94?3:(count>=2||(count>=1&&team.defense>=88))?2:count?1:0;if(tag==='SMALL_BALL')return bigs===0&&team.space>=90&&team.defense>=88?3:(count>=1&&bigs===0)?2:count?1:0;if(tag==='SUPERSTAR')return count>=2&&legend>=4?3:(count>=1&&legend>=3)?2:(count||legend>=3)?1:0;if(tag==='TEAM')return count>=2&&team.chemistry>=94?3:(count>=1&&team.chemistry>=90)?2:count?1:0;if(tag==='TRANSITION')return count>=2&&team.offense>=92?3:count>=2?2:count?1:0;if(tag==='CLUTCH')return count>=2&&clutch>=4.5?3:count>=2?2:count?1:0;return 0;}
  function calculateBuilds(team,roster,starterIds,coreIds,hexIds){const starters=starterIds.map(id=>roster.find(p=>p.id===id)).filter(Boolean),counts=tagCounts(hexIds),context={starters,coreIds};return Object.keys(BUILD_NAMES).map(tag=>({tag,name:BUILD_NAMES[tag],count:counts[tag]||0,level:buildLevel(tag,counts[tag]||0,team,context)})).filter(b=>b.level>0).sort((a,b)=>b.level-a.level||b.count-a.count);}
  function applyBuilds(team,builds,playoffs=false){const t={...team};for(const b of builds.filter(x=>x.level===3)){if(b.tag==='SHOOTING'){t.space+=2;t.offense+=1;t.power+=1.1}if(b.tag==='TWIN_TOWER'){t.rebound+=3;t.rimProtection+=2;t.power+=.8}if(b.tag==='DEFENSE'){t.defense+=playoffs?3:2;t.power+=playoffs?1.1:.7}if(b.tag==='SMALL_BALL'){t.space+=2;t.defense+=2;t.power+=.8}if(b.tag==='SUPERSTAR'){t.power+=.8}if(b.tag==='TEAM'){t.chemistry+=3;t.power+=.7}if(b.tag==='TRANSITION'){t.offense+=2;t.pace=(t.pace||1)*1.03;t.power+=.7}if(b.tag==='CLUTCH'&&playoffs)t.power+=1.1;}for(const key of ['space','offense','defense','rebound','chemistry','rimProtection'])if(Number.isFinite(t[key]))t[key]=Math.round(clamp(t[key],40,100));t.power=Math.round(clamp(t.power,40,105)*10)/10;return t;}
  function applyDailyRule(team,state,playoffs=false){const t={...team},rule=state?.dailyRule?.id,starters=t.starters||[];if(rule==='three_revolution'){t.space+=2;t.offense+=1}if(rule==='iron_age')t.defense+=Math.max(2,(t.defense-40)*.15);if(rule==='veteran_league')t.offense+=starters.filter(p=>p.age>=30).length*.6;if(rule==='young_storm'){const n=starters.filter(p=>p.age<=25).length;t.offense+=n*.5;t.defense+=n*.2}if(rule==='one_ball'&&t.usage>15.5){const penalty=(t.usage-15.5)*.6;t.offense-=penalty;t.chemistry-=penalty}if(rule==='team_game')t.chemistry=75+(t.chemistry-75)*1.3;if(rule==='superstar_age'){const n=starters.filter(p=>p.tier==='LEGEND').length;t.power+=n*.45;if(t.usage>18)t.chemistry-=(t.usage-18)*.5}if(rule==='defense_wins'&&playoffs)t.power+=(t.defense-75)*.045;if(rule==='paint_age'){t.offense+=2;t.rebound+=2}if(rule==='shooter_heaven'){t.space+=3;t.power+=(t.space-80)*.025}for(const key of ['space','offense','defense','rebound','chemistry'])t[key]=Math.round(clamp(t[key],40,100));t.power=Math.round(clamp(t.power,40,105)*10)/10;t.playoffVariance=rule==='mad_playoffs'?5:2;return t;}
  function enhancedTeam(H,state,playoffs=false){let team=H.calculateTeam(state.roster,state.starterIds,state.coreIds,state.hexIds,playoffs);const builds=calculateBuilds(team,state.roster,state.starterIds,state.coreIds,state.hexIds);team=applyBuilds(team,builds,playoffs);team=applyDailyRule(team,state,playoffs);team.builds=builds;return team;}
  function detectSynergies(H,state,team){const ids=new Set(state.roster.map(p=>p.id)),counts=tagCounts(state.hexIds),starters=state.starterIds.map(id=>state.roster.find(p=>p.id===id)).filter(Boolean),legends=starters.filter(p=>p.tier==='LEGEND').length,coreOff=state.coreIds.filter(Boolean).map(id=>H.playerOff(state.roster.find(p=>p.id===id)));const found=[];if(ids.has('curry16')&&ids.has('klay16'))found.push('splash');if(ids.has('kobe06')&&ids.has('shaq00'))found.push('ok');if(team.space>=96&&(counts.SHOOTING||0)>=2)found.push('perfect_space');if(team.rimProtection>=96&&team.rebound>=92)found.push('paint_lock');if(starters.length===5&&starters.every(p=>p.hidden.size!==5)&&team.space>=90&&team.defense>=88)found.push('ultimate_small');if(starters.length===5&&team.usage>18.5&&(state.hexIds.some(id=>['share_ball','superstar_ball','gods'].includes(id))||starters.reduce((s,p)=>s+p.hidden.offball+p.hidden.fit,0)/starters.length>=8))found.push('enough_ball');if(coreOff.length===3&&Math.max(...coreOff)-Math.min(...coreOff)<=3&&team.chemistry>=90)found.push('all_core');if(legends>=4)found.push('galaxy');if(starters.length===5&&legends===0&&team.power>=88)found.push('civilian');const first=state.roster.find(p=>p.id===state.coreIds[0]);if(first&&Math.round(H.playerOff(first))>=94&&team.defense>=92)found.push('two_way');return found;}
  function detectRareEndings(state,team,champion,playoffResult){const wins=state.season.wins,p=state.playoffs||{},legends=state.starterIds.map(id=>state.roster.find(x=>x.id===id)).filter(x=>x?.tier==='LEGEND').length,firstRound=/首轮/.test(playoffResult),finalLoss=/总决赛/.test(playoffResult)&&!champion,found=[];if(wins===82)found.push('perfect');if(wins>=75&&champion)found.push('historic');if(wins>=70&&finalLoss)found.push('runnerup73');if(wins>=65&&!champion&&!finalLoss)found.push('regular_king');if(champion&&team.power<86)found.push('underdog');if(champion&&team.defense>=95)found.push('def_dynasty');if(champion&&team.offense>=97)found.push('firepower');if(champion&&team.chemistry>=95)found.push('team_title');if(champion&&legends>=4)found.push('galaxy_title');if(firstRound&&legends>=4)found.push('galaxy_crash');if(firstRound&&team.usage>18.5)found.push('one_ball_crash');if((p.game7Wins||0)>=3)found.push('game7_king');if(champion&&(p.totalLosses||0)===0)found.push('sweep');if(champion&&p.comeback13)found.push('comeback');if(p.choked31)found.push('choke');return found;}
  function selectComments(state,team,champion,playoffResult,rng){const categories=[];const legends=state.starterIds.map(id=>state.roster.find(p=>p.id===id)).filter(p=>p?.tier==='LEGEND').length,bigs=team.starters.filter(p=>p.hidden.size===5).length;if(champion)categories.push('champion');if(state.season.wins>=65&&!champion)categories.push('great_no_title');if(legends>=4&&/首轮/.test(playoffResult))categories.push('galaxy_crash');if(team.usage>18.5)categories.push('usage');if(team.space<=70)categories.push('no_space');if(team.rebound<=70)categories.push('no_rebound');if(team.defense>=96)categories.push('elite_def');if(team.chemistry>=96)categories.push('elite_chem');if(team.offense>=97)categories.push('elite_off');if(bigs===0&&team.starters.filter(p=>p.positions.some(x=>x==='PG'||x==='SG')).length===5)categories.push('five_guard');if(!categories.length)categories.push('balanced');return categories.slice(0,3).map(category=>COMMENTS[category][Math.floor(rng()*COMMENTS[category].length)]);}
  function defaultCollection(){return{players:[],hexes:[],synergies:[],rareEndings:[]};}
  function migrateCollection(raw){const c=Object.assign(defaultCollection(),raw||{});for(const key of Object.keys(defaultCollection()))c[key]=[...new Set(Array.isArray(c[key])?c[key]:[])];return c;}
  function endingById(id){return RARE_ENDINGS.find(x=>x.id===id)}function synergyById(id){return SYNERGIES.find(x=>x.id===id)}
  root.HexV02={BUILD_TAGS,BUILD_NAMES,DAILY_RULES,SYNERGIES,RARE_ENDINGS,COMMENTS,hash,mulberry32,rngFor,normalizeSeed,createSeed,dateKey,dailySeed,dailyRule,eligiblePlayers,tagCounts,calculateBuilds,applyBuilds,applyDailyRule,enhancedTeam,detectSynergies,detectRareEndings,selectComments,defaultCollection,migrateCollection,endingById,synergyById};
})(typeof globalThis!=='undefined'?globalThis:window);
