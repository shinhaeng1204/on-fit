// src/components/ui/Button.tsx
'use client';

import React, { forwardRef, ReactNode } from 'react';
import Link from 'next/link';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "ring-offset-background transition-all duration-300 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-glow-primary",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  hero: "bg-gradient-brand text-primary-foreground hover:shadow-glow-primary hover:scale-105 font-semibold",
  sport: "bg-card border border-primary/20 text-foreground hover:border-primary hover:shadow-glow-primary",
} as const;

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
} as const;

type VariantKey = keyof typeof variants;
type SizeKey = keyof typeof sizes;

type ButtonBaseProps = {
  variant?: VariantKey;
  size?: SizeKey;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children?: ReactNode;
  'data-testid'?: string;
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonBaseProps>(
  (
    {
      variant = 'default',
      size = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      href,
      target,
      rel,
      onClick,
      type = 'button',
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const classes = cx(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
    const isDisabled = !!disabled || isLoading;

    const content = (
      <>
        {isLoading && (
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
          </svg>
        )}
        {leftIcon && !isLoading ? leftIcon : null}
        <span className={cx(isLoading && 'opacity-90')}>{children}</span>
        {rightIcon}
      </>
    );

    if (href) {
      const isExternal = /^https?:\/\//i.test(href);
      const commonProps = {
        ref: ref as React.Ref<HTMLAnchorElement>,
        className: classes,
        'data-loading': isLoading || undefined,
        'aria-busy': isLoading || undefined,
        'aria-disabled': isDisabled || undefined,
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        },
        target,
        rel: target === '_blank' ? rel ?? 'noopener noreferrer' : rel,
        ...rest,
      };

      return isExternal ? (
        <a href={href} {...commonProps}>
          {content}
        </a>
      ) : (
        <Link href={href} {...commonProps}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        disabled={isDisabled}
        data-loading={isLoading || undefined}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };