/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WashiBackgroundProps {
  children: React.ReactNode;
}

export default function WashiBackground({ children }: WashiBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#1A1816] text-[#E5DCD3] font-sans antialiased selection:bg-[#C5A880] selection:text-[#1A1816] overflow-x-hidden">
      {/* Structural Japanese traditional details */}
      
      {/* 1. Fine paper fibers simulation (Overlay pattern) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 2. Abstract Geometric Watermark of Japanese Seigaiha (青海波) pattern */}
      <div 
        className="absolute inset-y-0 left-0 w-80 opacity-[0.03] pointer-events-none mix-blend-screen bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0C8.423 0 2.584 3.033 0 7.5c2.584 4.467 8.423 7.5 15 7.5s12.416-3.033 15-7.5C27.416 3.033 21.577 0 15 0zm30 0c-6.577 0-12.416 3.033-15 7.5 2.584 4.467 8.423 7.5 15 7.5s12.416-3.033 15-7.5c-2.584-4.467-8.423-7.5-15-7.5zM30 15c-6.577 0-12.416 3.033-15 7.5 2.584 4.467 8.423 7.5 15 7.5s12.416-3.033 15-7.5c-2.584-4.467-8.423-7.5-15-7.5z' fill='%238C827A' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
      />

      {/* 3. Soft radial vignette for organic depth */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-black/20 to-black/80" />

      {/* 4. Fine gold vertical dividers at extreme edges (Premium Layout) - Hidden per user request */}

      {/* Pure Human Layout Slogan sidebar indicator */}
      <div className="hidden xl:flex absolute left-3 top-1/3 flex-col items-center space-y-6 pointer-events-none text-[#8C827A]/75 text-xs tracking-[0.4em] font-serif writing-mode-vertical">
        <span className="whitespace-nowrap select-none font-medium">手烘職人 • 48 小時極速發貨</span>
      </div>



      {/* Children content (relative to reside above fibers) */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
