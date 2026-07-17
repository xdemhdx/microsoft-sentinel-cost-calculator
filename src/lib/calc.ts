import sourcesData from '../data/sources.json';
import {
  payAsYouGoTier,
  resolveSentinelCommitmentTier,
  resolveSentinelRegionKey,
  sentinelRegionPricing,
} from '../data/sentinelPricing';
import type { CostSummary, SetupConfig, Source, SourceSelection, Tier } from '../types';

const sources = sourcesData as Source[];

const DEFENDER_SERVERS_PLAN2_MONTHLY = 15;
const DEFAULT_ANALYTICS_PAYG_PRICE = 4.3;
const DEFAULT_BASIC_PRICE = 1;
const DEFAULT_DATALAKE_PRICE = 0.15;

const getScaledQuantity = (_setup: SetupConfig, _source: Source, selection: SourceSelection) => {
  return Math.max(1, selection.quantity || 1);
};

const normalizeSplit = (split: Record<Tier, number>): Record<Tier, number> => {
  const total = split.analytics + split.basic + split.datalake;
  if (total === 0) {
    return { analytics: 1, basic: 0, datalake: 0 };
  }

  return {
    analytics: split.analytics / total,
    basic: split.basic / total,
    datalake: split.datalake / total,
  };
};

const isServerGrantEligibleSource = (source: Source) => {
  return source.scaling_key === 'servers' || source.category === 'Infrastructure';
};

const getCommitmentCapacity = (tier: string) => Number.parseInt(tier, 10);

const calculateAnalyticsMonthlyCost = (dailyGb: number, regionKey: string, commitmentTier: string) => {
  const resolvedRegionKey = resolveSentinelRegionKey(regionKey);
  const resolvedTier = resolveSentinelCommitmentTier(commitmentTier);
  const regionPricing = resolvedRegionKey ? sentinelRegionPricing[resolvedRegionKey] : undefined;
  const analyticsPaygPerGb = regionPricing?.analyticsPaygPerGb ?? DEFAULT_ANALYTICS_PAYG_PRICE;

  if (!resolvedTier || resolvedTier === payAsYouGoTier) {
    return {
      monthlyCost: dailyGb * 30 * analyticsPaygPerGb,
      paygPerGb: analyticsPaygPerGb,
      effectivePerGb: analyticsPaygPerGb,
    };
  }

  const commitmentDailyPrice = regionPricing?.commitments[resolvedTier];
  const commitmentCapacity = getCommitmentCapacity(resolvedTier);

  if (!commitmentDailyPrice || !commitmentCapacity) {
    return {
      monthlyCost: dailyGb * 30 * analyticsPaygPerGb,
      paygPerGb: analyticsPaygPerGb,
      effectivePerGb: analyticsPaygPerGb,
    };
  }

  const commitmentPerGb = commitmentDailyPrice / commitmentCapacity;
  const overageDailyGb = Math.max(0, dailyGb - commitmentCapacity);
  const monthlyCost = commitmentDailyPrice * 30 + overageDailyGb * 30 * commitmentPerGb;

  return {
    monthlyCost,
    paygPerGb: analyticsPaygPerGb,
    effectivePerGb: commitmentPerGb,
  };
};

