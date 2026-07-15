import { useState } from 'react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';

export default function DesignSystemPage() {
  const [stars, setStars] = useState(3);
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-bold">Design system</h1>
          <p className="text-slate-500">Shared components demo</p>
        </div>
        <section className="space-y-3">
          <h2 className="font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button onClick={() => toast('Toast fired', 'success')}>Toast</Button>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold">Input + StarRating</h2>
          <Input label="Sample" placeholder="Type…" />
          <StarRating value={stars} onChange={setStars} size="lg" />
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          <AnimatedCounter value={128} label="Users" />
          <AnimatedCounter value={42} label="Stores" />
          <AnimatedCounter value={900} label="Ratings" />
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
