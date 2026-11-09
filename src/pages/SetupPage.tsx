import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { complianceSuggestions, compliances, industries } from '../data/constants';
import {
  payAsYouGoTier,
  resolveSentinelCommitmentTier,
  resolveSentinelRegionKey,
  sentinelCommitmentOptions,
  sentinelRegionOptions,
  sentinelRegionPricing,
} from '../data/sentinelPricing';
import { allSources, useCostSummary, useEstimatorStore } from '../store/useEstimatorStore';
import { Card } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { NumberField } from '../components/ui/number-field';
import { cn, formatCurrency } from '../lib/utils';

const infraFields = [
  ['awsAccounts', 'AWS accounts'],
  ['azureSubscriptions', 'Azure subscriptions'],
  ['gcpProjects', 'GCP projects'],
  ['firewalls', 'Firewalls'],
  ['devices', 'Devices'],
  ['vms', 'VMs'],
] as const;

/** Numbered section card, same rhythm as the noxcipher.site "steps". */
function Section({ step, title, hint, aside, children }: { step: string; title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] text-nox-accent">{step}</span>
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
            {hint ? <p className="mt-0.5 text-xs text-nox-faint">{hint}</p> : null}
          </div>
        </div>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-nox-muted">
      {label}
      {children}
    </label>
  );
}

