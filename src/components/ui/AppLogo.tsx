import React from 'react';
import logoImg from '../../assets/logo.png';

interface AppLogoProps {
  className?: string;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'w-10 h-10',
  alt = 'Logo Sistem Informasi Perpustakaan',
}) => {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={`object-contain ${className}`}
    />
  );
};
