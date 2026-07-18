import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Star,
  Store,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { BlurFade } from '../../components/magicui/blur-fade';
import { Marquee } from '../../components/magicui/marquee';
import { NumberTicker } from '../../components/magicui/number-ticker';
import { Particles } from '../../components/magicui/particles';
import { AnimatedGradientText } from '../../components/magicui/animated-gradient-text';
import { BorderBeam } from '../../components/magicui/border-beam';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { homePathForRole, useAuthStore } from '../../lib/auth-store';
import { loginSchema, type LoginForm } from '../../lib/schemas';
import type { AuthResponse } from '../../lib/types';
import { cn } from '../../lib/utils';

/* ───── Review data ───── */
const reviews = [
  {
    name: 'Alice',
    store: 'Green Market Fresh',
    rating: 5,
    body: 'Clean aisles, friendly staff, honest prices.',
    avatar: 'bg-gradient-to-br from-fuchsia-500 to-rose-500',
    accent: 'border-fuchsia-500/20',
  },
  {
    name: 'Rahul',
    store: 'Blue Harbor Seafood',
    rating: 4,
    body: 'Fresh catch every time. Worth the short wait.',
    avatar: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    accent: 'border-cyan-500/20',
  },
  {
    name: 'Maya',
    store: 'Sunny Bakery Cafe',
    rating: 5,
    body: 'Best sourdough nearby. Ratings matched reality.',
    avatar: 'bg-gradient-to-br from-amber-500 to-orange-500',
    accent: 'border-amber-500/20',
  },
  {
    name: 'Omar',
    store: 'Express Hub',
    rating: 4,
    body: 'Quick groceries. Convenient and well rated.',
    avatar: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    accent: 'border-emerald-500/20',
  },
  {
    name: 'Priya',
    store: 'Blue Harbor Seafood',
    rating: 5,
    body: 'Great service. Review took seconds after signup.',
    avatar: 'bg-gradient-to-br from-violet-500 to-indigo-500',
    accent: 'border-violet-500/20',
  },
  {
    name: 'Leo',
    store: 'Sunny Bakery Cafe',
    rating: 3,
    body: 'Busy weekends, still solid — glad others flagged peak times.',
    avatar: 'bg-gradient-to-br from-sky-500 to-cyan-500',
    accent: 'border-sky-500/20',
  },
];

const stores = [
  { name: 'Green Market Fresh', area: 'Downtown', score: 4.8, color: 'from-emerald-500 to-teal-500' },
  { name: 'Blue Harbor Seafood', area: 'Waterfront', score: 4.5, color: 'from-blue-500 to-indigo-500' },
  { name: 'Sunny Bakery Cafe', area: 'Old Town', score: 4.7, color: 'from-amber-500 to-orange-500' },
  { name: 'Express Hub', area: 'Metro Annex', score: 4.4, color: 'from-violet-500 to-fuchsia-500' },
  { name: 'Harbor Provisions', area: 'Lakeview', score: 4.6, color: 'from-cyan-500 to-sky-500' },
  { name: 'Northside Pantry', area: 'Suburb North', score: 4.2, color: 'from-rose-500 to-pink-500' },
];

const reviewColA = reviews.filter((_, i) => i % 2 === 0);
const reviewColB = reviews.filter((_, i) => i % 2 === 1);

/* ───── Stats ───── */
const stats = [
  { icon: Store, label: 'Stores', value: 1240, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
  { icon: Users, label: 'Users', value: 8500, color: 'text-violet-400', bg: 'from-violet-500/20 to-indigo-500/20' },
  { icon: Star, label: 'Reviews', value: 32000, color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20' },
];

/* ───── Trust badges ───── */
const trustItems = [
  { icon: Shield, text: 'Secure Auth', color: 'text-emerald-400' },
  { icon: Zap, text: 'Real-time', color: 'text-amber-400' },
  { icon: CheckCircle2, text: 'Verified', color: 'text-cyan-400' },
];

/* ───── Sub-components ───── */
function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < value
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]'
              : 'fill-transparent text-white/15',
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  name,
  store,
  rating,
  body,
  avatar,
  accent,
}: (typeof reviews)[number]) {
  return (
    <figure
      className={cn(
        'w-[215px] rounded-2xl border bg-white/[0.03] p-3.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:shadow-xl hover:-translate-y-0.5',
        accent,
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md',
            avatar,
          )}
        >
          {name[0]}
        </div>
        <div className="min-w-0">
          <figcaption className="truncate text-sm font-semibold text-white">{name}</figcaption>
          <p className="truncate text-[11px] text-white/40">{store}</p>
        </div>
      </div>
      <div className="mt-2">
        <Stars value={rating} />
      </div>
      <blockquote className="mt-2 text-[11px] leading-relaxed text-white/50">{body}</blockquote>
    </figure>
  );
}

function StoreChip({ name, area, score, color }: (typeof stores)[number]) {
  return (
    <div className="flex w-[215px] items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06]">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
          color,
        )}
      >
        <Store className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-[11px] text-white/35">{area}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-bold text-amber-300">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ───── Main Page ───── */
