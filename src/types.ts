export type TabKey = 'Setup' | 'Sources' | 'Architecture' | 'Costs' | 'Changelog';

export type Tier = 'analytics' | 'basic' | 'datalake';

export type TierType = Tier | 'smart_split' | 'free';

export type ScalingKey =
  | 'users'
  | 'endpoints'
  | 'servers'
  | 'firewalls'
  | 'devices'
  | 'vms'
  | 'awsAccounts'
  | 'azureSubscriptions'
  | 'gcpProjects';

export interface Source {
  id: string;
  vendor: string;
  product: string;
  category: string;
  base_ingestion: number;
  supports_scaling: boolean;
  scaling_key?: ScalingKey;
  tier_type: TierType;
  description: string;
  split?: Record<Tier, number>;
}

export interface SourceSelection {
  selected: boolean;
  quantity: number;
  tierSplit: Record<Tier, number>;
}

export interface SetupConfig {
  users: number;
  endpoints: number;
  industry: string;
  analyticsRetentionMonths: number;
  dataLakeRetentionMonths: number;
  basicRetentionDays: number;
  e5GrantEnabled: boolean;
  defenderServersGrantEnabled: boolean;
  region: string;
  queriesPerDay: number;
  awsAccounts: number;
  azureSubscriptions: number;
  gcpProjects: number;
  firewalls: number;
  servers: number;
  devices: number;
  vms: number;
  commitmentTier: string;
}

export interface Scenario {
  id: string;
  name: string;
  setup: SetupConfig;
  selections: Record<string, SourceSelection>;
  savedAt: string;
}

export interface CostBreakdownRow {
  id: string;
  source: string;
  tier: Tier;
  dailyGb: number;
  monthlyCost: number;
}

export interface CostSummary {
  dailyIngestion: number;
  monthlyIngestion: number;
  tierDaily: Record<Tier, number>;
  tierMonthlyCost: Record<Tier, number>;
  freeGrantDailyGb: number;
  appliedGrantDailyGb: number;
  effectiveAnalyticsDailyGb: number;
  baseMonthlyCost: number;
  discountedMonthlyCost: number;
  yearlyCost: number;
  effectivePricePerGb: number;
  dataLakeQueryMonthlyCost: number;
  totalSavings: number;
  selectedSources: number;
  invoiceRows: CostBreakdownRow[];
  invoiceSubtotalMonthly: number;
  freeGrantSavingsMonthly: number;
  serverLicenseMonthlyCost: number;
}
