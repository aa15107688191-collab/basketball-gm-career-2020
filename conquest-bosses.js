(function(root){
  'use strict';

  const BOSSES=[
    {
      id:'pistons04',number:1,chapter:'第一章 · 铁血与内线',year:2004,shortName:'2004 活塞',chineseName:'2004 底特律活塞',
      subtitle:'总决赛冠军 · 防守效率时代标杆',danger:2,power:87,theme:'铁桶防守',bossName:'本·华莱士',
      mechanicTitle:'禁止得分',mechanicDescription:'活塞会额外针对你的第一核心，并强化护框与篮板。只依赖一个超级得分手很难过关。',
      roster:[['昌西·比卢普斯','PG'],['理查德·汉密尔顿','SG'],['泰肖恩·普林斯','SF'],['拉希德·华莱士','PF'],['本·华莱士','C']],
      strategies:[
        {id:'share',title:'让第二核心发起',description:'分散第一核心压力，组织能力越强收益越高。',stat:'playmaking',threshold:84,bonus:.048},
        {id:'space',title:'五外拉开禁区',description:'依靠投射把本·华莱士带离篮筐。',stat:'space',threshold:86,bonus:.04},
        {id:'rebound',title:'先保护篮板',description:'降低活塞二次进攻，拖入稳定的半场比赛。',stat:'rebound',threshold:82,bonus:.036}
      ],
      midAlert:'活塞开始夹击你的第一核心，普林斯正在切断强侧传球路线。',midTitle:'第三节如何调整',
      midChoices:[
        {id:'second',title:'第二核心持球',description:'考验阵容组织，减少第一核心强攻。',stat:'playmaking',threshold:84,ownGood:6,ownBase:3,opp:-1,bonus:.025},
        {id:'fiveout',title:'增加五外回合',description:'空间越好，越容易惩罚收缩防守。',stat:'space',threshold:86,ownGood:7,ownBase:2,opp:1,bonus:.03},
        {id:'physical',title:'提升对抗强度',description:'用防守和篮板把比分咬住。',stats:['defense','rebound'],thresholds:[84,82],ownGood:4,ownBase:1,opp:-4,bonus:.02}
      ],
      clutchLead:'活塞仍在等待你的第一核心陷入单打，领先优势并不安全。',clutchBehind:'进入第四节时落后，必须主动改变比赛。',
      clutchChoices:[
        {id:'rotation',title:'缩短轮换',description:'提高核心球员权重，但会承担体能风险。',stat:'offense',threshold:84,bonus:.032},
        {id:'weakside',title:'持续攻击弱侧',description:'利用夹击后的空位，考验传球与投射。',stats:['playmaking','space'],thresholds:[83,83],bonus:.042},
        {id:'defense',title:'摆出防守阵容',description:'降低双方得分，依靠关键回合过关。',stat:'defense',threshold:84,bonus:.034,oppFinal:-3}
      ],
      star2Max:105,star3:{type:'noLegend',description:'不使用传奇品质球员'},
      intel:['他们的半场防守极强，但比赛节奏较慢。','活塞会优先夹击第一核心；弱侧出球和第二组织点能够明显降低压力。'],
      winText:'击败2004底特律活塞',lossText:'铁桶防守守住了比赛',rewardName:'活塞防守球员包',rewardDescription:'从防守、篮板或组织型球员卡中选择1张。',rewardTags:['defense','rebound','playmaker']
    },
    {
      id:'rockets95',number:2,chapter:'第一章 · 铁血与内线',year:1995,shortName:'1995 火箭',chineseName:'1995 休斯敦火箭',
      subtitle:'西部第六夺冠 · 内外双核的卫冕奇迹',danger:3,power:89,theme:'梦幻脚步',bossName:'哈基姆·奥拉朱旺',
      mechanicTitle:'一星四射',mechanicDescription:'奥拉朱旺吸引包夹后会迅速找到外线射手。盲目夹击会被三分惩罚，单防又可能让内线失守。',
      roster:[['肯尼·史密斯','PG'],['克莱德·德雷克斯勒','SG'],['罗伯特·霍里','SF'],['哈基姆·奥拉朱旺','C'],['萨姆·卡塞尔','G']],
      strategies:[
        {id:'front',title:'绕前限制接球',description:'用团队防守延误低位接球，考验护框与协防。',stats:['defense','rebound'],thresholds:[85,82],bonus:.046},
        {id:'single',title:'坚持内线单防',description:'不轻易漏掉射手，要求中锋能扛住梦幻脚步。',stat:'defense',threshold:87,bonus:.042},
        {id:'pace',title:'加快转换速度',description:'在奥拉朱旺落位前进攻，依赖运动能力和组织。',stats:['athletic','playmaking'],thresholds:[83,83],bonus:.04}
      ],
      midAlert:'奥拉朱旺连续低位得分，火箭的射手群也开始埋伏在弱侧。',midTitle:'夹击还是守射手',
      midChoices:[
        {id:'lateDouble',title:'底线延迟夹击',description:'等奥拉朱旺下球后再夹，减少直接分球。',stat:'defense',threshold:85,ownGood:5,ownBase:2,opp:-3,bonus:.03},
        {id:'denyCorner',title:'封锁底角射手',description:'放弃部分协防，优先切断霍里和史密斯。',stat:'perimeterDefense',threshold:83,ownGood:4,ownBase:1,opp:-4,bonus:.026},
        {id:'run',title:'继续推快攻',description:'用速度换得分，但会提高比赛波动。',stats:['athletic','playmaking'],thresholds:[84,83],ownGood:8,ownBase:3,opp:2,bonus:.032}
      ],
      clutchLead:'火箭的冠军经验开始生效，奥拉朱旺每次低位触球都可能改变比分。',clutchBehind:'火箭已经把比赛拖进自己的低位节奏，必须制造新的进攻入口。',
      clutchChoices:[
        {id:'hackDream',title:'提前包夹大梦',description:'逼迫角色球员决定比赛，防守轮转决定效果。',stat:'defense',threshold:86,bonus:.038,oppFinal:-2},
        {id:'attackBig',title:'挡拆点名中锋',description:'让奥拉朱旺反复移动，消耗他的护框体能。',stats:['playmaking','space'],thresholds:[84,84],bonus:.044},
        {id:'crashGlass',title:'全员冲抢篮板',description:'争取二次进攻，也承担退防风险。',stat:'rebound',threshold:84,bonus:.036,ownFinal:2,oppFinal:1}
      ],
      star2Max:108,star3:{type:'strategy',id:'front',description:'使用“绕前限制接球”取胜'},
      intel:['火箭的外线火力来自奥拉朱旺吸引协防后的分球。','延迟夹击比开场就包夹更有效；同时必须有人盯住两个底角。'],
      winText:'终结1995休斯敦火箭的卫冕奇迹',lossText:'梦幻脚步再次主宰了关键回合',rewardName:'火箭内线球员包',rewardDescription:'从低位、护框或篮板型球员卡中选择1张。',rewardTags:['post','rim','rebound']
    },
    {
      id:'spurs14',number:3,chapter:'第二章 · 团队篮球',year:2014,shortName:'2014 马刺',chineseName:'2014 圣安东尼奥马刺',
      subtitle:'总决赛冠军 · 极致传导与团队执行力',danger:4,power:91,theme:'美丽篮球',bossName:'蒂姆·邓肯',
      mechanicTitle:'多一次传球',mechanicDescription:'马刺会持续寻找更好的机会。第一次轮转成功并不等于防住，漏掉弱侧就会触发连续三分。',
      roster:[['托尼·帕克','PG'],['丹尼·格林','SG'],['科怀·伦纳德','SF'],['蒂姆·邓肯','PF/C'],['鲍里斯·迪奥','F/C']],
      strategies:[
        {id:'switch',title:'无限换防外线',description:'切断连续传导，但要求阵容具备换防尺寸。',stats:['defense','size'],thresholds:[86,82],bonus:.046},
        {id:'deny',title:'封锁弱侧底角',description:'放帕克部分中距离，优先不让射手起势。',stat:'perimeterDefense',threshold:85,bonus:.042},
        {id:'postAttack',title:'攻击迪奥错位',description:'从内线制造犯规，减弱马刺五人传导。',stats:['post','size'],thresholds:[82,82],bonus:.039}
      ],
      midAlert:'马刺连续完成强弱侧转移，丹尼·格林和伦纳德已经找到底角节奏。',midTitle:'如何打断传导链',
      midChoices:[
        {id:'topLock',title:'射手上锁追防',description:'不让外线轻松接球，考验防守体能。',stat:'perimeterDefense',threshold:86,ownGood:4,ownBase:1,opp:-4,bonus:.03},
        {id:'switchAll',title:'五人全部换防',description:'减少防守沟通，但会留下内线错位。',stats:['defense','size'],thresholds:[86,83],ownGood:5,ownBase:1,opp:-3,bonus:.032},
        {id:'ownPassing',title:'用传球回应传球',description:'提升弱侧参与度，用团队进攻对冲攻击波。',stats:['playmaking','space'],thresholds:[85,85],ownGood:8,ownBase:3,opp:1,bonus:.034}
      ],
      clutchLead:'马刺没有慌乱，最后一节会继续耐心寻找你的防守裂缝。',clutchBehind:'马刺已经掌控比赛节奏，单纯增加球星单打很难追回比分。',
      clutchChoices:[
        {id:'smallSwitch',title:'终极换防阵容',description:'牺牲篮板换取每个位置都能跟防。',stats:['defense','size'],thresholds:[87,82],bonus:.044,oppFinal:-2},
        {id:'huntParker',title:'连续点名帕克',description:'用强侧挡拆逼马刺改变轮换。',stats:['creator','space'],thresholds:[85,84],bonus:.04,ownFinal:2},
        {id:'extraPass',title:'坚持多传一次',description:'拒绝仓促单打，考验组织和无球能力。',stats:['playmaking','space'],thresholds:[86,85],bonus:.046}
      ],
      star2Max:110,star3:{type:'combo',strategy:'switch',mid:'switchAll',description:'用换防策略贯穿全场并取胜'},
      intel:['马刺的第一选择往往只是诱饵，真正威胁来自第二次转移。','封住弱侧底角后，马刺会让迪奥在高位策应；换防阵容更稳定。'],
      winText:'击败2014圣安东尼奥马刺',lossText:'马刺用多一次传球拆开了防线',rewardName:'马刺团队球员包',rewardDescription:'从组织、无球、投射或全能型球员卡中选择1张。',rewardTags:['playmaker','offball','shooting','multi']
    }
  ];

  const byId=id=>BOSSES.find(b=>b.id===id)||BOSSES[0];
  const defaultRecord=()=>({cleared:false,stars:0,attempts:0,bestScore:null});
  function initialProgress(){return{bosses:Object.fromEntries(BOSSES.map(b=>[b.id,defaultRecord()]))}}
  function migrateProgress(raw){const next=initialProgress(),source=raw&&typeof raw==='object'?raw:{};for(const boss of BOSSES)Object.assign(next.bosses[boss.id],source.bosses?.[boss.id]||{});if(source.pistons)Object.assign(next.bosses.pistons04,source.pistons);return next}
  function isUnlocked(id,progress){const index=BOSSES.findIndex(b=>b.id===id);return index===0||(index>0&&progress.bosses[BOSSES[index-1].id].cleared)}
  function totalStars(progress){return BOSSES.reduce((sum,b)=>sum+(progress.bosses[b.id]?.stars||0),0)}
  function clearedCount(progress){return BOSSES.filter(b=>progress.bosses[b.id]?.cleared).length}

  root.HexConquestBosses={TOTAL_BOSSES:8,BOSSES,byId,initialProgress,migrateProgress,isUnlocked,totalStars,clearedCount};
})(typeof globalThis!=='undefined'?globalThis:window);