export function calculateCosts(
  setup: SetupConfig,
  selections: Record<string, SourceSelection>,
): CostSummary {
  const tierDaily: Record<Tier, number> = { analytics: 0, basic: 0, datalake: 0 };
  let eligibleServerAnalyticsDaily = 0;
  const invoiceRows: CostSummary['invoiceRows'] = [];
  const resolvedRegionKey = resolveSentinelRegionKey(setup.region);
  const resolvedCommitmentTier = resolveSentinelCommitmentTier(setup.commitmentTier);
  const regionPricing = resolvedRegionKey ? sentinelRegionPricing[resolvedRegionKey] : undefined;
  const basicPricePerGb = regionPricing?.basicPerGb ?? DEFAULT_BASIC_PRICE;
  const dataLakePricePerGb = regionPricing?.dataLakePerGb ?? DEFAULT_DATALAKE_PRICE;
  const analyticsRows: number[] = [];

  for (const source of sources) {
    const selection = selections[source.id];
    if (!selection?.selected) {
      continue;
    }

    const quantity = getScaledQuantity(setup, source, selection);
    const sourceDaily = source.base_ingestion * quantity;
    const normalized = normalizeSplit(selection.tierSplit);

    (['analytics', 'basic', 'datalake'] as Tier[]).forEach((tier) => {
      const dailyGb = sourceDaily * normalized[tier];
      tierDaily[tier] += dailyGb;

      if (tier === 'analytics' && isServerGrantEligibleSource(source)) {
        eligibleServerAnalyticsDaily += dailyGb;
      }

      if (dailyGb > 0) {
        invoiceRows.push({
          id: `${source.id}-${tier}`,
          source: `${source.vendor} ${source.product}`,
          tier,
          dailyGb,
          monthlyCost: 0,
        });

        const rowIndex = invoiceRows.length - 1;
        if (source.tier_type === 'free') {
          invoiceRows[rowIndex].monthlyCost = 0;
        } else if (tier === 'analytics') {
          analyticsRows.push(rowIndex);
        } else if (tier === 'basic') {
          invoiceRows[rowIndex].monthlyCost = dailyGb * 30 * basicPricePerGb;
        } else {
          invoiceRows[rowIndex].monthlyCost = dailyGb * 30 * dataLakePricePerGb;
        }
      }
    });
  }

  const e5GrantDailyGb = setup.e5GrantEnabled ? setup.users * 0.005 : 0;
  const defenderGrantDailyGbPotential = setup.defenderServersGrantEnabled ? setup.servers * 0.5 : 0;
  const defenderGrantDailyGbApplied = Math.min(defenderGrantDailyGbPotential, eligibleServerAnalyticsDaily);

  const freeGrantDailyGb = e5GrantDailyGb + defenderGrantDailyGbPotential;
  const appliedGrantDailyGb = Math.min(tierDaily.analytics, e5GrantDailyGb + defenderGrantDailyGbApplied);
  const effectiveAnalyticsDailyGb = Math.max(0, tierDaily.analytics - appliedGrantDailyGb);
  const analyticsMonthlyBeforeGrant = calculateAnalyticsMonthlyCost(tierDaily.analytics, resolvedRegionKey, resolvedCommitmentTier);
  const analyticsMonthlyAfterGrant = calculateAnalyticsMonthlyCost(effectiveAnalyticsDailyGb, resolvedRegionKey, resolvedCommitmentTier);

  const analyticsBillableRows = analyticsRows.filter((index) => invoiceRows[index].monthlyCost === 0);
  const analyticsTotalDailyGb = analyticsBillableRows.reduce((acc, index) => acc + invoiceRows[index].dailyGb, 0);
  if (analyticsTotalDailyGb > 0) {
    analyticsBillableRows.forEach((index) => {
      const share = invoiceRows[index].dailyGb / analyticsTotalDailyGb;
      invoiceRows[index].monthlyCost = analyticsMonthlyBeforeGrant.monthlyCost * share;
    });
  }

  const tierMonthlyCost: Record<Tier, number> = {
    analytics: analyticsMonthlyAfterGrant.monthlyCost,
    basic: tierDaily.basic * 30 * basicPricePerGb,
    datalake: tierDaily.datalake * 30 * dataLakePricePerGb,
  };

  const dailyIngestion = tierDaily.analytics + tierDaily.basic + tierDaily.datalake;
  const monthlyIngestion = dailyIngestion * 30;

  const invoiceSubtotalMonthly = invoiceRows.reduce((acc, row) => acc + row.monthlyCost, 0);
  const freeGrantSavingsMonthly = Math.max(0, analyticsMonthlyBeforeGrant.monthlyCost - analyticsMonthlyAfterGrant.monthlyCost);
  const dataLakeQueryMonthlyCost = setup.queriesPerDay * 2 * 0.005 * 30;
  const serverLicenseMonthlyCost = setup.defenderServersGrantEnabled ? setup.servers * DEFENDER_SERVERS_PLAN2_MONTHLY : 0;

  const monthlyTotal = invoiceSubtotalMonthly - freeGrantSavingsMonthly + dataLakeQueryMonthlyCost + serverLicenseMonthlyCost;

  return {
    dailyIngestion,
    monthlyIngestion,
    tierDaily,
    tierMonthlyCost,
    freeGrantDailyGb,
    appliedGrantDailyGb,
    effectiveAnalyticsDailyGb,
    baseMonthlyCost: invoiceSubtotalMonthly + dataLakeQueryMonthlyCost + serverLicenseMonthlyCost,
    discountedMonthlyCost: monthlyTotal,
    yearlyCost: monthlyTotal * 12,
    effectivePricePerGb: monthlyIngestion > 0 ? monthlyTotal / monthlyIngestion : 0,
    dataLakeQueryMonthlyCost,
    totalSavings: freeGrantSavingsMonthly,
    selectedSources: Object.values(selections).filter((s) => s.selected).length,
    invoiceRows: invoiceRows.sort((a, b) => b.monthlyCost - a.monthlyCost),
    invoiceSubtotalMonthly,
    freeGrantSavingsMonthly,
    serverLicenseMonthlyCost,
  };
}

export function getDefaultSelection(source: Source): SourceSelection {
  void source;
  return {
    selected: false,
    quantity: 1,
    tierSplit: { analytics: 1, basic: 0, datalake: 0 },
  };
}
