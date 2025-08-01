import React from 'react';
import { Box } from '@mui/material';
import './Logo.css';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 200, 
  height = 60, 
  className 
}) => {
  return (
    <Box className={className} sx={{ display: 'inline-block' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 200 60" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="logo-gradient-stop-primary" />
            <stop offset="50%" className="logo-gradient-stop-secondary" />
            <stop offset="100%" className="logo-gradient-stop-success" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="logo-text-gradient-stop-primary" />
            <stop offset="100%" className="logo-text-gradient-stop-success" />
          </linearGradient>
        </defs>
        
        {/* Фон логотипа */}
        <rect x="2" y="2" width="196" height="56" rx="8" fill="url(#logoGradient)" opacity="0.1"/>
        
        {/* Иконка поезда */}
        <g transform="translate(10, 15)">
          {/* Корпус поезда */}
          <rect x="0" y="8" width="24" height="12" rx="2" fill="url(#logoGradient)"/>
          <rect x="26" y="8" width="20" height="12" rx="2" fill="url(#logoGradient)"/>
          
          {/* Окна */}
          <rect x="2" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="8" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="14" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="20" y="10" width="2" height="4" rx="1" fill="white" opacity="0.9"/>
          
          <rect x="28" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="34" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="40" y="10" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          
          {/* Колеса */}
          <circle cx="6" cy="22" r="3" fill="#333"/>
          <circle cx="18" cy="22" r="3" fill="#333"/>
          <circle cx="32" cy="22" r="3" fill="#333"/>
          <circle cx="42" cy="22" r="3" fill="#333"/>
          
          {/* Центры колес */}
          <circle cx="6" cy="22" r="1" fill="white"/>
          <circle cx="18" cy="22" r="1" fill="white"/>
          <circle cx="32" cy="22" r="1" fill="white"/>
          <circle cx="42" cy="22" r="1" fill="white"/>
          
          {/* Передняя часть */}
          <path d="M 0 8 L -4 12 L -4 16 L 0 20 Z" fill="url(#logoGradient)"/>
          
          {/* Рельсы */}
          <rect x="-5" y="25" width="55" height="1" fill="#666"/>
          <rect x="-5" y="27" width="55" height="1" fill="#666"/>
        </g>
        
        {/* Текст PEREMENA */}
        <text x="65" y="25" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="url(#textGradient)">
          PEREMENA
        </text>
        
        {/* Подзаголовок */}
        <text x="65" y="40" fontFamily="Arial, sans-serif" fontSize="10" fill="#666">
          ГрандСервисЭкспресс
        </text>
        
        {/* Декоративные элементы */}
        <circle cx="180" cy="15" r="2" fill="#1976d2" opacity="0.6"/>
        <circle cx="185" cy="20" r="1.5" fill="#42a5f5" opacity="0.6"/>
        <circle cx="190" cy="25" r="1" fill="#2e7d32" opacity="0.6"/>
      </svg>
    </Box>
  );
};