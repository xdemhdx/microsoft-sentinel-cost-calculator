# Microsoft Sentinel Cost Calculator

A frontend-only React app that estimates **Microsoft Sentinel** daily log ingestion and monthly / yearly cost across all Azure regions, tier plans (Analytics / Basic / Data Lake), and commitment tiers — with free-grant modelling for M365 E5 and Defender for Servers P2.

> Not affiliated with Microsoft. Estimates only — always confirm with your Microsoft account team before sizing a purchase.

## What it does

Given a modelled environment (users, endpoints, servers, region, commitment tier, and a catalogue of data sources), the app computes:

- **Daily ingestion** — GB/day summed across all selected sources
- **Monthly & yearly cost** — with commitment-tier or pay-as-you-go pricing per region
- **Tier distribution** — how much data lands in Analytics vs Basic vs Data Lake
- **Free-grant impact** — M365 E5 (5 MB/user/day) and Defender for Servers P2 (500 MB/server/day)
- **Effective $/GB** — blended rate after grants and commitment discounts
- **Scenario comparison** — save multiple configurations side by side

## Why

Sentinel cost is dominated by log volume and tier routing. Before onboarding data you want to:

- Budget SIEM spend for a proposal or renewal
- Compare architectures (all-Analytics vs split to Basic / Data Lake)
- Quantify the discount from grants and commitment tiers
- Present cost trade-offs to technical and business stakeholders

## Pricing data

Region pricing (PAYG, Basic, Data Lake, and 12 commitment tiers per region) is bundled in [`src/data/sentinelPricing.ts`](src/data/sentinelPricing.ts) and mirrors the [Azure Retail Prices API](https://prices.azure.com/api/retail/prices) for the `Sentinel` service. Verified against live retail prices for US East, UK South, and Qatar Central at time of publish.

Data-source ingestion baselines live in [`src/data/sources.json`](src/data/sources.json) and can be edited freely without touching code.

## Cost model (high level)

```
dailyIngestion   = Σ (source.base_ingestion × quantity × tierSplit)
monthlyIngestion = dailyIngestion × 30

analytics PAYG   = daily × 30 × region.analyticsPaygPerGb
analytics tier   = commitmentDaily × 30 + overage × 30 × (commitmentDaily / capacity)
basic tier       = daily × 30 × region.basicPerGb
data lake tier   = daily × 30 × region.dataLakePerGb

e5Grant       = users × 0.005          (GB/day, applied to Analytics)
defenderGrant = min(servers × 0.5, eligibleServerAnalyticsDaily)
```

Defender for Servers P2 license fees (`$15 × servers` / month) are added on top when the P2 grant is enabled.

## Known limitations

Verified against Microsoft's [Sentinel billing docs](https://learn.microsoft.com/en-us/azure/sentinel/billing) and [Azure Monitor cost & usage](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/cost-usage):

- **Data Lake cost is a rough proxy** — the app multiplies the per-GB ingestion price by 30 days. Real Data Lake billing is split across four meters (ingestion, data processing, storage at 6:1 compression, query per GB scanned) — the estimate for Data-Lake-heavy routing is not authoritative.
- **Data Lake query cost uses a fixed $0.005/GB** — regionally accurate only for US regions.
- **Monthly = 30 days** — Azure daily meters actually accrue over ~30.42 days (730 h). Under-reports by ~1.4 %.
- **Free 10 GB/day × 31-day trial** for a new workspace is not modelled.
- **Free-grant display** reports the *potential* Defender P2 grant, not the capped-applied amount when server ingestion is low.

Contributions welcome — see [`src/lib/calc.ts`](src/lib/calc.ts) for the cost engine.

## Tech stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- Zustand for state
- recharts for charts
- jsPDF for report export
- No backend — everything runs in the browser

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t sentinel-calc .
docker run --rm -p 5173:5173 sentinel-calc
```

## Project structure

```
src/
  data/
    sentinelPricing.ts   # per-region prices + commitment tiers
    sources.json         # catalog of data sources & baselines
    constants.ts         # industries, compliance frameworks
  lib/
    calc.ts              # cost & ingestion engine
  components/            # reusable UI (source cards, tier selector, etc.)
  pages/                 # Setup / Sources / Architecture / Costs / Changelog
  store/                 # Zustand estimator store
```

## License

MIT.
