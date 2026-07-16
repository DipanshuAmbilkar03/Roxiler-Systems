import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
};

export function Card({ children, className = '', hover = false, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -3, transition: { duration: 0.18 } } : undefined}
      className={`rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-card backdrop-blur-sm ${
        hover ? 'transition-shadow hover:shadow-glow' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
