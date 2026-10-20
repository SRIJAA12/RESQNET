import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'scale-up';
  delayMs?: number;
  className?: string;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delayMs = 0,
  className = '',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const getInitialClasses = () => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-5';
      case 'slide-left':
        return 'opacity-0 -translate-x-5';
      case 'scale-up':
        return 'opacity-0 scale-[0.97]';
      case 'fade-in':
      default:
        return 'opacity-0';
    }
  };

  const getVisibleClasses = () => {
    switch (animation) {
      case 'fade-up':
      case 'slide-left':
        return 'opacity-100 translate-y-0 translate-x-0';
      case 'scale-up':
        return 'opacity-100 scale-100';
      case 'fade-in':
      default:
        return 'opacity-100';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '400ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all ${isVisible ? getVisibleClasses() : getInitialClasses()} ${className}`}
    >
      {children}
    </div>
  );
};
