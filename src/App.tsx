import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { SetupPage } from './pages/SetupPage';
import { SourcesPage } from './pages/SourcesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { CostsPage } from './pages/CostsPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { tabs } from './data/constants';
import { useCostSummary, useEstimatorStore } from './store/useEstimatorStore';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';

function App() {
  const activeTab = useEstimatorStore((s) => s.activeTab);
  const setActiveTab = useEstimatorStore((s) => s.setActiveTab);
  const resetAll = useEstimatorStore((s) => s.resetAll);
  const summary = useCostSummary();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#07111f_0%,#091629_45%,#040914_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.08),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.65),transparent_95%)]" />
      </div>

      <div className="relative mx-auto max-w-[1520px] px-4 py-5 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(8,15,28,0.94))] shadow-[0_30px_120px_-40px_rgba(14,165,233,0.4)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-5 lg:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_18px_50px_-28px_rgba(34,211,238,0.8)]">
                  <ShieldCheck className="h-6 w-6 text-cyan-200" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-cyan-200/70">
                    <span>Security Cost Intelligence</span>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-white lg:text-[2rem]">Microsoft Sentinel Calculator</p>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                      Model ingestion strategy, compare commitment tiers, and estimate monthly Sentinel spend with live region pricing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    <Activity className="h-3.5 w-3.5 text-cyan-300" />
                    Daily Volume
                  </div>
                  <p className="text-xl font-semibold text-white">{summary.dailyIngestion.toFixed(2)} GB/day</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Sources
                  </div>
                  <p className="text-xl font-semibold text-white">{summary.selectedSources}</p>
                </div>
                <div className="flex items-end sm:col-span-2 xl:col-span-1">
                  <Button variant="outline" size="sm" className="h-11 w-full" onClick={resetAll}>Reset Workspace</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 lg:px-7">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'rounded-2xl border px-4 py-2.5 text-sm font-medium tracking-wide transition duration-200',
                    activeTab === tab
                      ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.85)]'
                      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]',
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="mt-5">
          {activeTab === 'Setup' ? <SetupPage /> : null}
          {activeTab === 'Sources' ? <SourcesPage /> : null}
          {activeTab === 'Architecture' ? <ArchitecturePage /> : null}
          {activeTab === 'Costs' ? <CostsPage /> : null}
          {activeTab === 'Changelog' ? <ChangelogPage /> : null}
        </main>
      </div>
    </div>
  );
}

export default App;
