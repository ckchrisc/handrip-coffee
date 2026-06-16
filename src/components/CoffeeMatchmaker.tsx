/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { COFFEE_BEANS } from '../data';
import { CoffeeBean, SensoryProfile } from '../types';
import RadarChart from './RadarChart';
import { Check, Sparkles, Coffee, ExternalLink } from 'lucide-react';

interface CoffeeMatchmakerProps {
  onAddToOrder: (bean: CoffeeBean, quantity: number, grindSize: string) => void;
  beans?: CoffeeBean[];
}

export default function CoffeeMatchmaker({ onAddToOrder, beans }: CoffeeMatchmakerProps) {
  // Desired flavor state (0-10)
  const [prefAcid, setPrefAcid] = useState<number>(5);
  const [prefBody, setPrefBody] = useState<number>(5);
  const [prefSweetness, setPrefSweetness] = useState<number>(7);
  const [prefRoast, setPrefRoast] = useState<string>('any'); // any, Light, Medium, Dark
  const [quantity, setQuantity] = useState<number>(1);
  const [grindSize, setGrindSize] = useState<string>('整豆');

  const grindOptions = ['整豆', '粗研磨 (手沖/法壓)', '中研磨 (掛耳/滴濾)', '細研磨 (意式/摩卡)'];

  const beansList = beans || COFFEE_BEANS;

  // Calculate matching scores
  const matchedBeans = useMemo(() => {
    return beansList.map((bean) => {
      // Calculate geometric distance in 3 dimensions (acid, body, sweetness)
      const diffAcid = bean.profile.acid - prefAcid;
      const diffBody = bean.profile.body - prefBody;
      const diffSweet = bean.profile.sweetness - prefSweetness;

      const distance = Math.sqrt(
        diffAcid * diffAcid + 
        diffBody * diffBody + 
        diffSweet * diffSweet
      );

      // Max distance is sqrt(10^2 + 10^2 + 10^2) = ~17.3
      const maxDistance = 15;
      let score = Math.round((1 - distance / maxDistance) * 100);
      score = Math.max(10, Math.min(100, score));

      // Apply filter penalization if roast doesn't match
      if (prefRoast !== 'any' && bean.roastLevel !== prefRoast) {
        score = Math.max(10, score - 25);
      }

      return {
        bean,
        score
      };
    }).sort((a, b) => b.score - a.score); // highest score first
  }, [prefAcid, prefBody, prefSweetness, prefRoast]);

  // Best match is index 0
  const bestMatch = matchedBeans[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Selector controls - 5 cols */}
      <div className="lg:col-span-5 p-6 rounded-2xl border border-[#8C827A]/30 bg-[#24211E]/95 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-serif font-semibold block mb-1">
            CUSTOM FLAVOUR SELECTOR
          </span>
          <h3 className="text-xl font-serif text-[#E5DCD3] font-medium tracking-tight">
            調配您的理想風味
          </h3>
          <p className="text-xs text-[#E5DCD3]/75 mt-1 leading-relaxed">
            移動拉桿，我們的烘焙師精選資料庫將在 48 小時內極速過濾並匹配符合您味蕾偏好的專屬豆款。
          </p>
        </div>

        <div className="space-y-5">
          {/* Slider 1: Acid */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#E5DCD3]">期望果酸感 (Acidity)</span>
              <span className="font-mono text-[#C5A880] font-bold">{prefAcid} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={prefAcid}
              onChange={(e) => setPrefAcid(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#8C827A]/30 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A] font-mono leading-none">
              <span>低酸 (厚實堅果)</span>
              <span>高酸 (明亮明艷)</span>
            </div>
          </div>

          {/* Slider 2: Body */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#E5DCD3]">期望醇厚度 (Body / Texture)</span>
              <span className="font-mono text-[#C5A880] font-bold">{prefBody} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={prefBody}
              onChange={(e) => setPrefBody(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#8C827A]/30 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A] font-mono leading-none">
              <span>清澈 (清爽茶感)</span>
              <span>飽滿 (朱古力感)</span>
            </div>
          </div>

          {/* Slider 3: Sweetness */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#E5DCD3]">期望甘甜感 (Sweetness)</span>
              <span className="font-mono text-[#C5A880] font-bold">{prefSweetness} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={prefSweetness}
              onChange={(e) => setPrefSweetness(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#8C827A]/30 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A] font-mono leading-none">
              <span>微甘</span>
              <span>濃糖甜蜜</span>
            </div>
          </div>

          {/* Select: Roast Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#E5DCD3]">{`烘焙程度偏好 (Roast Level)`}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 'any', label: '不限' },
                { val: 'Light', label: '淺焙' },
                { val: 'Medium', label: '中焙' },
                { val: 'Dark', label: '深焙' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPrefRoast(opt.val)}
                  className={`py-1.5 text-xs font-serif rounded border transition-all duration-300 ${
                    prefRoast === opt.val
                      ? 'bg-[#C5A880] border-[#C5A880] text-[#1A1816] font-semibold'
                      : 'border-[#8C827A]/40 text-[#E5DCD3] hover:bg-[#8C827A]/15 bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mini comparison table */}
        <div className="border-t border-[#8C827A]/30 pt-4">
          <span className="text-[10px] font-semibold text-[#8C827A] uppercase tracking-wider block mb-2">
            其他豆款吻合度
          </span>
          <div className="space-y-1.5">
            {matchedBeans.slice(1).map(({ bean, score }) => (
              <div
                key={bean.id}
                className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-[#8C827A]/10 transition-colors bg-[#1A1816]/40 border border-[#8C827A]/25"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-[#E5DCD3] bg-[#8C827A]/25 px-1.5 py-0.5 rounded text-[10px]">
                    {bean.name}
                  </span>
                  <span className="text-stone-350">{bean.origin.split(' ')[0]}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-[#8C827A]">{bean.roastLevelZH}</span>
                  <span className="font-mono font-bold text-[#C5A880]">{score}% Match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Card - 7 cols */}
      <div className="lg:col-span-7 flex flex-col md:flex-row gap-6 p-6 rounded-2xl border-2 border-[#C5A880] bg-[#24211E] shadow-md relative overflow-hidden">
        {/* Hot badge */}
        <div className="absolute top-0 right-0 bg-[#C5A880] text-[#1A1816] text-[10px] font-serif tracking-widest uppercase font-bold py-1 px-4 rounded-bl-xl shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 height-3 animate-spin" />
          最佳推薦 {bestMatch.score}% MATCH
        </div>

        {/* Details - left of card */}
        <div className="flex-1 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div>
              <span className="inline-block px-2 py-0.5 bg-[#C5A880]/15 text-[#C5A880] text-[10px] font-semibold rounded-full border border-[#C5A880]/20">
                {bestMatch.bean.roastLevelZH}
              </span>
              <span className="ml-1.5 inline-block px-2 py-0.5 bg-[#8C827A]/20 text-[#C5A880] text-[10px] font-semibold rounded-full border border-[#8C827A]/30">
                {bestMatch.bean.process}
              </span>
            </div>
            <h4 className="text-3xl font-serif text-[#E5DCD3] font-bold tracking-tight">
              {bestMatch.bean.jpName}
            </h4>
            <div className="font-serif text-[#C5A880] text-sm font-semibold border-b border-[#8C827A]/25 pb-2">
              {bestMatch.bean.origin}
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              {bestMatch.bean.description}
            </p>
          </div>

          {/* Tasting notes */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#C5A880] tracking-widest block uppercase">
              烘焙師鑑定風味 (Tasting Notes)
            </span>
            <div className="flex flex-wrap gap-1">
              {bestMatch.bean.tastingNotes.map((note) => (
                <span
                  key={note}
                  className="bg-[#1A1816] border border-[#8C827A]/30 text-[#E5DCD3] text-[10px] px-2 py-1 rounded font-medium"
                >
                  • {note}
                </span>
              ))}
            </div>
          </div>

          {/* Selector parameters under recommendation */}
          <div className="pt-4 border-t border-[#8C827A]/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="block text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">
                選擇研磨度
              </label>
              <select
                value={grindSize}
                onChange={(e) => setGrindSize(e.target.value)}
                className="w-full sm:w-44 text-xs bg-[#1A1816] border border-[#8C827A]/50 rounded-lg py-1.5 px-2 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880]"
              >
                {grindOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-xs text-stone-400 font-mono">
                  港幣零售 / {bestMatch.bean.weight || '200g'}
                </span>
                <div className="text-2xl font-mono text-[#E5DCD3] font-bold leading-none">
                  HK$ {bestMatch.bean.price}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center border border-[#8C827A]/40 bg-[#1A1816] rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1.5 text-xs text-stone-400 font-bold hover:bg-[#24211E] rounded-l-lg transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-mono font-bold text-[#E5DCD3]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1.5 text-xs text-stone-400 font-bold hover:bg-[#24211E] rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <button
            type="button"
            onClick={() => {
              onAddToOrder(bestMatch.bean, quantity, grindSize);
              // reset temp quantity
              setQuantity(1);
            }}
            className="w-full mt-2 bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816] font-serif text-sm tracking-widest font-bold py-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            將此推薦豆款加入預購籃
          </button>
        </div>

        {/* Interactive radar profile - right of card */}
        <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
          <RadarChart
            profile={bestMatch.bean.profile}
            title={`${bestMatch.bean.name} 完整風味輪`}
            size={220}
          />
        </div>
      </div>
    </div>
  );
}
