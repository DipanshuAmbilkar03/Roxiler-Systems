import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import { Button } from './Button';
import type { Role } from '../lib/types';
import { cn } from '../lib/utils';

type Step = {
  id: string;
  title: string;
  body: string;
  action: string;
  path: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
};

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

function stepsForRole(role: Role): Step[] {
  if (role === 'ADMIN') {
    return [
      {
        id: 'nav-users',
        title: 'Users button',
        body: 'Use Users in the top navigation (or menu) to manage accounts.',
        action: 'Open Users to create accounts, filter by role, and view user details.',
        path: '/admin',
        target: 'nav-users',
        placement: 'auto',
      },
      {
        id: 'nav-stores',
        title: 'Stores button',
        body: 'Stores is where admin listings and store owners are managed.',
        action: 'Open Stores to add listings, assign owners, and review ratings.',
        path: '/admin',
        target: 'nav-stores',
        placement: 'auto',
      },
      {
        id: 'quick-users',
        title: 'Quick action cards',
        body: 'These shortcut cards jump you into common admin tasks.',
        action: 'Tap "Manage users" to create a user without digging through the menu.',
        path: '/admin',
        target: 'admin-quick-actions',
        placement: 'bottom',
      },
      {
        id: 'password',
        title: 'Password page',
        body: 'Update your credentials from the Password tab.',
        action: 'Open Password, type a new password, and use the eye icon to show/hide it.',
        path: '/password',
        target: 'nav-password',
        placement: 'auto',
      },
    ];
  }

  if (role === 'STORE_OWNER') {
    return [
      {
        id: 'overview',
        title: 'Overview stats',
        body: 'Your key numbers live here: average rating, total ratings, and store count.',
        action: 'Scan these cards first to see how your stores are performing.',
        path: '/owner',
        target: 'owner-stats',
        placement: 'bottom',
      },
      {
        id: 'tabs',
        title: 'Overview / Feedback tabs',
        body: 'Switch between stats and the full feedback table.',
        action: 'Tap Feedback to read rater comments without cluttering the overview.',
        path: '/owner',
        target: 'owner-tabs',
        placement: 'bottom',
      },
      {
        id: 'password',
        title: 'Password button',
        body: 'Change your password from the Password tab in navigation.',
        action: 'Open Password any time. Use the eye icon to show or hide what you type.',
        path: '/owner',
        target: 'nav-password',
        placement: 'auto',
      },
    ];
  }

  return [
    {
      id: 'search',
      title: 'Search bar',
      body: 'This is the store search field.',
      action: 'Type a store name or address to filter the list instantly.',
      path: '/stores',
      target: 'stores-search',
      placement: 'bottom',
    },
    {
      id: 'filters',
      title: 'Filter buttons',
      body: 'These chips filter by whether you already rated a store.',
      action: 'Tap "To rate" to only see stores you have not rated yet.',
      path: '/stores',
      target: 'stores-filter',
      placement: 'bottom',
    },
    {
      id: 'store-card',
      title: 'Store card',
      body: 'Each card is a store listing.',
      action: 'Tap a card to open details, pick 1-5 stars, write a comment, then submit.',
      path: '/stores',
      target: 'stores-grid',
      placement: 'top',
    },
    {
      id: 'password',
      title: 'Password button',
      body: 'Update your password from the Password tab in navigation.',
      action: 'Open Password any time (eye icon shows/hides text).',
      path: '/stores',
      target: 'nav-password',
      placement: 'auto',
    },
  ];
}

function storageKey(userId: string) {
  return `store-rating-tutorial-v3:${userId}`;
}

type Rect = { top: number; left: number; width: number; height: number };

function queryTourTarget(target: string): HTMLElement | null {
  const mobile = isMobileViewport();
  const candidates = mobile
    ? [`${target}-mobile`, target, `${target}-desktop`]
    : [`${target}-desktop`, target, `${target}-mobile`];

  for (const id of candidates) {
    const el = document.querySelector(`[data-tour="${id}"]`) as HTMLElement | null;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    if (r.width < 2 || r.height < 2) continue;
    return el;
  }
  return null;
}

