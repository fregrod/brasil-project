import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 dark:from-zinc-100 dark:to-zinc-200 text-zinc-100 dark:text-zinc-950 shadow-sm border border-zinc-800/80 dark:border-zinc-300 transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Base ground line */}
        <line
          x1="4"
          y1="23"
          x2="28"
          y2="23"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Twin Towers (Anexo I & II) */}
        <line
          x1="14"
          y1="7"
          x2="14"
          y2="23"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="7"
          x2="18"
          y2="23"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Passarela / walkway */}
        <line
          x1="14"
          y1="13"
          x2="18"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.4"
        />

        {/* Left dome: Câmara dos Deputados (côncava - voltada para cima) */}
        <path
          d="M 6.5 17.5 C 7.5 22.5 11.5 22.5 12.5 17.5 Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Right dome: Senado Federal (convexa - voltada para baixo) */}
        <path
          d="M 19.5 23 C 20.5 18 24.5 18 25.5 23 Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Stylized tiny celestial dot (Cruzeiro do Sul / República) */}
        <circle cx="16" cy="4" r="1.1" fill="currentColor" />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 34,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              BRASIL
            </span>
            <span className="font-medium text-sm tracking-tight text-zinc-500 dark:text-zinc-400">
              PROJECT
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 dark:text-zinc-500 mt-0.5">
            Base Analítica Primária
          </span>
        </div>
      )}
    </div>
  );
};
