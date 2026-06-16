/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoffeeBean, ColdBrewProduct, DripBagProduct, EquipmentProduct, ShopPromotion } from './types';

export const COFFEE_BEANS: CoffeeBean[] = [
  {
    id: 'b-kasumi',
    name: '霞',
    jpName: '霞 - KASUMI',
    origin: '衣索比亞 耶加雪菲 葛蕾娜莊園',
    process: '厭氧蜜處理 (Anaerobic Honey)',
    roastLevel: 'Light',
    roastLevelZH: '淺度烘焙',
    tastingNotes: ['白桃花香', '柑橘酸質', '白葡萄甜潤', '伯爵茶尾韻'],
    description: '如晨曦初現之紅霞，此豆採用精緻的低氧蜜處理，在高山耶加雪菲乾淨的基調中，揉合了迷人的優雅花香與活潑酸甜感。入口即能感受到如白桃般的清甜。',
    price: 138,
    imageSeed: 'kasumi_bean',
    profile: {
      acid: 8,
      body: 4,
      sweetness: 8,
      aroma: 9,
      balance: 7
    },
    tags: ['風味之最', '低氧厭氧']
  },
  {
    id: 'b-wa',
    name: '和',
    jpName: '和 - WA',
    origin: 'Handrip Co. 經典配方豆 (Colombia / Ethiopia)',
    process: '微氣候水洗及精選手摘日曬雙拼',
    roastLevel: 'Medium',
    roastLevelZH: '中度烘焙',
    tastingNotes: ['黑朱古力', '烤堅果香氣', '焦糖甜度', '蜜柑酸調'],
    description: '「和」意指和諧無間。此作由烘焙師歷時一年微調，將哥倫比亞的醇厚奶油感與衣索比亞的清亮果香融為一體，完美平衡，是日復一日皆能自在享用的日常精品之選。',
    price: 118,
    imageSeed: 'wa_bean',
    profile: {
      acid: 5,
      body: 6,
      sweetness: 7,
      aroma: 8,
      balance: 9
    },
    tags: ['經典配方', '店長推薦']
  },
  {
    id: 'b-goku',
    name: '極',
    jpName: '極 - GOKU',
    origin: '印尼 蘇門答臘 亞齊特區 曼特寧 G1',
    process: '濕剝處理法 (Wet Hulled) 深焙極焙',
    roastLevel: 'Dark',
    roastLevelZH: '深度烘焙',
    tastingNotes: ['草本雪松', '炭火可可', '黑糖甜感', '煙燻香料'],
    description: '追求終極之濃烈與重厚。印尼火山土壤的濕剝曼特寧，經職人手烘火力細緻攀升，激發飽滿的黑巧克力與木質香。近乎零酸質，尾韻帶著渾厚且甘甜如黑糖的黑焦糖苦甜風情。',
    price: 128,
    imageSeed: 'goku_bean',
    profile: {
      acid: 2,
      body: 9,
      sweetness: 8,
      aroma: 7,
      balance: 8
    },
    tags: ['極致深焙', '醇厚狂熱']
  },
  {
    id: 'b-aki',
    name: '秋',
    jpName: '秋 - AKI',
    origin: '巴拿馬 波奎特 翡翠莊園 Geisha',
    process: '極精細純淨常溫水洗 (Washed)',
    roastLevel: 'Light',
    roastLevelZH: '淺度烘焙',
    tastingNotes: ['高雅茉莉花', '香檸氣息', '蜂蜜水', '冰糖梨果甜'],
    description: '「秋」如落葉歸真，寧靜致遠。來自世界傳奇莊園的瑰夏品種，帶有晶瑩剔透的茶感與高雅的冷冽茉莉香。烘焙控制在最適果酸爆發點，其純淨度、豐富的佛手柑與蜂蜜甜味，令人心神嚮往。',
    price: 188,
    imageSeed: 'aki_bean',
    profile: {
      acid: 9,
      body: 3,
      sweetness: 8,
      aroma: 10,
      balance: 8
    },
    tags: ['頂級瑰夏', '極其稀有']
  }
];

