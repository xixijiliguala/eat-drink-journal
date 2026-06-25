import { Colors } from '../styles/colors';

export interface Drink {
  id: string;
  name: string;
  brand: string;
  brandColor: string;
  emoji: string;
  category: string;
}

export const drinkLibrary: Drink[] = [
  { id:'starbucks-latte',     name:'拿铁',       brand:'starbucks', brandColor:Colors.brandStarbucks, emoji:'⭐', category:'coffee' },
  { id:'starbucks-americano', name:'美式',       brand:'starbucks', brandColor:Colors.brandStarbucks, emoji:'☕', category:'coffee' },
  { id:'starbucks-matcha',    name:'抹茶星冰乐', brand:'starbucks', brandColor:Colors.brandStarbucks, emoji:'🍵', category:'coffee' },
  { id:'starbucks-flatwhite', name:'馥芮白',     brand:'starbucks', brandColor:Colors.brandStarbucks, emoji:'🥐', category:'coffee' },
  { id:'luckin-coconut',      name:'生椰拿铁',   brand:'luckin',    brandColor:Colors.brandLuckin,    emoji:'🦌', category:'coffee' },
  { id:'luckin-maotai',       name:'酱香拿铁',   brand:'luckin',    brandColor:Colors.brandLuckin,    emoji:'🌸', category:'coffee' },
  { id:'luckin-orange',       name:'橙C美式',    brand:'luckin',    brandColor:Colors.brandLuckin,    emoji:'🍊', category:'coffee' },
  { id:'luckin-thick',        name:'厚乳拿铁',   brand:'luckin',    brandColor:Colors.brandLuckin,    emoji:'💙', category:'coffee' },
  { id:'heytea-grape',        name:'多肉葡萄',   brand:'heytea',    brandColor:Colors.brandHeytea,    emoji:'🍇', category:'fruit-tea' },
  { id:'heytea-peach',        name:'芝芝桃桃',   brand:'heytea',    brandColor:Colors.brandHeytea,    emoji:'🍑', category:'fruit-tea' },
  { id:'heytea-lemon',        name:'暴打柠檬茶', brand:'heytea',    brandColor:Colors.brandHeytea,    emoji:'🍋', category:'fruit-tea' },
  { id:'heytea-green',        name:'纯绿妍茶',   brand:'heytea',    brandColor:Colors.brandHeytea,    emoji:'🌿', category:'tea' },
  { id:'mixue-lemonade',      name:'冰鲜柠檬水', brand:'mixue',     brandColor:Colors.brandMixue,     emoji:'❄️', category:'tea' },
  { id:'mixue-cone',          name:'摩天脆脆',   brand:'mixue',     brandColor:Colors.brandMixue,     emoji:'🍦', category:'dessert' },
  { id:'mixue-peach-spring',  name:'蜜桃四季春', brand:'mixue',     brandColor:Colors.brandMixue,     emoji:'🍈', category:'tea' },
  { id:'mixue-bubble',        name:'珍珠奶茶',   brand:'mixue',     brandColor:Colors.brandMixue,     emoji:'🥤', category:'milk-tea' },
  { id:'generic-latte',       name:'拿铁',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'☕', category:'coffee' },
  { id:'generic-americano',   name:'美式',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'☕', category:'coffee' },
  { id:'generic-mocha',       name:'摩卡',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🍫', category:'coffee' },
  { id:'generic-coldbrew',    name:'冷萃',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🧊', category:'coffee' },
  { id:'generic-bubble-milk', name:'珍珠奶茶',   brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🧋', category:'milk-tea' },
  { id:'generic-coconut-jelly',name:'椰果奶茶',  brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🥥', category:'milk-tea' },
  { id:'generic-pudding',     name:'布丁奶茶',   brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🍮', category:'milk-tea' },
  { id:'generic-roasted',     name:'炭焙奶茶',   brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🫖', category:'milk-tea' },
  { id:'generic-passion',     name:'百香果茶',   brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🍹', category:'fruit-tea' },
  { id:'generic-mango',       name:'芒果茶',     brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🥭', category:'fruit-tea' },
  { id:'generic-strawberry',  name:'草莓茶',     brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🍓', category:'fruit-tea' },
  { id:'generic-orange-juice',name:'橙汁',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🧃', category:'juice' },
  { id:'generic-watermelon',  name:'西瓜汁',     brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🍉', category:'juice' },
  { id:'generic-coconut-water',name:'椰子水',    brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🥥', category:'juice' },
  { id:'generic-soda',        name:'气泡水',     brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🫧', category:'soda' },
  { id:'generic-cola',        name:'可乐',       brand:'generic',   brandColor:Colors.brandGeneric,   emoji:'🥤', category:'soda' },
];

export function getDrinkById(id: string): Drink | undefined {
  return drinkLibrary.find((d) => d.id === id);
}
