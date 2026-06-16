/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { SensoryProfile } from '../types';

interface RadarChartProps {
  profile: SensoryProfile;
  interactive?: boolean;
  onChange?: (key: keyof SensoryProfile, value: number) => void;
  title?: string;
  size?: number;
}

export default function RadarChart({
  profile,
  interactive = false,
  onChange,
  title,
  size = 280
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  // 5 dimensions
  const axes: { key: keyof SensoryProfile; label: string }[] = useMemo(() => [
    { key: 'acid', label: '果酸度 (Acid)' },
    { key: 'sweetness', label: '甜潤感 (Sweet)' },
    { key: 'balance', label: '平衡度 (Balance)' },
    { key: 'body', label: '醇厚度 (Body)' },
    { key: 'aroma', label: '香氣層次 (Aroma)' }
  ], []);

  // Calculate coordinates for a specific value on an axis index
  const getCoordinates = (index: number, value: number) => {
    // Top axis index 0 is at -90 degrees (12 o'clock)
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    // Scale value (0 to 10) to radius
    const valRatio = Math.max(0, Math.min(10, value)) / 10;
    const len = radius * valRatio;
    return {
      x: center + len * Math.cos(angle),
      y: center + len * Math.sin(angle)
    };
  };

  // Outer labels positions helper
  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const labelRadius = radius + 22;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  };

  // Core radar polygon point string
  const pointsString = useMemo(() => {
    return axes
      .map((axis, index) => {
        const val = profile[axis.key];
        const { x, y } = getCoordinates(index, val);
        return `${x},${y}`;
      })
      .join(' ');
  }, [profile, axes, radius, center]);

  // Generate grid lines coordinates (e.g. concentric pentagons for levels 2, 4, 6, 8, 10)
  const gridLevels = [2, 4, 6, 8, 10];
  const gridPolygons = gridLevels.map((level) => {
    return axes
      .map((_, index) => {
        const { x, y } = getCoordinates(index, level);
        return `${x},${y}`;
      })
      .join(' ');
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#8C827A]/30 bg-gradient-to-b from-[#1A1816]/95 to-[#24211E]/95 shadow-sm select-none">
      {title && (
        <h4 className="text-center text-xs font-serif text-[#C5A880] tracking-widest uppercase mb-3 border-b border-[#8C827A]/30 pb-1 w-full max-w-[180px]">
          {title}
        </h4>
      )}

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric grid lines */}
          {gridPolygons.map((pts, i) => (
            <polygon
              key={i}
              points={pts}
              fill="none"
              stroke="#8C827A"
              strokeWidth="0.75"
              strokeDasharray={i === gridPolygons.length - 1 ? 'none' : '2,2'}
              className="opacity-50"
            />
          ))}

          {/* Web grid axes spokes */}
          {axes.map((_, index) => {
            const outer = getCoordinates(index, 10);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#8C827A"
                strokeWidth="0.75"
                className="opacity-50"
              />
            );
          })}

          {/* Core profile polygon fill */}
          <polygon
            points={pointsString}
            fill="#C5A880"
            fillOpacity="0.3"
            stroke="#C5A880"
            strokeWidth="2.5"
            className="transition-all duration-500 ease-out"
          />

          {/* Profile vertex points indicator circles */}
          {axes.map((axis, index) => {
            const val = profile[axis.key];
            const { x, y } = getCoordinates(index, val);
            return (
              <g key={index} className="group cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={interactive ? '6' : '4.5'}
                  fill={interactive ? '#C5A880' : '#E5DCD3'}
                  stroke="#1A1816"
                  strokeWidth="1.5"
                  className="transition-all duration-500 hover:scale-125 shadow-sm"
                  onClick={() => {
                    if (interactive && onChange) {
                       const nextVal = (val % 10) + 1; // cyclical increment on click
                       onChange(axis.key, nextVal);
                    }
                  }}
                />
                <title>{`${axis.label}: ${val}/10`}</title>
              </g>
            );
          })}

          {/* Outer label texts with premium typography */}
          {axes.map((axis, index) => {
            const { x, y } = getLabelCoordinates(index);
            // Text alignment helpers
            let textAnchor = 'middle';
            let dy = '0.35em';
            if (index === 0) {
              textAnchor = 'middle';
              dy = '-0.6em';
            } else if (index === 1 || index === 2) {
              textAnchor = 'start';
            } else if (index === 3 || index === 4) {
              textAnchor = 'end';
            }

            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={dy}
                className="text-[11px] font-sans font-medium text-[#E5DCD3] fill-current"
              >
                {axis.label.split(' ')[0]} {/* Keep compact */}
                <tspan className="text-[9px] font-mono font-normal opacity-60 ml-0.5 block">
                  ({profile[axis.key]})
                </tspan>
              </text>
            );
          })}
        </svg>

        {interactive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-serif tracking-widest text-[#C5A880] bg-[#1A1816]/90 px-2 py-0.5 rounded-full border border-[#8C827A]/50 shadow-sm animate-pulse">
              點擊圓點切換等級
            </span>
          </div>
        )}
      </div>

      {interactive && onChange && (
        <div className="mt-4 w-full space-y-2.5 max-w-[240px] border-t border-[#8C827A]/30 pt-3">
          <p className="text-[10px] font-sans text-center text-[#C5A880] font-medium leading-relaxed">
            調整下方拖動條，調製您尋求的客製特調風味：
          </p>
          {axes.map((axis) => (
            <div key={axis.key} className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#E5DCD3] font-sans text-[11px] font-medium w-16">
                {axis.label.split(' ')[0]}
              </span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={profile[axis.key]}
                onChange={(e) => onChange(axis.key, parseInt(e.target.value))}
                className="w-24 h-1 bg-[#8C827A]/20 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
              />
              <span className="text-[#C5A880] font-bold text-right w-5">
                {profile[axis.key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
