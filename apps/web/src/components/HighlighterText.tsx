import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface HighlighterTextProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  delay?: number;
}

export function HighlighterText({
  children,
  color = '#F4B43D', // Default mustard highlighter
  className = '',
  delay = 0.1,
}: HighlighterTextProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className={`relative inline-block ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      
      {/* SVG Highlighter Stroke Animated Left-to-Right */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '100%',
          height: '14px',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,13 C30,17 70,8 100,14"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          opacity={0.55}
          initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={
            shouldReduceMotion
              ? { duration: 0.1 }
              : { type: 'spring', stiffness: 140, damping: 20, delay }
          }
        />
      </svg>
    </span>
  );
}

export default HighlighterText;
