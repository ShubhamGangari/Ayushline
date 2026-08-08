import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
  className?: string;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ variant = 'primary', children, className, type, ...props }: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-ui font-semibold transition-all duration-200 rounded-full px-7 py-3';
  
  const variants = {
    primary: 'bg-ayush-gold text-ayush-forest hover:bg-opacity-90 hover:shadow-md',
    secondary: 'border-2 border-ayush-gold text-ayush-gold bg-transparent hover:bg-ayush-gold hover:text-ayush-forest',
    ghost: 'border border-ayush-ivory text-ayush-ivory bg-transparent hover:bg-ayush-ivory/10',
  };

  return (
    <button type={type} className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
