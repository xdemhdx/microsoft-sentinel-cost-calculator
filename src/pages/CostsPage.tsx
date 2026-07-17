import { Download, DollarSign, LineChart, PiggyBank } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import { CostSummaryCard } from '../components/CostSummaryCard';
import { ScenarioComparison } from '../components/ScenarioComparison';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { useCostSummary } from '../store/useEstimatorStore';

const tierColors = ['#ef4444', '#f87171', '#fca5a5'];

export function CostsPage() {
  const summary = useCostSummary();

  const tierData = [
    { name: 'Analytics', value: summary.tierMonthlyCost.analytics },
    { name: 'Basic', value: summary.tierMonthlyCost.basic },
    { name: 'Data Lake', value: summary.tierMonthlyCost.datalake },
  ];

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CostSummaryCard title="Monthly Cost" value={formatCurrency(summary.discountedMonthlyCost)} icon={<DollarSign className="h-4 w-4 text-red-300" />} />
        <CostSummaryCard title="Yearly Estimate" value={formatCurrency(summary.yearlyCost)} icon={<LineChart className="h-4 w-4 text-red-300" />} />
        <CostSummaryCard title="Applied Grant Savings" value={formatCurrency(summary.freeGrantSavingsMonthly)} icon={<PiggyBank className="h-4 w-4 text-red-300" />} />
        <CostSummaryCard title="Effective Price / GB" value={effectivePrice} hint="After grants and commitments" icon={<DollarSign className="h-4 w-4 text-red-300" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Grant and License Summary</CardTitle></CardHeader>
          <CardContent className="grid gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
              Potential free grant: <span className="font-semibold text-red-200">{summary.freeGrantDailyGb.toFixed(2)} GB/day</span>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
              Applied free grant: <span className="font-semibold text-red-200">{summary.appliedGrantDailyGb.toFixed(2)} GB/day</span>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300 sm:col-span-2">
              DfS P2 license cost: <span className="font-semibold text-red-200">{formatCurrency(summary.serverLicenseMonthlyCost)}/month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Daily Total Estimate</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Total Ingestion</span>
              <span className="font-semibold text-white">{summary.dailyIngestion.toFixed(2)} GB/day</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Analytics</span>
              <span className="font-semibold text-amber-300">{summary.tierDaily.analytics.toFixed(2)} GB/day</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Basic</span>
              <span className="font-semibold text-indigo-300">{summary.tierDaily.basic.toFixed(2)} GB/day</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Data Lake</span>
              <span className="font-semibold text-emerald-300">{summary.tierDaily.datalake.toFixed(2)} GB/day</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
              <span className="text-red-200">Applied Grant</span>
              <span className="font-semibold text-red-100">-{summary.appliedGrantDailyGb.toFixed(2)} GB/day</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
              <span className="text-emerald-200">Effective Analytics Billable</span>
              <span className="font-semibold text-emerald-100">{summary.effectiveAnalyticsDailyGb.toFixed(2)} GB/day</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cost Per Tier</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" outerRadius={110}>
                  {tierData.map((_, index) => <Cell key={index} fill={tierColors[index % tierColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Tier Breakdown</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {tierData.map((_, index) => <Cell key={index} fill={tierColors[index % tierColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Invoice Estimate</CardTitle>
          <Button variant="secondary" onClick={generateReport}><Download className="mr-2 h-4 w-4" />Generate Executive Report</Button>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="py-2">Source</th><th>Tier</th><th>Daily GB</th><th className="text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {summary.invoiceRows.slice(0, 120).map((row) => (
                <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                  <td className="py-2">{row.source}</td>
                  <td className="capitalize">{row.tier}</td>
                  <td>{row.dailyGb.toFixed(2)}</td>
                  <td className="text-right">{formatCurrency(row.monthlyCost)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-700 text-slate-300">
                <td className="py-2 font-semibold" colSpan={3}>Subtotal</td>
                <td className="text-right font-semibold">{formatCurrency(summary.invoiceSubtotalMonthly)}</td>
              </tr>
              <tr className="border-t border-slate-800 text-emerald-300">
                <td className="py-2" colSpan={3}>Applied free ingestion deduction</td>
                <td className="text-right">-{formatCurrency(summary.freeGrantSavingsMonthly)}</td>
              </tr>
              <tr className="border-t border-slate-800 text-slate-300">
                <td className="py-2" colSpan={3}>Data lake query cost</td>
                <td className="text-right">{formatCurrency(summary.dataLakeQueryMonthlyCost)}</td>
              </tr>
              <tr className="border-t border-slate-800 text-slate-300">
                <td className="py-2" colSpan={3}>Defender for Servers Plan 2 licenses</td>
                <td className="text-right">{formatCurrency(summary.serverLicenseMonthlyCost)}</td>
              </tr>
              <tr className="border-t border-slate-700 text-white">
                <td className="py-2 font-semibold" colSpan={3}>Estimated monthly total</td>
                <td className="text-right font-semibold">{formatCurrency(summary.discountedMonthlyCost)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ScenarioComparison />
    </div>
  );
}
