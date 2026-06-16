import React from 'react';
import HandripLogoImg from '../assets/images/handrip_logo_1780150631769.png';

interface HeadLogoProps {
  className?: string;
  size?: number;
  customLogoUrl?: string;
}

export default function HeadLogo({ className = 'w-8 h-8', size, customLogoUrl }: HeadLogoProps) {
  const style = size ? { width: size, height: size } : {};
  const logoSrc = customLogoUrl || localStorage.getItem('handrip_custom_logo') || HandripLogoImg;
  return (
    <img
      src={logoSrc}
      alt="Handrip Co"
      referrerPolicy="no-referrer"
      className={`${className} select-none object-cover`}
      style={style}
    />
  );
}