export function SetupPage() {
  const setup = useEstimatorStore((s) => s.setup);
  const setSetupValue = useEstimatorStore((s) => s.setSetupValue);
  const compliance = useEstimatorStore((s) => s.compliance);
  const setCompliance = useEstimatorStore((s) => s.setCompliance);
  const selections = useEstimatorStore((s) => s.selections);
  const toggleSource = useEstimatorStore((s) => s.toggleSource);
  const setActiveTab = useEstimatorStore((s) => s.setActiveTab);
  const summary = useCostSummary();
  const [infraOpen, setInfraOpen] = useState(false);

  const selectedRegionKey = resolveSentinelRegionKey(setup.region);
  const selectedRegionPricing = selectedRegionKey ? sentinelRegionPricing[selectedRegionKey] : null;
  const selectedCommitmentTier = resolveSentinelCommitmentTier(setup.commitmentTier);

  // Recommended sources from the chosen frameworks that aren't selected yet
  const pendingRecommendations = useMemo(() => {
    const ids = new Set<string>();
    compliance.forEach((item) => (complianceSuggestions[item] || []).forEach((id) => ids.add(id)));
    return [...ids].filter((id) => selections[id] && !selections[id].selected);
  }, [compliance, selections]);

  const recommendationNames = pendingRecommendations
    .map((id) => allSources.find((s) => s.id === id)?.product)
    .filter(Boolean) as string[];

  const toggleCompliance = (item: string) =>
    setCompliance(compliance.includes(item) ? compliance.filter((x) => x !== item) : [...compliance, item]);

  const applyRecommendations = () => pendingRecommendations.forEach((id) => toggleSource(id, true));

  const infraFilled = infraFields.filter(([key]) => Number(setup[key]) > 0).length;

  const estimateRows = [
    { label: 'Daily ingestion', value: `${summary.dailyIngestion.toFixed(2)} GB` },
    { label: 'Free from grants', value: `${summary.appliedGrantDailyGb > 0 ? '−' : ''}${summary.appliedGrantDailyGb.toFixed(2)} GB`, accent: summary.appliedGrantDailyGb > 0 },
    { label: 'Effective price / GB', value: `$${summary.effectivePricePerGb.toFixed(2)}` },
    { label: 'Sources selected', value: String(summary.selectedSources) },
  ];

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {/* 01 — Pricing */}
        <Section step="01" title="Pricing" hint="Region and commitment tier set your price per GB.">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Azure region">
              <Select value={selectedRegionKey} onChange={(e) => setSetupValue('region', e.target.value)}>
                <option value="">Select region</option>
                {sentinelRegionOptions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.analyticsPaygPerGb ? `${region.label} ($${region.analyticsPaygPerGb.toFixed(2)}/GB PAYG)` : `${region.label} (commitment pricing only)`}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Commitment tier">
              <Select value={selectedCommitmentTier} onChange={(e) => setSetupValue('commitmentTier', e.target.value)}>
                <option value="">Select commitment tier</option>
                {sentinelCommitmentOptions.map((tier) => {
                  if (tier === payAsYouGoTier) {
                    return (
                      <option key={tier} value={tier} disabled={selectedRegionPricing ? !selectedRegionPricing.analyticsPaygPerGb : false}>
                        {selectedRegionPricing && !selectedRegionPricing.analyticsPaygPerGb ? `${tier} (not published for selected region)` : tier}
                      </option>
                    );
                  }
                  const dailyPrice = selectedRegionPricing?.commitments[tier];
                  const dailyCapacity = Number.parseInt(tier, 10);
                  const effectivePrice = dailyPrice ? dailyPrice / dailyCapacity : null;
                  return (
                    <option key={tier} value={tier} disabled={!dailyPrice}>
                      {dailyPrice ? `${tier} ($${dailyPrice.toFixed(2)}/day, $${effectivePrice?.toFixed(2)}/GB)` : `${tier} (not published for selected region)`}
                    </option>
                  );
                })}
              </Select>
            </Field>
          </div>
        </Section>

        {/* 02 — Free data grants (count lives inside each grant) */}
        <Section
          step="02"
          title="Free data grants"
          hint="Turn on the licences you own to offset ingestion."
          aside={
            <span className="shrink-0 whitespace-nowrap rounded-md border border-nox-accent/25 bg-nox-accent/10 px-2 py-1 font-mono text-[11px] text-nox-accent">
              {summary.freeGrantDailyGb.toFixed(2)} GB/day free
            </span>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                key: 'e5GrantEnabled' as const,
                title: 'Microsoft 365 E5',
                rate: '5 MB per user / day',
                field: <NumberField label="Users" unit="users" step={10} value={setup.users} onChange={(v) => setSetupValue('users', v)} />,
              },
              {
                key: 'defenderServersGrantEnabled' as const,
                title: 'Defender for Servers P2',
                rate: '500 MB per server / day',
                field: <NumberField label="Servers" unit="servers" value={setup.servers} onChange={(v) => setSetupValue('servers', v)} />,
              },
            ].map((g) => (
              <div
                key={g.key}
                className={cn(
                  'rounded-xl border p-4 transition',
                  setup[g.key] ? 'border-nox-accent/30 bg-nox-accent/[0.04]' : 'border-white/[0.08] bg-nox-panel',
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{g.title}</p>
                    <p className="font-mono text-[11px] text-nox-faint">{g.rate}</p>
                  </div>
                  <Switch checked={setup[g.key]} onCheckedChange={(v) => setSetupValue(g.key, Boolean(v))} />
                </div>
                {g.field}
              </div>
            ))}
          </div>
        </Section>

        {/* 03 — Environment & retention */}
        <Section step="03" title="Environment and retention">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField label="Endpoints" unit="devices" step={10} value={setup.endpoints} onChange={(v) => setSetupValue('endpoints', v)} />
            <Field label="Industry">
              <Select value={setup.industry} onChange={(e) => setSetupValue('industry', e.target.value)}>
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry}>{industry}</option>
                ))}
              </Select>
            </Field>
            <NumberField label="Data Lake queries" unit="/day" value={setup.queriesPerDay} onChange={(v) => setSetupValue('queriesPerDay', v)} />
            <NumberField label="Analytics retention" unit="months" value={setup.analyticsRetentionMonths} onChange={(v) => setSetupValue('analyticsRetentionMonths', v)} />
            <NumberField label="Data Lake retention" unit="months" value={setup.dataLakeRetentionMonths} onChange={(v) => setSetupValue('dataLakeRetentionMonths', v)} />
            <NumberField label="Basic retention" unit="days" value={setup.basicRetentionDays} onChange={(v) => setSetupValue('basicRetentionDays', v)} />
          </div>

          {/* Infrastructure counts tucked into a collapsible group */}
          <div className="mt-4 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              aria-expanded={infraOpen}
              onClick={() => setInfraOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/[0.02]"
            >
              <span className="font-medium">Infrastructure workloads</span>
              <span className="flex items-center gap-2 font-mono text-[11px] text-nox-faint">
                {infraFilled ? `${infraFilled} of ${infraFields.length} set` : 'optional'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', infraOpen && 'rotate-180')} />
              </span>
            </button>
            {infraOpen ? (
              <div className="grid gap-3 border-t border-white/[0.08] p-4 sm:grid-cols-2 lg:grid-cols-3">
                {infraFields.map(([key, label]) => (
                  <NumberField key={key} label={label} value={setup[key]} onChange={(v) => setSetupValue(key, v)} />
                ))}
              </div>
            ) : null}
          </div>
        </Section>

        {/* 04 — Compliance → recommended sources */}
        <Section step="04" title="Compliance" hint="Pick frameworks to get recommended log sources.">
          <div className="flex flex-wrap gap-2">
            {compliances.map((item) => {
              const on = compliance.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCompliance(item)}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-lg border px-3 font-mono text-[12px] transition',
                    on ? 'border-nox-accent/40 bg-nox-accent/10 text-nox-accent' : 'border-white/[0.1] text-nox-muted hover:border-white/20 hover:text-nox-text',
                  )}
                >
                  {on ? <Check className="h-3.5 w-3.5" /> : null}
                  {item}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-nox-panel px-4 py-3">
            <p className="min-w-0 flex-1 text-sm text-nox-muted">
              {compliance.length === 0
                ? 'No frameworks selected.'
                : pendingRecommendations.length === 0
                  ? 'All recommended sources are already selected.'
                  : (
                    <>
                      <span className="text-nox-text">{recommendationNames.slice(0, 3).join(', ')}</span>
                      {recommendationNames.length > 3 ? ` +${recommendationNames.length - 3} more` : ''}
                    </>
                  )}
            </p>
            <Button size="sm" disabled={pendingRecommendations.length === 0} onClick={applyRecommendations}>
              Add {pendingRecommendations.length || ''} recommended source{pendingRecommendations.length === 1 ? '' : 's'}
            </Button>
          </div>
        </Section>
      </div>

      {/* Sticky live estimate */}
      <aside className="xl:sticky xl:top-[136px]">
        <Card className="overflow-hidden">
          <div className="relative border-b border-white/[0.08] p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(61,255,162,0.14),transparent_65%)]" />
            <p className="nox-label flex items-center gap-2 text-[10.5px]">
              <span className="live-dot" /> Your estimate
            </p>
            <p className="mt-2 text-[34px] font-semibold tabular-nums tracking-[-0.03em] text-nox-accent">
              {formatCurrency(summary.discountedMonthlyCost)}
              <span className="ml-1 font-mono text-xs font-medium tracking-normal text-nox-muted">/mo</span>
            </p>
            <p className="font-mono text-[11px] text-nox-faint">{formatCurrency(summary.yearlyCost)} per year</p>
          </div>
          <div className="px-5 py-2 text-sm">
            {estimateRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-white/[0.06] py-2.5 last:border-b-0">
                <span className="text-nox-muted">{row.label}</span>
                <span className={cn('font-mono text-[13px] tabular-nums', row.accent && 'text-nox-accent')}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] p-4">
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('Sources')}>
              Next: choose log sources <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}
