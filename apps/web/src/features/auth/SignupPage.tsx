import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Star, Users, Zap } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { BlurFade } from '../../components/magicui/blur-fade';
import { Particles } from '../../components/magicui/particles';
import { AnimatedGradientText } from '../../components/magicui/animated-gradient-text';
import { BorderBeam } from '../../components/magicui/border-beam';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { homePathForRole, useAuthStore } from '../../lib/auth-store';
import { signupSchema, type SignupForm } from '../../lib/schemas';
import type { AuthResponse } from '../../lib/types';
import { cn } from '../../lib/utils';

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: (values: SignupForm) =>
      apiData<AuthResponse>(api.post('/auth/signup', values)),
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast('Account created', 'success');
      navigate(homePathForRole(data.user.role));
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#050510]">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full bg-indigo-600/15 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
          <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
            }}
          />
          <div className="absolute left-0 right-0 top-[35%] h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        <Particles
          className="absolute inset-0 z-0"
          quantity={40}
          ease={80}
          color="#818cf8"
          size={0.5}
          staticity={40}
        />

        <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <aside className="relative hidden overflow-hidden px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <BlurFade delay={0.05} direction="up" offset={10}>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                    Roxiler System
                  </span>
                </div>
              </BlurFade>

              <BlurFade delay={0.14} direction="up" offset={14}>
                <h1 className="mt-10 max-w-sm font-display text-4xl font-extrabold leading-tight text-white">
                  Create your{' '}
                  <AnimatedGradientText
                    colorFrom="#818cf8"
                    colorTo="#22d3ee"
                    speed={1.2}
                    className="font-extrabold"
                  >
                    free account.
                  </AnimatedGradientText>
                </h1>
              </BlurFade>

              <BlurFade delay={0.26} direction="up" offset={10}>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
                  Browse the store directory and leave 1–5 star feedback. Store
                  owners and admins are invited separately.
                </p>
              </BlurFade>

              <BlurFade delay={0.36} direction="up" offset={8}>
                <div className="mt-8 space-y-3">
                  {[
                    { icon: Star, text: 'Rate stores with 1–5 star system', color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20' },
                    { icon: Shield, text: 'Secure role-based access control', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
                    { icon: Users, text: 'Join thousands of active reviewers', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br', item.bg)}>
                        <item.icon className={cn('h-4 w-4', item.color)} />
                      </div>
                      <span className="text-sm text-white/55">{item.text}</span>
                    </div>
                  ))}
                </div>
              </BlurFade>
            </div>

            <BlurFade delay={0.46} direction="up" offset={8}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-indigo-400/60">
                  Account type
                </p>
                <p className="mt-2 text-sm text-white/65">User · shopper access</p>
              </div>
            </BlurFade>
          </aside>

          {/* Right: form */}
          <section className="flex items-center justify-center px-4 py-10 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="relative w-full max-w-lg"
            >
              <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/8 via-transparent to-cyan-500/5 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#818cf8"
                  colorTo="#22d3ee"
                  borderWidth={1}
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-transparent" />

                <div className="relative">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
                    <span className="h-px w-5 bg-gradient-to-r from-indigo-500/60 to-transparent" />
                    Create account
                  </p>
                  <h2 className="mt-2.5 font-display text-[1.65rem] font-bold tracking-tight text-white">
                    Join as a user
                  </h2>
                  <p className="mt-1.5 text-sm text-white/40">
                    Use your real name (20–60 characters). Password needs upper, lower, and a special character.
                  </p>

                  <form
                    className="mt-7 space-y-4"
                    onSubmit={handleSubmit((v) => mutation.mutate(v))}
                  >
                    <Input
                      label="Name"
                      hint="20–60 characters"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                    <Input label="Address" error={errors.address?.message} {...register('address')} />
                    <Input
                      label="Password"
                      type="password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  {/* Trust badges */}
                  <div className="mt-5 flex items-center justify-center gap-4">
                    {[
                      { icon: Shield, text: 'Secure', color: 'text-emerald-400' },
                      { icon: Zap, text: 'Real-time', color: 'text-amber-400' },
                      { icon: CheckCircle2, text: 'Verified', color: 'text-cyan-400' },
                    ].map((t) => (
                      <span key={t.text} className="inline-flex items-center gap-1 text-[10px] font-medium text-white/35">
                        <t.icon className={cn('h-3 w-3', t.color)} />
                        {t.text}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-center text-sm text-white/40 border-t border-white/[0.06] pt-4">
                    Already have an account?{' '}
                    <Link
                      className="font-semibold text-indigo-300 underline-offset-4 transition-colors hover:text-indigo-200 hover:underline"
                      to="/login"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