function measureTarget(target: string): Rect | null {
  const el = queryTourTarget(target);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const mobile = isMobileViewport();
  const maxH = Math.min(window.innerHeight * (mobile ? 0.34 : 0.42), mobile ? 200 : 260);
  const pad = mobile ? 6 : 8;
  const height = Math.min(maxH, r.height + pad * 2);
  return {
    top: Math.max(8, r.top - pad),
    left: Math.max(8, r.left - pad),
    width: Math.min(window.innerWidth - 16, r.width + pad * 2),
    height,
  };
}

function clampTooltip(
  preferred: { top: number; left: number },
  tipW: number,
  tipH: number,
): { top: number; left: number } {
  const margin = 12;
  const maxTop = Math.max(margin, window.innerHeight - tipH - margin);
  const maxLeft = Math.max(margin, window.innerWidth - tipW - margin);
  return {
    top: Math.min(Math.max(margin, preferred.top), maxTop),
    left: Math.min(Math.max(margin, preferred.left), maxLeft),
  };
}

function preferredTooltipPos(
  rect: Rect | null,
  placement: Step['placement'] | undefined,
  tipW: number,
  tipH: number,
): { top: number; left: number } {
  const gap = 12;
  const mobile = isMobileViewport();

  if (!rect) {
    return {
      top: Math.max(12, (window.innerHeight - tipH) / 2),
      left: Math.max(12, (window.innerWidth - tipW) / 2),
    };
  }

  // On phones, keep the card centered horizontally and flip above/below the target.
  if (mobile || placement === 'auto') {
    const spaceBelow = window.innerHeight - (rect.top + rect.height) - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    let top: number;
    if (spaceBelow >= tipH || spaceBelow >= spaceAbove) {
      top = rect.top + rect.height + gap;
    } else {
      top = rect.top - tipH - gap;
    }
    const left = (window.innerWidth - tipW) / 2;
    return clampTooltip({ top, left }, tipW, tipH);
  }

  const place = placement ?? 'bottom';
  let top = rect.top;
  let left = rect.left;

  if (place === 'right') {
    top = rect.top;
    left = rect.left + rect.width + gap;
  } else if (place === 'left') {
    top = rect.top;
    left = rect.left - tipW - gap;
  } else if (place === 'top') {
    top = rect.top - tipH - gap;
    left = rect.left + rect.width / 2 - tipW / 2;
  } else {
    const below = rect.top + rect.height + gap;
    if (below + tipH > window.innerHeight - 12) {
      top = rect.top - tipH - gap;
    } else {
      top = below;
    }
    left = rect.left + rect.width / 2 - tipW / 2;
  }

  return clampTooltip({ top, left }, tipW, tipH);
}

type Props = {
  userId: string;
  role: Role;
};

