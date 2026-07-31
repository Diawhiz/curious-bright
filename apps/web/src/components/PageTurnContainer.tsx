import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTurnContainerProps {
  children: React.ReactNode;
}

export function PageTurnContainer({ children }: PageTurnContainerProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div style={{ perspective: '1200px', width: '100%', minHeight: '100%' }}>
      <motion.div
        key={location.pathname}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, rotateY: -7, x: 24, transformOrigin: 'left center' }
        }
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, rotateY: 5, x: -20, transformOrigin: 'right center' }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.15 }
            : { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }
        }
        style={{ width: '100%', minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default PageTurnContainer;
