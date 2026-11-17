import { useState } from 'react';
import {
  Star,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Clock,
  Award,
  Search,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Modal,
  Spinner,
  EmptyState,
} from '../components/ui';
import PageContainer from '../components/layout/PageContainer';

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          SkillBridge Component Showcase
        </h1>
        <p className="mt-2 text-slate-500">
          Visual inspection of all reusable UI components and the design system.
        </p>
      </div>

      {/* ───── Buttons ───── */}
      <Section title="Buttons">
        <div className="space-y-4">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>

          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>

          <Row label="States">
            <Button loading={loading} onClick={handleLoadingDemo}>
              {loading ? 'Saving…' : 'Click for Loading'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" loading>
              Loading Outline
            </Button>
          </Row>
        </div>
      </Section>

      {/* ───── Inputs ───── */}
      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Full Name"
            name="name"
            placeholder="Jane Doe"
            helperText="As it appears on your ID"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
          />
          <Input
            label="With Error"
            name="errorDemo"
            placeholder="Invalid input"
            error="This field is required"
            defaultValue=""
          />
          <Input
            label="Disabled"
            name="disabled"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </Section>

      {/* ───── Selects ───── */}
      <Section title="Selects">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Skill Level"
            name="level"
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ]}
            helperText="Choose your proficiency"
          />
          <Select
            label="With Error"
            name="errorSelect"
            options={['Option A', 'Option B']}
            error="Please select an option"
          />
          <Select
            label="Disabled"
            name="disabledSelect"
            options={['Locked']}
            disabled
          />
        </div>
      </Section>

      {/* ───── Cards ───── */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">Card with Header</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-600">
                This card demonstrates header, body, and footer composition.
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Zap className="h-5 w-5 text-brand-indigo" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Feature Card</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    A compact card with an icon, title, and description.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-brand-indigo">1,247</p>
                  <p className="text-sm text-slate-500">Active Freelancers</p>
                </div>
                <div className="rounded-full bg-teal-100 p-3">
                  <Shield className="h-6 w-6 text-brand-teal" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ───── Badges ───── */}
      <Section title="Badges">
        <Row label="Variants">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="indigo" icon={Star}>Indigo</Badge>
          <Badge variant="teal" icon={CheckCircle}>Verified</Badge>
          <Badge variant="amber" icon={AlertTriangle}>Pending</Badge>
          <Badge variant="red">Urgent</Badge>
        </Row>
        <Row label="Use Cases" className="mt-3">
          <Badge variant="teal" icon={CheckCircle}>Available</Badge>
          <Badge variant="indigo" icon={Award}>Top Rated</Badge>
          <Badge variant="amber" icon={Clock}>In Progress</Badge>
          <Badge variant="neutral">React</Badge>
          <Badge variant="neutral">Node.js</Badge>
          <Badge variant="neutral">Figma</Badge>
        </Row>
      </Section>

      {/* ───── Modal ───── */}
      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Action"
        >
          <p className="text-sm text-slate-600">
            This is an accessible modal dialog with keyboard Escape close,
            backdrop click dismiss, and focus trapping.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </Section>

      {/* ───── Spinner ───── */}
      <Section title="Spinner">
        <Row label="Sizes">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </Row>
      </Section>

      {/* ───── EmptyState ───── */}
      <Section title="Empty State">
        <Card>
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={<Button variant="outline" size="sm">Clear Filters</Button>}
          />
        </Card>
      </Section>

      {/* ───── Typography / Colors ───── */}
      <Section title="Design System: Colors & Typography">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Brand Colors
              </h3>
              <div className="space-y-2">
                <ColorSwatch color="#3730A3" label="Deep Indigo — Primary" />
                <ColorSwatch color="#2563EB" label="Cobalt Blue — Links" />
                <ColorSwatch color="#0D9488" label="Teal — Verified/Available" />
                <ColorSwatch color="#F3F2EF" label="Canvas Background" dark />
                <ColorSwatch color="#FFFFFF" label="Card White" dark />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Typography (Inter)
              </h3>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-slate-900">Heading 1 — Bold 30px</p>
                <p className="text-2xl font-semibold text-slate-900">Heading 2 — Semi 24px</p>
                <p className="text-xl font-semibold text-slate-800">Heading 3 — Semi 20px</p>
                <p className="text-base text-slate-700">Body — Regular 16px</p>
                <p className="text-sm text-slate-500">Small — Regular 14px</p>
                <p className="text-xs text-slate-400">Caption — Regular 12px</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>
    </PageContainer>
  );
}

/* ── Helper Components ── */

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-slate-800 border-b border-card-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ColorSwatch({ color, label, dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 rounded-md border border-slate-200"
        style={{ backgroundColor: color }}
      />
      <div>
        <span className="text-sm font-mono text-slate-600">{color}</span>
        <span className={['ml-2 text-sm', dark ? 'text-slate-500' : 'text-slate-500'].join(' ')}>
          {label}
        </span>
      </div>
    </div>
  );
}
