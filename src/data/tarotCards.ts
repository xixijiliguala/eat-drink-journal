export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  imgIdx: number;
  type: 'major' | 'minor';
  suit?: string;
  number?: number;
  fortune: string;
  fortuneRev: string;
}

const majorArcana: TarotCard[] = [
  { id:'fool',      imgIdx:0,  name:'愚者',   nameEn:'The Fool',       emoji:'🌟', type:'major', fortune:'新的旅程正在等你。今天适合做些没做过的事，比如试一杯陌生的饮品——别想太多，直接行动。', fortuneRev:'今天不宜冲动。做决定之前多停一步，尤其是花钱的事。稳妥一点不会吃亏。' },
  { id:'magician',  imgIdx:1,  name:'魔术师', nameEn:'The Magician',   emoji:'✨', type:'major', fortune:'你的能力和资源都到位了，想做的那件事放手去做。今天创造力特别强，别浪费。', fortuneRev:'别耍小聪明。事情没你想的那么简单，脚踏实地才能把事做好。' },
  { id:'priestess', imgIdx:2,  name:'女祭司', nameEn:'High Priestess', emoji:'🌙', type:'major', fortune:'内心的声音比外界更可靠，今天多听听直觉。安静下来，答案已经在你心里了。', fortuneRev:'别一个人闷着想太多，该问就问，该说就说。今天需要向外寻找答案。' },
  { id:'empress',   imgIdx:3,  name:'女皇',   nameEn:'The Empress',    emoji:'👑', type:'major', fortune:'今天是犒赏自己的日子。想喝什么就喝，想休息就休息——你已经够努力了。', fortuneRev:'别过度消费或放纵。享受生活没问题，但要记得留点余地给明天。' },
  { id:'emperor',   imgIdx:4,  name:'皇帝',   nameEn:'The Emperor',    emoji:'🦁', type:'major', fortune:'今天由你掌控局面。果断做决定，别人会跟着你的节奏走。适合处理积压的事务。', fortuneRev:'别太强势，听一听别人的意见。固执己见只会让事情更僵。' },
  { id:'hierophant',imgIdx:5,  name:'教皇',   nameEn:'The Hierophant', emoji:'📿', type:'major', fortune:'按你熟悉的方式做事就好，今天不需要标新立异。传统的方法反而最有效。', fortuneRev:'别被老规矩框住。今天不妨打破一下日常习惯，换个新口味试试。' },
  { id:'lovers',    imgIdx:6,  name:'恋人',   nameEn:'The Lovers',     emoji:'💕', type:'major', fortune:'适合约人出来喝一杯。一段对话可能会带来意想不到的收获——无论是友情还是别的什么。', fortuneRev:'今天不适合做重大的关系决定。先冷静一下，有些事急不来。' },
  { id:'chariot',   imgIdx:7,  name:'战车',   nameEn:'The Chariot',    emoji:'⚔️', type:'major', fortune:'冲就对了。今天执行力爆表，把拖了很久的事一口气搞定。但也别开太快。', fortuneRev:'收一收速度。今天容易因为太急躁而出错，慢一点反而更快到终点。' },
  { id:'strength',  imgIdx:8,  name:'力量',   nameEn:'Strength',       emoji:'💪', type:'major', fortune:'你比你想象的更能扛。今天遇到困难别退缩，柔韧比强硬更有力量。', fortuneRev:'今天别逞能。有些事情需要时间化解，硬来只会消耗自己。' },
  { id:'hermit',    imgIdx:9,  name:'隐者',   nameEn:'The Hermit',     emoji:'🏮', type:'major', fortune:'一个人待着不一定是孤独。今天适合独处，喝杯东西然后好好思考一个问题。', fortuneRev:'别把自己关太久。该出门走走了，外面的世界有你需要的信息。' },
  { id:'wheel',     imgIdx:10, name:'命运之轮',nameEn:'Wheel of Fortune',emoji:'🎡',type:'major',fortune:'好运已经在路上了。今天可能会遇到意外的好事——保持开放的心态去接收它。', fortuneRev:'霉运已经到底了，接下来只会往上走。今天稳一点，转折就快到了。' },
  { id:'justice',   imgIdx:11, name:'正义',   nameEn:'Justice',        emoji:'⚖️', type:'major', fortune:'事情会得到公平的处理。如果今天需要做选择，相信客观的判断而不是情绪。', fortuneRev:'别跟人争对错。有些事没有绝对的标准，退一步海阔天空。' },
  { id:'hanged',    imgIdx:12, name:'倒吊人', nameEn:'The Hanged Man', emoji:'🙃', type:'major', fortune:'换个角度看同一件事，你会发现之前没注意的东西。今天适合停下来想一想。', fortuneRev:'别死磕了。有些事情暂时解决不了就先放一放，时机到了自然会有答案。' },
  { id:'death',     imgIdx:13, name:'死神',   nameEn:'Death',          emoji:'🦋', type:'major', fortune:'一扇门关上，另一扇会打开。今天适合清理旧物、告别过时的习惯，给新东西腾空间。', fortuneRev:'今天避免做大决定。有些结束是自然的过程，不需要你刻意推动。' },
  { id:'temperance',imgIdx:14, name:'节制',   nameEn:'Temperance',     emoji:'🌊', type:'major', fortune:'凡事适度就好，包括喝东西——七分糖刚好。今天适合在混搭中找平衡。', fortuneRev:'别走极端。全糖的快乐很短暂，节制才能让好状态持续更久。' },
  { id:'devil',     imgIdx:15, name:'恶魔',   nameEn:'The Devil',      emoji:'😈', type:'major', fortune:'偶尔放纵一下没关系，想吃什么喝什么就去——快乐本身就是一种解药。', fortuneRev:'别被鸡毛蒜皮的小事困住。你今天担心的那些，过几天回头看根本不值一提。' },
  { id:'tower',     imgIdx:16, name:'塔',     nameEn:'The Tower',      emoji:'⚡', type:'major', fortune:'有时候打破计划反而不是坏事。今天可能有意外的变化，但新方向说不定更对。', fortuneRev:'今天低调一点比较好。不主动招惹麻烦，平稳度过就是胜利。' },
  { id:'star',      imgIdx:17, name:'星星',   nameEn:'The Star',       emoji:'⭐', type:'major', fortune:'保持期待，好事已经在来的路上了。今天不妨许个小愿望，宇宙在听。', fortuneRev:'别光许愿不动手。星星照亮方向，但路还是得你自己走。' },
  { id:'moon',      imgIdx:18, name:'月亮',   nameEn:'The Moon',       emoji:'🌕', type:'major', fortune:'有些事没那么清楚也没关系，跟着感觉走就好。直觉比逻辑更适合今天的局面。', fortuneRev:'别被表象迷惑。有些事没有看起来那么简单，多看两眼再做判断。' },
  { id:'sun',       imgIdx:19, name:'太阳',   nameEn:'The Sun',        emoji:'☀️', type:'major', fortune:'元气拉满的一天。做什么都顺手，适合把最重要的事放在今天处理。去晒个太阳吧。', fortuneRev:'兴奋过头容易翻车。今天保持七分热情三分冷静，刚刚好。' },
  { id:'judgement', imgIdx:20, name:'审判',   nameEn:'Judgement',      emoji:'📯', type:'major', fortune:'是时候做个一直拖着的事了。今天的直觉特别准，相信自己的判断去行动。', fortuneRev:'时机还没到，不用急。再多观察一下，答案会自己浮出来。' },
  { id:'world',     imgIdx:21, name:'世界',   nameEn:'The World',      emoji:'🌍', type:'major', fortune:'一个阶段即将圆满。今天适合回顾之前的努力——你已经走了很远，值得庆祝。', fortuneRev:'还差最后一步就到位了。别在终点前松劲，再坚持一下就圆满了。' },
];

