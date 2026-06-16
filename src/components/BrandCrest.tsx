/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import HeadLogo from './HeadLogo';

interface BrandCrestProps {
  size?: number;
  className?: string;
  animate?: boolean;
  customLogoUrl?: string;
}

export default function BrandCrest({ size = 300, className = '', animate = true, customLogoUrl }: BrandCrestProps) {
  // Use the Handrip.co brand logo image provided by the user
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      animate={animate ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <HeadLogo 
        size={size} 
        className="rounded-full border border-[#C5A880]/50 shadow-xl bg-[#1A1816]/70 p-1" 
        customLogoUrl={customLogoUrl}
      />
    </motion.div>
  );
}
