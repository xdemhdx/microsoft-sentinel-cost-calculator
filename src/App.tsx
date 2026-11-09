import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { SetupPage } from './pages/SetupPage';
import { SourcesPage } from './pages/SourcesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { CostsPage } from './pages/CostsPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { tabs } from './data/constants';
import { useCostSummary, useEstimatorStore } from './store/useEstimatorStore';
import { cn, formatCurrency } from './lib/utils';
import { Button } from './components/ui/button';
import { NoxLogo } from './components/NoxLogo';

const tabIndex = (i: number) => String(i + 1).padStart(2, '0');

function App() {
  const activeTab = useEstimatorStore((s) => s.activeTab);
  const setActiveTab = useEstimatorStore((s) => s.setActiveTab);
  const resetAll = useEstimatorStore((s) => s.resetAll);
  const summary = useCostSummary();

  const kpis = [
    { label: 'Monthly estimate', value: formatCurrency(summary.discountedMonthlyCost), accent: true },
    { label: 'Yearly estimate', value: formatCurrency(summary.yearlyCost) },
    { label: 'Daily ingestion', value: summary.dailyIngestion.toFixed(2), unit: 'GB/day' },
    { label: 'Sources selected', value: String(summary.selectedSources) },
  ];

  return (
    <div className="min-h-screen text-nox-text">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-nox-bg/80 backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 w-[min(1280px,100%-32px)] items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <NoxLogo />
            <span className="hidden h-5 w-px bg-white/[0.14] sm:block" />
            <span className="hidden truncate font-mono text-xs text-nox-muted sm:block">tools / sentinel-cost</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetAll} title="Reset all inputs">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <a
              href="https://noxcipher.site"
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-white/[0.14] px-3 text-xs font-medium transition hover:border-white/25 hover:bg-white/[0.04] sm:inline-flex"
            >
              More tools <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto w-[min(1280px,100%-32px)] pb-16">
        <section className="pb-8 pt-12 lg:pt-16">
          <p className="nox-label flex items-center gap-2">
            <span className="live-dot" /> Microsoft Sentinel <span className="text-nox-faint">·</span> Cost modelling
          </p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h1 className="text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                Sentinel cost<span className="text-nox-accent">.</span>
                <br />
                <span className="text-nox-muted">Calculated</span>
                <span className="text-nox-accent">.</span>
              </h1>
              <p className="mt-5 max-w-[540px] text-[17px] leading-relaxed text-nox-muted">
                Model ingestion across <strong className="font-medium text-nox-text">Analytics</strong>,{' '}
                <strong className="font-medium text-nox-text">Basic</strong> and{' '}
                <strong className="font-medium text-nox-text">Data Lake</strong> tiers, apply free data grants and
                compare commitment tiers with regional pricing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className={cn(
                    'min-w-0 rounded-xl border bg-nox-panel px-4 py-3.5',
                    kpi.accent
                      ? 'border-nox-accent/30 bg-[linear-gradient(135deg,rgba(61,255,162,0.08),#0b0d0e_70%)]'
                      : 'border-white/[0.08]',
                  )}
                >
                  <span className="nox-label block text-[10.5px] text-nox-faint">{kpi.label}</span>
                  <strong
                    className={cn(
                      'mt-1.5 block truncate text-[clamp(1.25rem,3.2vw,1.65rem)] font-semibold tabular-nums tracking-[-0.03em]',
                      kpi.accent && 'text-nox-accent',
                    )}
                  >
                    {kpi.value}
                    {kpi.unit ? (
                      <span className="ml-1.5 font-mono text-xs font-medium tracking-normal text-nox-muted">{kpi.unit}</span>
                    ) : null}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="sticky top-16 z-20 -mx-4 mb-6 border-b border-white/[0.08] bg-nox-bg/85 px-4 backdrop-blur-[14px] sm:mx-0 sm:px-0">
          <div role="tablist" className="flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none]">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'group flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition',
                  activeTab === tab
                    ? 'border-white/[0.14] bg-nox-surface-2 text-nox-text'
                    : 'border-transparent text-nox-muted hover:text-nox-text',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[11px]',
                    activeTab === tab ? 'text-nox-accent' : 'text-nox-faint group-hover:text-nox-muted',
                  )}
                >
                  {tabIndex(i)}
                </span>
                {tab}
              </button>
            ))}
          </div>
        </nav>

        <main key={activeTab} className="fade-up">
          {activeTab === 'Setup' ? <SetupPage /> : null}
          {activeTab === 'Sources' ? <SourcesPage /> : null}
          {activeTab === 'Architecture' ? <ArchitecturePage /> : null}
          {activeTab === 'Costs' ? <CostsPage /> : null}
          {activeTab === 'Changelog' ? <ChangelogPage /> : null}
        </main>
      </div>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex w-[min(1280px,100%-32px)] flex-wrap items-center justify-between gap-3 py-6 font-mono text-[11px] text-nox-faint">
          <span>Estimates only. Verify against the official Azure pricing calculator.</span>
          <span>
            Built by{' '}
            <a href="https://noxcipher.site" className="text-nox-muted transition hover:text-nox-accent">
              noxcipher
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/xdemhdx/microsoft-sentinel-cost-calculator"
              className="text-nox-muted transition hover:text-nox-accent"
            >
              source
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
