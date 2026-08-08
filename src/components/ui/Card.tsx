import React, { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './Button';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  system?: 'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy';
  key?: React.Key;
}

export const Card = ({ children, className, system, ...props }: CardProps) => {
  const systemColors = {
    ayurveda: 'bg-[#5C8A3C]',
    yoga: 'bg-[#7B4FA6]',
    unani: 'bg-[#2E7D9A]',
    siddha: 'bg-[#B5451B]',
    homeopathy: 'bg-[#2A6B5E]',
  };

  return (
    <div className={cn(
      "bg-ayush-cream rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden relative",
      className
    )} {...props}>
      {system && (
        <div className={cn("absolute top-0 left-0 w-full h-1", systemColors[system as keyof typeof systemColors] || 'bg-ayush-forest')} />
      )}
      {children}
    </div>
  );
};

export const CardTag = ({ children, system }: { children: ReactNode, system: 'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy' | (string & {}) }) => {
  const systemColors = {
    ayurveda: 'bg-[#5C8A3C] text-white',
    yoga: 'bg-[#7B4FA6] text-white',
    unani: 'bg-[#2E7D9A] text-white',
    siddha: 'bg-[#B5451B] text-white',
    homeopathy: 'bg-[#2A6B5E] text-white',
  };

  return (
    <span className={cn("inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3", systemColors[system as keyof typeof systemColors] || 'bg-ayush-forest text-white')}>
      {children}
    </span>
  );
};
