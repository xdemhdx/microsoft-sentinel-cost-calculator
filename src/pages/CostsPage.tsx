import { Download, DollarSign, LineChart, PiggyBank, Gauge } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import { CostSummaryCard } from '../components/CostSummaryCard';
import { ScenarioComparison } from '../components/ScenarioComparison';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn, formatCurrency } from '../lib/utils';
import { useCostSummary } from '../store/useEstimatorStore';

// Analytics = warn, Basic = blue, Data Lake = lilac (matches tier colours elsewhere)
const tierColors = ['#ffb547', '#7fb8ff', '#b49cff'];

const tooltipProps = {
  cursor: { fill: 'rgba(255,255,255,0.03)' },
  contentStyle: {
    background: '#0e1011',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 10,
    fontFamily: "'Geist Mono', ui-monospace, monospace",
    fontSize: 12,
    color: '#ededea',
    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.9)',
  },
  itemStyle: { color: '#ededea' },
  labelStyle: { color: '#8b9094' },
  formatter: (value: unknown) => formatCurrency(Number(value)),
};

const axisTick = { fill: '#5b6064', fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace" };

function Row({ label, value, tone }: { label: string; value: string; tone?: 'accent' | 'warn' | 'blue' | 'lilac' | 'grant' }) {
  const dot = { accent: 'bg-nox-accent', warn: 'bg-nox-warn', blue: 'bg-nox-blue', lilac: 'bg-nox-lilac', grant: 'bg-nox-accent' };
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 last:border-b-0',
        tone === 'grant' && 'text-nox-accent',
      )}
    >
      <span className="flex items-center gap-2.5 text-nox-muted">
        {tone ? <i className={cn('h-2 w-2 rounded-[2px]', dot[tone])} /> : <i className="h-2 w-2" />}
        <span className={cn(tone === 'grant' && 'text-nox-accent')}>{label}</span>
      </span>
      <span className="font-mono text-[13px] tabular-nums">{value}</span>
    </div>
  );
}

