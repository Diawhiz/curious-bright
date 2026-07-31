import { motion, useReducedMotion } from 'framer-motion';

export interface CursorTagProps {
  id: string;
  name: string;
  action?: string;
  color?: string; // coral #FF5A36, teal #00A896, mustard #F4B43D
  x: number;
  y: number;
  visible?: boolean;
}

const DEFAULT_ACCENTS = ['#FF5A36', '#00A896', '#F4B43D'];

export function CursorTag({
  name,
  action = 'is writing',
  color,
  x,
  y,
  visible = true,
}: CursorTagProps) {
  const shouldReduceMotion = useReducedMotion();
  const accentColor = color || DEFAULT_ACCENTS[Math.abs(name.length) % DEFAULT_ACCENTS.length];

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      initial={shouldReduceMotion ? { opacity: 0, x, y } : { opacity: 0, scale: 0.7, x, y }}
      animate={{ opacity: 1, scale: 1, x, y }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.1 }
          : { type: 'spring', stiffness: 280, damping: 24 }
      }
    >
      {/* Hand-drawn style SVG pointer cursor */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(20,20,26,0.15))' }}
      >
        <path
          d="M1 1L14.5 10.5L8.5 12.5L5.5 18.5L1 1Z"
          fill={accentColor}
          stroke="#14141A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Collaborator Name Tag Chip */}
      <div
        style={{
          background: accentColor,
          color: '#FFFFFF',
          padding: '0.2rem 0.55rem',
          borderRadius: '3px 0px 3px 3px',
          fontSize: '0.75rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 3px 10px rgba(20,20,26,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(20,20,26,0.15)',
        }}
      >
        <span>{name}</span>
        {action && (
          <span style={{ fontWeight: 400, opacity: 0.9, fontSize: '0.6875rem' }}>
            {action}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default CursorTag;
