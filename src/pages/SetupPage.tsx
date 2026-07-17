import { complianceSuggestions, industries } from '../data/constants';
import {
  payAsYouGoTier,
  resolveSentinelCommitmentTier,
  resolveSentinelRegionKey,
  sentinelCommitmentOptions,
  sentinelRegionOptions,
  sentinelRegionPricing,
} from '../data/sentinelPricing';
import { useCostSummary, useEstimatorStore } from '../store/useEstimatorStore';
import { ComplianceSelector } from '../components/ComplianceSelector';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const infraFields = [
  ['awsAccounts', 'AWS Accounts'],
  ['azureSubscriptions', 'Azure Subscriptions'],
  ['gcpProjects', 'GCP Projects'],
  ['firewalls', 'Firewalls'],
  ['servers', 'Servers'],
  ['devices', 'Devices'],
  ['vms', 'VMs'],
] as const;

export function SetupPage() {
  const setup = useEstimatorStore((s) => s.setup);
  const setSetupValue = useEstimatorStore((s) => s.setSetupValue);
  const compliance = useEstimatorStore((s) => s.compliance);
  const selections = useEstimatorStore((s) => s.selections);
  const toggleSource = useEstimatorStore((s) => s.toggleSource);
  const summary = useCostSummary();
  const selectedRegionKey = resolveSentinelRegionKey(setup.region);
  const selectedRegionPricing = selectedRegionKey ? sentinelRegionPricing[selectedRegionKey] : null;
  const selectedCommitmentTier = resolveSentinelCommitmentTier(setup.commitmentTier);

  const applyCompliance = () => {
    const ids = new Set<string>();
    compliance.forEach((item) => (complianceSuggestions[item] || []).forEach((id) => ids.add(id)));
    ids.forEach((id) => toggleSource(id, true));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Organization</CardTitle>
          <p className="mt-1 text-xs text-slate-400">Model users, devices, and baseline environment variables.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-400">
            Number of Users
            <Input type="number" value={setup.users} onChange={(e) => setSetupValue('users', Number(e.target.value))} />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            Number of Endpoints
            <Input type="number" value={setup.endpoints} onChange={(e) => setSetupValue('endpoints', Number(e.target.value))} />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            Industry
            <Select value={setup.industry} onChange={(e) => setSetupValue('industry', e.target.value)}>
              <option value=''>Select industry</option>{industries.map((industry) => <option key={industry}>{industry}</option>)}
            </Select>
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            Data Lake Queries / day
            <Input type="number" value={setup.queriesPerDay} onChange={(e) => setSetupValue('queriesPerDay', Number(e.target.value))} />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="pb-3"><CardTitle>Retention and Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-xs text-slate-400">Analytics retention (months)<Input type="number" value={setup.analyticsRetentionMonths} onChange={(e) => setSetupValue('analyticsRetentionMonths', Number(e.target.value))} /></label>
              <label className="space-y-1 text-xs text-slate-400">Data Lake retention (months)<Input type="number" value={setup.dataLakeRetentionMonths} onChange={(e) => setSetupValue('dataLakeRetentionMonths', Number(e.target.value))} /></label>
              <label className="space-y-1 text-xs text-slate-400">Basic retention (days)<Input type="number" value={setup.basicRetentionDays} onChange={(e) => setSetupValue('basicRetentionDays', Number(e.target.value))} /></label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-400">
                Azure Region Pricing
                <Select value={selectedRegionKey} onChange={(e) => setSetupValue('region', e.target.value)}>
                  <option value=''>Select region</option>{sentinelRegionOptions.map((region) => <option key={region.value} value={region.value}>{region.analyticsPaygPerGb ? `${region.label} ($${region.analyticsPaygPerGb.toFixed(2)}/GB PAYG)` : `${region.label} (commitment pricing only)`}</option>)}
                </Select>
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Commitment Tier
                <Select value={selectedCommitmentTier} onChange={(e) => setSetupValue('commitmentTier', e.target.value)}>
                  <option value=''>Select commitment tier</option>{sentinelCommitmentOptions.map((tier) => {
                    if (tier === payAsYouGoTier) {
                      return <option key={tier} value={tier} disabled={selectedRegionPricing ? !selectedRegionPricing.analyticsPaygPerGb : false}>{selectedRegionPricing && !selectedRegionPricing.analyticsPaygPerGb ? `${tier} (not published for selected region)` : tier}</option>;
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
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle>Data Grants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2">
              <div>
                <p className="text-sm text-white">Microsoft 365 E5 Security Data Grant</p>
                <p className="text-xs text-slate-400">5MB per user/day free ingestion</p>
              </div>
              <Switch checked={setup.e5GrantEnabled} onCheckedChange={(v) => setSetupValue('e5GrantEnabled', Boolean(v))} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-red-500/25 bg-slate-950/70 px-3 py-2">
              <div>
                <p className="text-sm text-white">Defender for Servers Plan 2</p>
                <p className="text-xs text-slate-400">500MB per server/day free ingestion</p>
              </div>
              <Switch checked={setup.defenderServersGrantEnabled} onCheckedChange={(v) => setSetupValue('defenderServersGrantEnabled', Boolean(v))} />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-300">
              Free ingestion applied: <span className="font-semibold text-red-300">{summary.freeGrantDailyGb.toFixed(2)} GB/day</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>Infrastructure Workloads</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {infraFields.map(([key, label]) => (
            <label key={key} className="space-y-1 text-xs text-slate-400">
              {label}
              <Input type="number" value={setup[key]} onChange={(e) => setSetupValue(key, Number(e.target.value))} />
            </label>
          ))}
        </CardContent>
      </Card>

      <ComplianceSelector />

      <Card>
        <CardHeader className="pb-3"><CardTitle>Recommended Log Sources</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-sm text-slate-300">Enable suggested connectors from selected compliance frameworks.</p>
            <Button variant="outline" onClick={applyCompliance}>Apply Recommendations</Button>
          </div>
          <p className="text-xs text-slate-400">
            Snapshot: {Object.values(selections).filter((s) => s.selected).length} sources selected, {summary.dailyIngestion.toFixed(2)} GB/day ingestion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
