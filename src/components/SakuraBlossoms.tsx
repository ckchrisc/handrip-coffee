/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Petal {
  id: number;
  x: number;       // starting percentage width
  size: number;    // size in px
  delay: number;   // delay before start
  duration: number;// fall duration
  sway: number;    // sway width multiplier
}

export default function SakuraBlossoms() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate a fixed number of organic-looking falling petals
    const items: Petal[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 95,              // Spread across 0-95% width
      size: Math.random() * 8 + 6,         // 6px to 14px size
      delay: Math.random() * 8,           // staggered delay
      duration: Math.random() * 12 + 10,  // fall time 10s to 22s
      sway: Math.random() * 40 + 20       // sway width pixels
    }));
    setPetals(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute rounded-full select-none"
          style={{
            left: `${petal.x}%`,
            width: petal.size,
            height: petal.size * 1.3, // organic leaf shape
            background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.45) 0%, rgba(197, 168, 128, 0.15) 100%)',
            borderBottomRightRadius: '2px', // pointer end like sakura petal
            boxShadow: '0 1px 1px rgba(197, 168, 128, 0.1)'
          }}
          initial={{
            y: -50,
            opacity: 0,
            rotate: 0,
            x: 0
          }}
          animate={{
            y: '100vh',
            opacity: [0, 0.9, 0.9, 0],
            rotate: [0, 180, 360, 500],
            x: [0, petal.sway, -petal.sway, petal.sway / 2]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