export const COLD_BREW_PRODUCTS: ColdBrewProduct[] = [
  {
    id: 'cb-aura',
    name: 'Aura 晨曦冷萃',
    jpName: 'アウラ - AURA',
    volume: '350ml',
    description: '選用「霞」淺焙單品豆，經 18 小時低溫冰滴緩慢萃取。充分釋放水蜜桃與茉莉芬芳，裝瓶熟成 24 小時後帶有如香檳般的微汽泡發酵酒香，夏日解暑首選。',
    price: 48,
    tastingNotes: ['冰滴熟成香檳感', '熟透桃子甜', '烏龍茶感'],
    shelfLife: '需 0-4°C 冷藏，發貨後保存期 7 天',
    tags: ['熟成冰滴', '夏日限定'],
    imageSeed: 'aura_brew'
  },
  {
    id: 'cb-yugen',
    name: 'Yugen 幽玄深冷',
    jpName: '幽玄 - YUGEN',
    volume: '350ml',
    description: '選用中深焙配方豆「和」加入冰川過濾水慢速冷萃。口感如太妃糖液般豐盈滑潤，可直接飲用或完美混合鮮奶、燕麥奶，呈現馥郁的烤胡桃與牛奶巧克力雙重奏。',
    price: 45,
    tastingNotes: ['榛果奶油', '黑可可濃郁', '太妃糖尾韻'],
    shelfLife: '需 0-4°C 冷藏，發貨後保存期 10 天',
    tags: ['佐奶首選', '濃郁厚實'],
    imageSeed: 'yugen_brew'
  }
];

export const DRIP_BAG_PRODUCTS: DripBagProduct[] = [
  {
    id: 'db-fourseas',
    name: '四季掛耳精品禮盒',
    packSize: '10包/盒 (秋、霞、和、極 綜合配比)',
    description: '精美手作日系紙盒包裝，內含「秋、霞、和、極」四大經典系列的精品掛耳包。採用純手工氮氣微保鮮封裝，出差、旅行、辦公室一沖即享，隨時感受東京精品咖啡館的氤氳香氣。',
    price: 128,
    tastingNotes: ['多重風味組合', '充氮極致保鮮', '附手沖溫度教學說明'],
    tags: ['精美禮盒', '送禮體面'],
    imageSeed: 'fourseas_gift'
  }
];

export const COFFEE_GEAR_PRODUCTS: EquipmentProduct[] = [
  {
    id: 'eq-mill',
    name: 'Miyabi 雅・古典胡桃木手工磨豆機',
    jpName: '雅 - MIYABI MANUAL GRINDER',
    price: 480,
    description: '匠人級古典工藝，採用進口天然黑胡桃木整塊掏空，配備超硬度五軸 CNC 切割不鏽鋼鋼磨芯。軸承定位極致緊密，研磨顆粒均勻度堪比商用級磨豆機，不鏽鋼鍍銅把手增添典雅風韻。',
    imageSeed: 'miyabi_grinder',
    tags: ['CNC鋼磨芯', '天然胡桃木'],
    stock: 5
  },
  {
    id: 'eq-dripper',
    name: 'Handrip Co. 經典金緣雙層耐熱玻璃濾杯',
    jpName: '金之輪 - FLAME GLASS DRIPPER',
    price: 180,
    description: '專為手沖設計的雙層高硼矽耐熱玻璃濾杯，外側鍍上奢華的手工古銅金邊邊緣。內壁採用精密龍捲風螺旋肋條，排氣流暢度極佳，帶來更飽滿的咖啡醇厚度與純淨果酸口感。',
    imageSeed: 'flame_dripper',
    tags: ['耐熱玻璃', '大師排氣'],
    stock: 12
  },
  {
    id: 'eq-kettle',
    name: 'Kaze 風・極細口手沖銅壺 (600ml)',
    jpName: '風 - KAZE GOOSENECK KETTLE',
    price: 390,
    description: '表面古銅拉絲工藝，600ml 黃金配重容量。專利 90度垂直落水極細口壺嘴，即使手沖新手亦能輕鬆掌控細長、穩定的水流。配備實木防燙鵝頸手柄，完美融合美學與極致溫控手感。',
    imageSeed: 'kaze_kettle',
    tags: ['垂直落水', '不鏽鋼鍍銅'],
    stock: 8
  }
];

