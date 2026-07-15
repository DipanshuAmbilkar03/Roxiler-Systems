import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  value: number;
  label: string;
};

export function AnimatedCounter({ value, label }: Props) {
  const spring = useSpring(0, { stiffness: 90, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <div className="rounded-token border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <motion.p className="mt-2 text-3xl font-bold text-slate-900">{display}</motion.p>
    </div>
  );
}