export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (values: LoginForm) =>
      apiData<AuthResponse>(api.post('/auth/login', values)),
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast('Signed in', 'success');
      navigate(homePathForRole(data.user.role));
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <PageTransition>
      <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#050510]">
        {/* ═══ Rich background layers ═══ */}
        <div className="pointer-events-none absolute inset-0">
          {/* Aurora-style gradient orbs */}
          <div className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full bg-indigo-600/15 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
          <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
          <div className="absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/8 blur-[80px]" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 40% 30%, black, transparent)',
            }}
          />

          {/* Horizontal aurora stripe */}
          <div className="absolute left-0 right-0 top-[30%] h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="absolute left-0 right-0 top-[70%] h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
        </div>

        {/* Interactive particles */}
        <Particles
          className="absolute inset-0 z-0"
          quantity={45}
          ease={80}
          color="#818cf8"
          size={0.5}
          staticity={40}
        />

        {/* ═══ Main layout ═══ */}
        <div className="relative z-10 mx-auto grid h-full max-w-[1280px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ─── Left: Hero + Marquees ─── */}
          <section className="hidden h-full min-h-0 flex-col overflow-hidden px-8 py-8 lg:flex xl:px-12">
            {/* Badge */}
            <BlurFade delay={0.05} direction="up" offset={10}>
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                  Roxiler System
                </span>
              </div>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.14} direction="up" offset={14}>
              <h1 className="mt-6 max-w-lg font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Know before{' '}
                <AnimatedGradientText
                  colorFrom="#818cf8"
                  colorTo="#22d3ee"
                  speed={1.2}
                  className="font-extrabold"
                >
                  you shop.
                </AnimatedGradientText>
              </h1>
            </BlurFade>

            {/* Subtitle */}
            <BlurFade delay={0.26} direction="up" offset={10}>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/45">
                Browse ratings, leave reviews, and help others shop smarter —
                all on a platform built for{' '}
                <span className="text-white/70 font-medium">transparency</span>.
              </p>
            </BlurFade>

            {/* Stats row */}
            <BlurFade delay={0.42} direction="up" offset={8}>
              <div className="mt-6 flex items-center gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 backdrop-blur-sm"
                  >
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br', s.bg)}>
                      <s.icon className={cn('h-4 w-4', s.color)} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-0.5">
                        <NumberTicker
                          value={s.value}
                          delay={0.6}
                          className="text-base font-bold text-white"
                        />
                        <span className={cn('text-[10px] font-bold', s.color)}>+</span>
                      </div>
                      <p className="text-[10px] font-medium text-white/35">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BlurFade>

            {/* Marquee fills remaining height */}
            <div className="relative mt-6 min-h-0 flex-1 overflow-hidden">
              <div className="flex h-full gap-3">
                <Marquee vertical pauseOnHover className="h-full [--duration:28s] [--gap:0.65rem]">
                  {reviewColA.map((r) => (
                    <ReviewCard key={r.name + r.store} {...r} />
                  ))}
                </Marquee>
                <Marquee vertical reverse pauseOnHover className="h-full [--duration:34s] [--gap:0.65rem]">
                  {stores.map((s) => (
                    <StoreChip key={s.name} {...s} />
                  ))}
                </Marquee>
                <Marquee
                  vertical
                  pauseOnHover
                  className="hidden h-full [--duration:30s] [--gap:0.65rem] xl:flex"
                >
                  {reviewColB.map((r) => (
                    <ReviewCard key={r.name + r.store + '-b'} {...r} />
                  ))}
                </Marquee>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050510] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050510] to-transparent" />
            </div>
          </section>

          {/* ─── Right: Sign-in form ─── */}
          <section className="flex h-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-[420px]"
            >
              {/* Mobile brand */}
              <div className="mb-6 lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                    Roxiler System
                  </span>
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
                  Know before you shop.
                </h1>
                <p className="mt-1.5 text-sm text-white/45">
                  Browse ratings, leave reviews, and help others shop smarter.
                </p>
              </div>

              {/* Glow behind form */}
              <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/8 via-transparent to-cyan-500/5 blur-2xl" />

              {/* Form card with BorderBeam */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#818cf8"
                  colorTo="#22d3ee"
                  borderWidth={1}
                />

                {/* Inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-transparent" />

                <div className="relative">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
                    <span className="h-px w-5 bg-gradient-to-r from-indigo-500/60 to-transparent" />
                    Sign in
                  </p>
                  <h2 className="mt-2.5 font-display text-[1.65rem] font-bold tracking-tight text-white">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-sm text-white/40">
                    Sign in to rate and review your favorite stores.
                  </p>

                  <form
                    className="mt-6 space-y-4"
                    onSubmit={handleSubmit((v) => mutation.mutate(v))}
                  >
                    <Input
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  {/* Trust badges */}
                  <div className="mt-5 flex items-center justify-center gap-4">
                    {trustItems.map((t) => (
                      <span key={t.text} className="inline-flex items-center gap-1 text-[10px] font-medium text-white/35">
                        <t.icon className={cn('h-3 w-3', t.color)} />
                        {t.text}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-sm">
                    <span className="text-white/40">Need an account?</span>
                    <Link
                      className="font-semibold text-indigo-300 underline-offset-4 transition-colors hover:text-indigo-200 hover:underline"
                      to="/signup"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