export function OnboardingTutorial({ userId, role }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = useMemo(() => stepsForRole(role), [role]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tipStyle, setTipStyle] = useState<CSSProperties>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(340px, calc(100vw - 1.5rem))',
  });
  const tipRef = useRef<HTMLDivElement | null>(null);

  const step = steps[index];

  useEffect(() => {
    try {
      const done = localStorage.getItem(storageKey(userId));
      if (!done) {
        setOpen(true);
        setIndex(0);
      }
    } catch {
      setOpen(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!open || !step) return;
    if (location.pathname !== step.path) {
      navigate(step.path);
    }
  }, [open, step, location.pathname, navigate]);

  const refreshRect = useCallback(() => {
    if (!open || !step) {
      setRect(null);
      return;
    }
    const next = measureTarget(step.target);
    setRect(next);
    if (next) {
      const el = queryTourTarget(step.target);
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [open, step]);

  const positionTip = useCallback(() => {
    if (!open || !step) return;
    const tipEl = tipRef.current;
    const mobile = isMobileViewport();
    const tipW = tipEl?.offsetWidth || (mobile ? Math.min(340, window.innerWidth - 24) : 340);
    const tipH = tipEl?.offsetHeight || 260;
    const pos = preferredTooltipPos(rect, step.placement, tipW, tipH);
    setTipStyle({
      top: pos.top,
      left: pos.left,
      width: `min(340px, calc(100vw - 1.5rem))`,
      maxHeight: mobile ? 'min(58vh, 380px)' : 'min(70vh, 420px)',
      overflowY: 'auto',
      transform: 'none',
    });
  }, [open, step, rect]);

  useLayoutEffect(() => {
    if (!open) return;
    const t = window.setTimeout(refreshRect, 80);
    const t2 = window.setTimeout(refreshRect, 320);
    const t3 = window.setTimeout(refreshRect, 700);
    window.addEventListener('resize', refreshRect);
    window.addEventListener('scroll', refreshRect, true);
    window.addEventListener('orientationchange', refreshRect);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', refreshRect);
      window.removeEventListener('scroll', refreshRect, true);
      window.removeEventListener('orientationchange', refreshRect);
    };
  }, [open, index, location.pathname, refreshRect]);

  useLayoutEffect(() => {
    if (!open) return;
    positionTip();
    const t = window.setTimeout(positionTip, 50);
    const t2 = window.setTimeout(positionTip, 200);
    window.addEventListener('resize', positionTip);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener('resize', positionTip);
    };
  }, [open, index, rect, positionTip]);

  const finish = () => {
    try {
      localStorage.setItem(storageKey(userId), 'done');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const skip = () => finish();

  const next = () => {
    if (index >= steps.length - 1) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  };

  const prev = () => {
    if (index <= 0) return;
    setIndex((i) => i - 1);
  };

  const progress = ((index + 1) / steps.length) * 100;

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setOpen(true);
            if (steps[0]?.path) navigate(steps[0].path);
          }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[55] inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/90 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 sm:bottom-6 sm:right-6"
          aria-label="Open guided tour"
          data-tour="tour-launcher"
        >
          <Compass className="h-3.5 w-3.5" />
          Tour
        </button>
      ) : null}

      <AnimatePresence>
        {open && step ? (
          <>
            <motion.div
              className="pointer-events-none fixed inset-0 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
            >
              <svg className="h-full w-full">
                <defs>
                  <mask id="tour-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {rect ? (
                      <rect
                        x={rect.left}
                        y={rect.top}
                        width={rect.width}
                        height={rect.height}
                        rx="14"
                        fill="black"
                      />
                    ) : null}
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(2, 2, 12, 0.72)"
                  mask="url(#tour-mask)"
                />
              </svg>
            </motion.div>

            <button
              type="button"
              className="fixed inset-0 z-[61] cursor-default bg-transparent"
              onClick={skip}
              aria-label="Skip tour"
            />

            {rect ? (
              <div
                className="pointer-events-none fixed z-[62] rounded-2xl"
                style={{
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  boxShadow:
                    '0 0 0 2px rgba(129,140,248,0.95), 0 0 28px rgba(99,102,241,0.55)',
                }}
              />
            ) : null}

            <motion.div
              ref={tipRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tutorial-title"
              className="fixed z-[70]"
              style={tipStyle}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0c0c22]/97 p-3.5 shadow-2xl backdrop-blur-xl sm:p-5">
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-300">
                      Step {index + 1} of {steps.length}
                    </p>
                    <h2
                      id="tutorial-title"
                      className="mt-1 font-display text-base font-bold text-white sm:text-lg"
                    >
                      {step.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={skip}
                    className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close tutorial"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
                <div className="mt-3 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-300">
                    You can do this
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-white/85">
                    {step.action}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={skip}
                    className="order-2 text-left text-xs font-semibold text-white/45 underline-offset-4 hover:text-white/80 hover:underline sm:order-1"
                  >
                    Skip tour
                  </button>
                  <div className="order-1 grid grid-cols-2 gap-2 sm:order-2 sm:flex sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={index === 0}
                      onClick={prev}
                      className={cn(
                        'border-white/15 bg-white/[0.06] text-white',
                        index === 0 && 'opacity-40',
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button type="button" size="sm" onClick={next}>
                      {index >= steps.length - 1 ? 'Finish' : 'Next'}
                      {index < steps.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