export function CostsPage() {
  const summary = useCostSummary();

  const tierData = [
    { name: 'Analytics', value: summary.tierMonthlyCost.analytics },
    { name: 'Basic', value: summary.tierMonthlyCost.basic },
    { name: 'Data Lake', value: summary.tierMonthlyCost.datalake },
  ];
  const tierTotal = tierData.reduce((acc, t) => acc + t.value, 0);
  const pieData = tierData.map((t, i) => ({ ...t, color: tierColors[i] })).filter((t) => t.value > 0);

  const effectivePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(summary.effectivePricePerGb);

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Microsoft Sentinel Executive Report', 14, 16);
    doc.setFontSize(11);
    doc.text(`Daily ingestion: ${summary.dailyIngestion.toFixed(2)} GB/day`, 14, 28);
    doc.text(`Monthly cost: ${formatCurrency(summary.discountedMonthlyCost)}`, 14, 36);
    doc.text(`Yearly estimate: ${formatCurrency(summary.yearlyCost)}`, 14, 44);
    doc.text(`Applied grant savings: ${formatCurrency(summary.freeGrantSavingsMonthly)}`, 14, 52);
    doc.text(`Defender for Servers P2 licenses: ${formatCurrency(summary.serverLicenseMonthlyCost)}`, 14, 60);
    doc.text('Optimization Recommendations:', 14, 72);
    doc.text('- Move high-volume DNS/proxy logs to Basic/Data Lake.', 16, 80);
    doc.text('- Apply DCR filtering for duplicate events.', 16, 87);
    doc.text('- Validate DfS credits apply only to eligible server logs.', 16, 94);
    doc.save('sentinel-executive-report.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CostSummaryCard accent title="Monthly cost" value={formatCurrency(summary.discountedMonthlyCost)} hint="All-in, after grants" icon={<DollarSign className="h-4 w-4" />} />
        <CostSummaryCard title="Yearly estimate" value={formatCurrency(summary.yearlyCost)} hint="12 × monthly" icon={<LineChart className="h-4 w-4" />} />
        <CostSummaryCard title="Grant savings" value={formatCurrency(summary.freeGrantSavingsMonthly)} hint="Per month" icon={<PiggyBank className="h-4 w-4" />} />
        <CostSummaryCard title="Effective price / GB" value={effectivePrice} hint="After grants and commitments" icon={<Gauge className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Daily ingestion</CardTitle>
            <span className="nox-label text-[10.5px]">GB / day</span>
          </CardHeader>
          <CardContent className="text-sm">
            <Row label="Total ingestion" value={`${summary.dailyIngestion.toFixed(2)} GB`} />
            <Row label="Analytics" tone="warn" value={`${summary.tierDaily.analytics.toFixed(2)} GB`} />
            <Row label="Basic" tone="blue" value={`${summary.tierDaily.basic.toFixed(2)} GB`} />
            <Row label="Data Lake" tone="lilac" value={`${summary.tierDaily.datalake.toFixed(2)} GB`} />
            <Row label="Applied free grant" tone="grant" value={`−${summary.appliedGrantDailyGb.toFixed(2)} GB`} />
            <div className="mt-3 flex items-center justify-between rounded-lg border border-nox-accent/25 bg-nox-accent/[0.06] px-3 py-2.5">
              <span className="text-nox-text">Billable analytics</span>
              <span className="font-mono text-[13px] font-medium tabular-nums text-nox-accent">
                {summary.effectiveAnalyticsDailyGb.toFixed(2)} GB/day
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Grants and licences</CardTitle>
            <span className="nox-label text-[10.5px]">Monthly</span>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
              <span className="nox-label text-[10px] text-nox-faint">Potential free grant</span>
              <p className="mt-1 font-mono text-lg tabular-nums">{summary.freeGrantDailyGb.toFixed(2)} <span className="text-xs text-nox-muted">GB/day</span></p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
              <span className="nox-label text-[10px] text-nox-faint">Applied free grant</span>
              <p className="mt-1 font-mono text-lg tabular-nums text-nox-accent">{summary.appliedGrantDailyGb.toFixed(2)} <span className="text-xs text-nox-muted">GB/day</span></p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
              <span className="nox-label text-[10px] text-nox-faint">Data lake queries</span>
              <p className="mt-1 font-mono text-lg tabular-nums">{formatCurrency(summary.dataLakeQueryMonthlyCost)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
              <span className="nox-label text-[10px] text-nox-faint">DfS P2 licences</span>
              <p className="mt-1 font-mono text-lg tabular-nums">{formatCurrency(summary.serverLicenseMonthlyCost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Cost per tier</CardTitle>
            <div className="flex flex-wrap gap-3 font-mono text-[11px] text-nox-muted">
              {tierData.map((t, i) => (
                <span key={t.name} className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-[2px]" style={{ background: tierColors[i] }} />
                  {t.name}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Track ring so the chart reads correctly when nothing is billable yet */}
                <Pie data={[{ value: 1 }]} dataKey="value" innerRadius="62%" outerRadius="88%" fill="rgba(255,255,255,0.05)" stroke="none" isAnimationActive={false} tooltipType="none" />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={pieData.length > 1 ? 2 : 0}
                  stroke="none"
                >
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="nox-label text-[10px] text-nox-faint">Ingestion / mo</span>
              <span className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.03em]">{formatCurrency(tierTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Monthly tier breakdown</CardTitle>
            <span className="nox-label text-[10.5px]">USD</span>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => formatCurrency(Number(v))} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
                  {tierData.map((_, index) => <Cell key={index} fill={tierColors[index % tierColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 lg:px-6">
          <div>
            <CardTitle>Monthly invoice estimate</CardTitle>
            <p className="mt-0.5 font-mono text-[11px] text-nox-faint">{summary.invoiceRows.length} line items</p>
          </div>
          <Button variant="secondary" size="sm" onClick={generateReport}>
            <Download className="h-3.5 w-3.5" />
            Executive report (PDF)
          </Button>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full text-left font-mono text-[12px]">
            <thead className="sticky top-0 z-10 bg-nox-surface text-nox-faint">
              <tr className="border-b border-white/[0.08]">
                <th className="px-5 py-2.5 font-medium lg:px-6">Source</th>
                <th className="px-3 py-2.5 font-medium">Tier</th>
                <th className="px-3 py-2.5 text-right font-medium">Daily GB</th>
                <th className="px-5 py-2.5 text-right font-medium lg:px-6">Monthly</th>
              </tr>
            </thead>
            <tbody className="text-[#c3c7c5]">
              {summary.invoiceRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center font-sans text-sm text-nox-muted lg:px-6">
                    No billable sources yet. Pick some on the Sources tab.
                  </td>
                </tr>
              ) : null}
              {summary.invoiceRows.slice(0, 120).map((row) => (
                <tr key={row.id} className="border-b border-white/[0.05] transition hover:bg-white/[0.02]">
                  <td className="px-5 py-2.5 font-sans text-[13px] text-nox-text lg:px-6">{row.source}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'rounded-[5px] px-1.5 py-0.5 text-[11px] capitalize',
                        row.tier === 'analytics' && 'bg-nox-warn/10 text-nox-warn',
                        row.tier === 'basic' && 'bg-nox-blue/10 text-nox-blue',
                        row.tier === 'datalake' && 'bg-nox-lilac/10 text-nox-lilac',
                      )}
                    >
                      {row.tier === 'datalake' ? 'data lake' : row.tier}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.dailyGb.toFixed(2)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums lg:px-6">{formatCurrency(row.monthlyCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-nox-muted">
              <tr className="border-t border-white/[0.14]">
                <td className="px-5 py-2.5 lg:px-6" colSpan={3}>Subtotal</td>
                <td className="px-5 py-2.5 text-right tabular-nums text-nox-text lg:px-6">{formatCurrency(summary.invoiceSubtotalMonthly)}</td>
              </tr>
              <tr className="border-t border-white/[0.05] text-nox-accent">
                <td className="px-5 py-2.5 lg:px-6" colSpan={3}>Applied free ingestion deduction</td>
                <td className="px-5 py-2.5 text-right tabular-nums lg:px-6">−{formatCurrency(summary.freeGrantSavingsMonthly)}</td>
              </tr>
              <tr className="border-t border-white/[0.05]">
                <td className="px-5 py-2.5 lg:px-6" colSpan={3}>Data lake query cost</td>
                <td className="px-5 py-2.5 text-right tabular-nums lg:px-6">{formatCurrency(summary.dataLakeQueryMonthlyCost)}</td>
              </tr>
              <tr className="border-t border-white/[0.05]">
                <td className="px-5 py-2.5 lg:px-6" colSpan={3}>Defender for Servers Plan 2 licences</td>
                <td className="px-5 py-2.5 text-right tabular-nums lg:px-6">{formatCurrency(summary.serverLicenseMonthlyCost)}</td>
              </tr>
              <tr className="border-t border-white/[0.14] bg-nox-accent/[0.05]">
                <td className="px-5 py-3.5 font-sans text-sm font-semibold text-nox-text lg:px-6" colSpan={3}>Estimated monthly total</td>
                <td className="px-5 py-3.5 text-right text-base font-semibold tabular-nums text-nox-accent lg:px-6">{formatCurrency(summary.discountedMonthlyCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <ScenarioComparison />
    </div>
  );
}
