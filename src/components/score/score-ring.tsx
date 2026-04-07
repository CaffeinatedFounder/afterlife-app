'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 'md',
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev < score) {
          return Math.min(prev + 2, score);
        }
        clearInterval(interval);
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  const sizeConfig = {
    sm: {
      wrapper: 'w-24 h-24',
      svg: 'w-24 h-24',
      number: 'text-2xl',
      label: 'text-xs',
      strokeWidth: 6,
      radius: 36,
    },
    md: {
      wrapper: 'w-40 h-40',
      svg: 'w-40 h-40',
      number: 'text-4xl',
      label: 'text-sm',
      strokeWidth: 8,
      radius: 54,
    },
    lg: {
      wrapper: 'w-56 h-56',
      svg: 'w-56 h-56',
      number: 'text-6xl',
      label: 'text-base',
      strokeWidth: 10,
      radius: 72,
    },
  };

  const config = sizeConfig[size];
  const percentage = (animatedScore / maxScore) * 100;
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${config.wrapper} flex-shrink-0`}>
      <svg
        className={`${config.svg} transform -rotate-90`}
        viewBox="0 0 120 120"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={config.radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={config.strokeWidth}
        />

        {/* Animated circle */}
        <circle
          cx="60"
          cy="60"
          r={config.radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out',
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2D2D7F" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${config.number} font-bold text-gray-900`}>
          {animatedScore}
        </div>
        <div className={`${config.label} text-gray-600`}>/ {maxScore}</div>
      </div>
    </div>
  );
}
