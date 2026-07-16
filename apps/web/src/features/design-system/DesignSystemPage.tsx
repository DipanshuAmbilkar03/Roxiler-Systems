import { useState } from 'react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { PageTransition } from '../../components/PageTransition';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';
import {
  AnimatedGradientText,
  BorderBeam,
  MagicCard,
  Marquee,
  Particles,
  ShimmerButton,
  ShineBorder,
} from '../../components/magicui';
import { Users, Store, Star } from 'lucide-react';

export default function DesignSystemPage() {
  const [stars, setStars] = useState(3);
  return (
    <PageTransition>
      <div className="relative mx-auto max-w-4xl space-y-8 overflow-hidden px-4 py-10">
        <Particles className="absolute inset-0 opacity-30" quantity={30} color="#6366f1" />
        <PageHeader
          eyebrow="Foundation"
          title="Design system"
          description="Shared UI primitives used across the Store Rating Platform — including Magic UI motion accents."
        />
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button onClick={() => toast('Toast fired', 'success')}>Toast</Button>
            <ShimmerButton
              borderRadius="0.75rem"
              background="linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)"
              onClick={() => toast('Shimmer CTA', 'info')}
            >
              Shimmer CTA
            </ShimmerButton>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">
            <AnimatedGradientText>Magic UI accents</AnimatedGradientText>
          </h2>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
            <BorderBeam size={80} duration={8} colorFrom="#4f46e5" colorTo="#0ea5e9" />
            <ShineBorder shineColor={['#4f46e5', '#0ea5e9', '#a855f7']} duration={12} />
            <p className="text-sm text-slate-600">Border beam + shine border on a panel.</p>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 py-2">
              <Marquee pauseOnHover className="[--duration:24s]">
                {['Ratings', 'Stores', 'Owners', 'Admins', 'Feedback'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
          <MagicCard className="rounded-2xl" gradientFrom="#6366f1" gradientTo="#0ea5e9">
            <div className="p-5 text-sm text-slate-600">Hover this Magic Card for a spotlight border.</div>
          </MagicCard>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">Input + StarRating</h2>
          <Card>
            <Input label="Sample" placeholder="Type…" />
            <div className="mt-4">
              <StarRating value={stars} onChange={setStars} size="lg" />
            </div>
          </Card>
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          <AnimatedCounter value={128} label="Users" icon={Users} accent="brand" />
          <AnimatedCounter value={42} label="Stores" icon={Store} accent="sky" />
          <AnimatedCounter value={900} label="Ratings" icon={Star} accent="amber" />
        </section>
        <section>
          <DataTable
            columns={[
              { key: 'n', header: 'Name', sortable: true, render: (r) => r.n },
              { key: 'v', header: 'Value', render: (r) => r.v },
            ]}
            rows={[
              { n: 'Alpha', v: '1' },
              { n: 'Beta', v: '2' },
            ]}
            rowKey={(r) => r.n}
            sortBy="n"
            order="asc"
          />
        </section>
      </div>
    </PageTransition>
  );
}