export const HK_AREAS = [
  { region: '香港島', stations: ['銅鑼灣 (Causeway Bay)', '中環 (Central)', '鰂魚涌 (Quarry Bay)', '柴灣 (Chai Wan)', '香港仔 (Aberdeen)'] },
  { region: '九龍', stations: ['旺角 (Mong Kok)', '尖沙咀 (Tsim Sha Tsui)', '觀塘 (Kwun Tong)', '深水埗 (Sham Shui Po)', '九龍灣 (Kowloon Bay)'] },
  { region: '新界', stations: ['沙田 (Sha Tin)', '荃灣 (Tsuen Wan)', '屯門 (Tuen Mun)', '元朗 (Yuen Long)', '將軍澳 (Tseung Kwan O)', '大埔 (Tai Po)'] }
];

export const FAQS = [
  {
    q: '你們的發貨承諾是什麼？',
    a: '我們是純線上接單、小規模職人手作烘焙工作室。我們深知咖啡豆烘焙後 3 至 7 天是黃金排氣熟成期，因此我們承諾「在烘焙後的 48 小時內極速包裝發貨」，確保您收到的豆子在最佳狀態下排氣並迎來極致風味爆發點。'
  },
  {
    q: '網頁上怎麼付款？如何下單訂貨？',
    a: '為降低小型精品工作室的營運安全認證成本與金融手續費，並把 100% 利潤與無添加原料回饋買家，我們不採用任何線上刷卡金流。您可以隨意將喜歡的豆款、研磨度、數量加入預購清單，系統將智能計算總預算，並一鍵組合成最精準的 WhatsApp 格式預留訊息，點擊後即可與主理人直接接單，透過 FPS 轉數快 / PayMe 或轉帳支付。'
  },
  {
    q: '配送運費如何計算？',
    a: '全港訂單滿 HK$350 即可享順豐自取點 / 順豐智能櫃免費配送服務。不足額訂單由順豐速運到付收費（一般首公斤為 HK$30 左右），發貨後會提供順豐追蹤單號給您。'
  }
];

export const DEFAULT_PROMOTIONS: ShopPromotion[] = [
  {
    id: 'promo-1',
    name: '【方案B・新店開張】消費滿 HK$500 自動立減 HK$50',
    type: 'AUTO_SPEND_MINUS',
    minSpend: 500,
    discountValue: 50,
    isActive: true,
    description: '買滿 HK$500，結算時將自動減少 HK$50！(全店通用)'
  },
  {
    id: 'promo-2',
    name: '【方案B・店內盛典】消費滿 HK$800 自動享 9 折優惠',
    type: 'AUTO_SPEND_PERCENT',
    minSpend: 800,
    discountValue: 10,
    isActive: false,
    description: '買滿 HK$800，結算時便自動為您打 9 折！'
  },
  {
    id: 'promo-3',
    name: '【方案B・多买多折】精品咖啡買滿 3 件或以上享 95 折',
    type: 'AUTO_COUNT_PERCENT',
    minCount: 3,
    discountValue: 5,
    isActive: false,
    description: '任選購物車總杯數/件數滿 3 件以上，全單商品金額打 95 折！'
  },
  {
    id: 'promo-4',
    name: '【方案A・優惠折扣碼】輸入「COFFEE88」立減 HK$20',
    type: 'COUPON',
    code: 'COFFEE88',
    minSpend: 250,
    discountValue: 20,
    isActive: true,
    description: '輸入折扣代碼「COFFEE88」，滿 HK$250 立減 HK$20 優惠！'
  }
];

