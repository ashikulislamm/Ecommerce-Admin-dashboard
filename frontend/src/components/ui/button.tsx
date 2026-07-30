import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer outline-hidden select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs border border-transparent',
        emerald: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs border border-transparent',
        purple: 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs border border-transparent',
        lime: 'bg-lime-100 text-lime-900 border border-lime-200 hover:bg-lime-200 shadow-xs',
        outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-transparent',
        destructiveGhost: 'text-rose-600 hover:bg-rose-50 hover:text-rose-800 border border-transparent',
        link: 'text-emerald-700 underline-offset-4 hover:underline border border-transparent',
      },
      size: {
        default: 'px-4 py-2.5 h-9',
        sm: 'px-3 py-1.5 h-8 text-xs',
        lg: 'px-5 py-3 h-10 text-sm',
        icon: 'w-9 h-9 p-2 shrink-0',
        'icon-sm': 'w-8 h-8 p-1.5 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
