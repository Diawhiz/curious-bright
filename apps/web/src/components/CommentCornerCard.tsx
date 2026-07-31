import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CommentCornerCardProps {
  children: React.ReactNode;
  commentPreview?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function CommentCornerCard({
  children,
  commentPreview,
  className = '',
  style,
  onClick,
}: CommentCornerCardProps) {
  const [isPeeled, setIsPeeled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCornerHoverStart = () => setIsPeeled(true);
  const handleCornerHoverEnd = () => setIsPeeled(false);

  return (
    <div
      className={`comment-corner-card ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Signature Corner Peel Ear (Top-Right Folded Page Corner) */}
      <motion.div
        className="comment-corner-ear"
        onMouseEnter={handleCornerHoverStart}
        onMouseLeave={handleCornerHoverEnd}
        onClick={(e) => {
          e.stopPropagation();
          setIsPeeled((prev) => !prev);
        }}
        animate={
          shouldReduceMotion
            ? {}
            : isPeeled
            ? { x: -4, y: 4, rotate: -12, scale: 1.15 }
            : { x: 0, y: 0, rotate: 0, scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        title="Peel corner to view note"
      >
        <span style={{ fontSize: '9px', lineHeight: 1, opacity: 0.6 }}>✎</span>
      </motion.div>

      {/* Floating Comment Preview Tooltip Revealed on Peel */}
      <AnimatePresence>
        {isPeeled && commentPreview && (
          <motion.div
            className="comment-preview-popup"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span>{commentPreview}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

export default CommentCornerCard;
