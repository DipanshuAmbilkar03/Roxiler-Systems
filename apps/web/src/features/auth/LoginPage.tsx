import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Star, ShieldCheck, Store, Users } from 'lucide-react';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { toast } from '../../components/Toast';
import {
  AnimatedGradientText,
  BorderBeam,
  Marquee,
  Particles,
  ShimmerButton,
} from '../../components/magicui';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { homePathForRole, useAuthStore } from '../../lib/auth-store';
import { loginSchema, type LoginForm } from '../../lib/schemas';
import type { AuthResponse } from '../../lib/types';

const highlights = [
  { icon: Users, text: 'Role-based dashboards' },
  { icon: Store, text: 'Live searchable store directory' },
  { icon: ShieldCheck, text: 'Secure auth for every role' },
];

const marqueeItems = [
  'Honest store ratings',
  'Admin analytics',
  'Owner insights',
  'Secure sessions',
  'Searchable directory',
  '1–5 star feedback',
];

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
      toast('Welcome back', 'success');
      navigate(homePathForRole(data.user.role));
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <PageTransition>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-60" />
        <Particles
          className="absolute inset-0"
          quantity={48}
          ease={70}
          color="#6366f1"
          size={0.5}
        />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-glow backdrop-blur-2xl lg:grid-cols-2"
        >
          <BorderBeam
            size={90}
            duration={8}
            colorFrom="#4f46e5"
            colorTo="#0ea5e9"
            borderWidth={1.5}
          />
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-indigo-600 to-sky-500 p-10 text-white lg:flex lg:flex-col lg:justify-between"
          >
            <Particles
              className="absolute inset-0 opacity-40"
              quantity={28}
              ease={80}
              color="#ffffff"
              size={0.4}
            />
            <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Store Rating Platform
              </div>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight">
                Rate stores.
                <br />
                <AnimatedGradientText
                  colorFrom="#ffffff"
                  colorTo="#bae6fd"
                  speed={1.2}
                  className="font-extrabold"
                >
                  Discover quality.
                </AnimatedGradientText>
              </h1>
              <p className="mt-4 max-w-sm text-sm text-white/80">
                A clean workspace for admins, owners, and shoppers to manage and
                share honest store ratings.
              </p>
            </div>
            <div className="relative space-y-3">
              {highlights.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-white/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 py-1 backdrop-blur">
                <Marquee pauseOnHover className="[--duration:28s] [--gap:1.25rem]">
                  {marqueeItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                    >
                      {item}
                    </span>
                  ))}
                </Marquee>
              </div>
            </div>
          </motion.div>

          <div className="relative p-6 sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Star className="h-3.5 w-3.5 fill-brand-600" />
                Store Rating
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to continue to your dashboard</p>
            <form
              className="mt-8 space-y-4"
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
              <ShimmerButton
                type="submit"
                className="w-full shadow-glow"
                borderRadius="0.75rem"
                background="linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #0ea5e9 100%)"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Signing in…' : 'Sign in'}
              </ShimmerButton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              No account?{' '}
              <Link className="font-semibold text-brand-700 hover:underline" to="/signup">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
