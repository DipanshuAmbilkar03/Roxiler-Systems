import { useState } from 'react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { PageTransition } from '../../components/PageTransition';
import { SegmentedControl } from '../../components/SegmentedControl';
import { StarRating } from '../../components/StarRating';
import { StatusDot } from '../../components/StatusDot';
import { StoreCard } from '../../components/StoreCard';
import { toast } from '../../components/Toast';
import { Users, Store, Star } from 'lucide-react';

export default function DesignSystemPage() {
  const [stars, setStars] = useState(3);
  const [segment, setSegment] = useState('a');
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <PageHeader
          eyebrow="Foundation"
          title="Roxiler System system"
          description="Warm paper surfaces, ink actions, amber rating accents, dense tables, and marketplace cards."
        />

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Buttons + status</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button onClick={() => toast('Toast fired', 'success')}>Toast</Button>
            <StatusDot tone="success" pulse label="Live" />
            <StatusDot tone="warning" label="Watch" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Identity</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name="Avery Stone" />
            <Avatar name="Jordan Lee" size="lg" />
            <Avatar name="Sam Rivera" size="sm" />
            <Badge>Default</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>
          <FilterBar
            title="Sample filters"
            actions={
              <SegmentedControl
                value={segment}
                onChange={setSegment}
                options={[
                  { value: 'a', label: 'All' },
                  { value: 'b', label: 'Open' },
                  { value: 'c', label: 'Closed' },
                ]}
              />
            }
          >
            <Input label="Query" placeholder="Typeâ€¦" />
          </FilterBar>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Store card</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StoreCard
              id="demo-1"
              name="Harbor Provisions"
              address="18 Dockside Ave, Lakeview"
              averageRating={4.6}
              ratingsCount={128}
              userRating={stars}
              onOpen={() => toast('Open store detail', 'info')}
            />
            <Card>
              <Input label="Sample field" placeholder="Dense form control" />
              <div className="mt-4">
                <StarRating value={stars} onChange={setStars} size="lg" />
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <AnimatedCounter value={128} label="Users" icon={Users} accent="brand" />
          <AnimatedCounter value={42} label="Stores" icon={Store} accent="sky" />
          <AnimatedCounter value={900} label="Ratings" icon={Star} accent="amber" />
        </section>

        <section>
          <DataTable
            dense
            columns={[
              { key: 'n', header: 'Name', sortable: true, render: (r) => r.n },
              { key: 'v', header: 'Value', render: (r) => r.v },
            ]}
            rows={[
              { n: 'Alpha', v: '1' },
              { n: 'Beta', v: '2' },
              { n: 'Gamma', v: '3' },
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

