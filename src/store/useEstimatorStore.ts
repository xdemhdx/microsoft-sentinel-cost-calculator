import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import sourcesData from '../data/sources.json';
import { tabs } from '../data/constants';
import { calculateCosts, getDefaultSelection } from '../lib/calc';
import type { Scenario, SetupConfig, Source, SourceSelection, TabKey, Tier } from '../types';

const sources = sourcesData as Source[];

const initialSetup: SetupConfig = {
  users: 0,
  endpoints: 0,
  industry: '',
  analyticsRetentionMonths: 0,
  dataLakeRetentionMonths: 0,
  basicRetentionDays: 0,
  e5GrantEnabled: false,
  defenderServersGrantEnabled: false,
  region: '',
  queriesPerDay: 0,
  awsAccounts: 0,
  azureSubscriptions: 0,
  gcpProjects: 0,
  firewalls: 0,
  servers: 0,
  devices: 0,
  vms: 0,
  commitmentTier: '',
};

const buildInitialSelections = (): Record<string, SourceSelection> =>
  Object.fromEntries(sources.map((source) => [source.id, getDefaultSelection(source)]));

const mergeSelections = (stored?: Record<string, SourceSelection>) => {
  const merged = buildInitialSelections();
  if (stored) {
    Object.entries(stored).forEach(([id, value]) => {
      if (merged[id]) {
        merged[id] = {
          selected: Boolean(value.selected),
          quantity: Math.max(1, Number(value.quantity || 1)),
          tierSplit: {
            analytics: Number(value.tierSplit?.analytics ?? merged[id].tierSplit.analytics),
            basic: Number(value.tierSplit?.basic ?? merged[id].tierSplit.basic),
            datalake: Number(value.tierSplit?.datalake ?? merged[id].tierSplit.datalake),
          },
        };
      }
    });
  }

  return merged;
};

interface EstimatorStore {
  activeTab: TabKey;
  setup: SetupConfig;
  compliance: string[];
  selections: Record<string, SourceSelection>;
  scenarios: Scenario[];
  scenarioName: string;
  setActiveTab: (tab: TabKey) => void;
  setSetupValue: <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => void;
  setCompliance: (items: string[]) => void;
  toggleSource: (id: string, selected: boolean) => void;
  setSourceQuantity: (id: string, quantity: number) => void;
  setSourceTier: (id: string, tier: Tier, value: number) => void;
  setSourceSplit: (id: string, split: Record<Tier, number>) => void;
  setScenarioName: (name: string) => void;
  saveScenario: () => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  resetSelections: () => void;
  resetAll: () => void;
}

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set, get) => ({
      activeTab: tabs[0],
      setup: initialSetup,
      compliance: [],
      selections: buildInitialSelections(),
      scenarios: [],
      scenarioName: '',
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSetupValue: (key, value) => set((state) => ({ setup: { ...state.setup, [key]: value } })),
      setCompliance: (items) => set({ compliance: items }),
      toggleSource: (id, selected) =>
        set((state) => ({ selections: { ...state.selections, [id]: { ...state.selections[id], selected } } })),
      setSourceQuantity: (id, quantity) =>
        set((state) => ({
          selections: { ...state.selections, [id]: { ...state.selections[id], quantity: Math.max(1, quantity || 1) } },
        })),
      setSourceTier: (id, tier, value) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [id]: {
              ...state.selections[id],
              tierSplit: {
                ...state.selections[id].tierSplit,
                [tier]: Math.max(0, Math.min(1, value)),
              },
            },
          },
        })),
      setSourceSplit: (id, split) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [id]: {
              ...state.selections[id],
              tierSplit: {
                analytics: Math.max(0, Math.min(1, split.analytics)),
                basic: Math.max(0, Math.min(1, split.basic)),
                datalake: Math.max(0, Math.min(1, split.datalake)),
              },
            },
          },
        })),
      setScenarioName: (scenarioName) => set({ scenarioName }),
      saveScenario: () => {
        const state = get();
        const scenario: Scenario = {
          id: crypto.randomUUID(),
          name: state.scenarioName || `Scenario ${state.scenarios.length + 1}`,
          setup: state.setup,
          selections: state.selections,
          savedAt: new Date().toISOString(),
        };

        set({ scenarios: [...state.scenarios, scenario] });
      },
      loadScenario: (id) => {
        const scenario = get().scenarios.find((item) => item.id === id);
        if (!scenario) {
          return;
        }
        set({ setup: scenario.setup, selections: mergeSelections(scenario.selections), scenarioName: scenario.name });
      },
      deleteScenario: (id) => set((state) => ({ scenarios: state.scenarios.filter((s) => s.id !== id) })),
      resetSelections: () => set({ selections: buildInitialSelections() }),
      resetAll: () =>
        set({
          activeTab: tabs[0],
          setup: initialSetup,
          compliance: [],
          selections: buildInitialSelections(),
          scenarios: [],
          scenarioName: '',
        }),
    }),
    {
      name: 'sentinel-estimator-v4',
      partialize: (state) => ({
        setup: state.setup,
        selections: state.selections,
        scenarios: state.scenarios,
        scenarioName: state.scenarioName,
        compliance: state.compliance,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<EstimatorStore>;
        return {
          ...currentState,
          ...persisted,
          setup: { ...initialSetup, ...(persisted.setup || {}) },
          selections: mergeSelections(persisted.selections),
          compliance: persisted.compliance || [],
        } as EstimatorStore;
      },
    },
  ),
);

export const useCostSummary = () => {
  const setup = useEstimatorStore((state) => state.setup);
  const selections = useEstimatorStore((state) => state.selections);
  return calculateCosts(setup, selections);
};

export const allSources = sources;