const suits = [
  { suit:'wands',     name:'权杖', emoji:'🔥' },
  { suit:'cups',      name:'圣杯', emoji:'💧' },
  { suit:'swords',    name:'宝剑', emoji:'💨' },
  { suit:'pentacles', name:'星币', emoji:'🪨' },
];

const rankNames = ['一','二','三','四','五','六','七','八','九','十','侍从','骑士','王后','国王'];
const rankFortunes = [
  ['新的灵感开始冒芽了，把握住这可能是个不错的起点。','行动力在上升，今天适合推进手头的事。','状态越来越好，继续保持这个节奏。','节奏稳下来，该做的事情按部就班就好。','小摩擦别放心上，大局更重要。','顺利的日子，适合做点平常不敢尝试的。','继续往前走，离目标不远了。','速度提上来了，但要留意细节。','快要看到成果了，坚持住最后一段。','之前的付出开始回响了，今天适合享受一下。','一个新消息或邀请会出现，值得关注。','今天适合全力冲刺，别犹豫。','柔中带刚，用智慧而不是蛮力。','稳扎稳打，大局在握。'],
  ['现在别急着开始，多准备一下再动。','方向有点偏了，停下来校准一下。','精力太分散了，专注一件事效率更高。','稍微歇一下没关系，是在为下一步蓄力。','争论解决不了问题，今天不如先放一放。','顺境容易让人飘，保持清醒。','别闷头硬冲，抬头看看大局。','放慢一点速度，太赶反而容易出错。','别钻牛角尖，试着换个角度看问题。','该放手的就放手，新的东西才进得来。','琐碎的事会比较多，但都不重要。','冲动容易坏事，今天别急着做决定。','情绪在影响判断，等冷静下来再说。','太固执反而会失去控制，适当放手。'],
];

const minorArcana: TarotCard[] = [];
suits.forEach(({ suit, name, emoji }) => {
  for (let n = 0; n < 14; n++) {
    const key = `${suit}-${n+1}`;
    minorArcana.push({
      id: key,
      imgIdx: -1,
      name: `${name}${rankNames[n]}`,
      nameEn: `${n<10?['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n]:['Page','Knight','Queen','King'][n-10]} of ${suit.charAt(0).toUpperCase()+suit.slice(1)}`,
      emoji,
      type: 'minor',
      suit,
      number: n + 1,
      fortune: rankFortunes[0][n],
      fortuneRev: rankFortunes[1][n],
    });
  }
});

export const allTarotCards: TarotCard[] = [...majorArcana, ...minorArcana];

export function drawCards(count: number): { card: TarotCard; reversed: boolean; position: string }[] {
  const pool = [...allTarotCards];
  const result: { card: TarotCard; reversed: boolean; position: string }[] = [];
  const positions = ['过去', '现在', '未来'];
  for (let i = 0; i < count && i < pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const card = pool.splice(idx, 1)[0];
    result.push({ card, reversed: Math.random() < 0.5, position: positions[i] });
  }
  return result;
}
