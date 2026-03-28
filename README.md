# DecCam

DecCam is a decentralized brand campaign platform where brands create funded campaigns on-chain, creators submit their X/Twitter promotional posts, and rewards are distributed proportionally based on real post performance.

Instead of managing influencer campaigns with DMs, spreadsheets, screenshots, and manual settlements, DecCam makes the campaign budget, submissions, reward logic, and payout flow transparent.

## What DecCam does

- Brands create a campaign and lock the reward pool on-chain.
- Creators join by submitting their X/Twitter post link.
- After the deadline, DecCam fetches post views through the worker service.
- The smart contract calculates rewards based on each creator's share of total views.
- Creators claim their payout directly from the contract.

## Why it is useful

### For creators

- Transparent reward pool: creators can verify the campaign is funded before participating.
- Performance-based payout: higher-performing content earns a larger share of the budget.
- No manual settlement: creators do not need to wait for off-chain calculations or private payout decisions.
- On-chain claims: rewards are claimed directly from the contract after finalization.
- Better trust: the payout formula is visible and consistent for everyone.

### For brands

- Clear campaign accounting: budget, deadline, and results are tracked in one flow.
- Easier campaign management: creators submit links directly to the campaign.
- Transparent reward distribution: payouts are based on measured performance, not manual negotiation after the fact.
- Reduced disputes: the contract defines how rewards are split.

## Proportional creator rewards

DecCam uses a proportional reward model.

The contract records:

- the total campaign budget
- the total recorded views across all submissions
- the views for each creator submission

When results are finalized, each creator reward is calculated as:

```text
creator_reward = (creator_views * total_budget) / total_views
```

Example:

- Campaign budget: `10 MON`
- Creator A views: `1,000`
- Creator B views: `3,000`
- Total views: `4,000`

Final payout:

- Creator A receives `2.5 MON`
- Creator B receives `7.5 MON`

This reward logic is implemented in [`contract/src/CampaignFactory.sol`](/home/r76v/DecCam/contract/src/CampaignFactory.sol).

## How DecCam fetches data from Twitter / X

The frontend does not scrape X directly. DecCam uses a Bun worker as the off-chain service layer.

Flow:

1. A creator submits an X/Twitter post URL to a campaign.
2. After the campaign deadline, the worker reads all campaign submissions from the contract.
3. The worker extracts the tweet ID from each submitted URL.
4. The worker calls the ScrapingDog X post API.
5. The worker normalizes the returned metrics, especially view count.
6. The worker writes the view count on-chain through `setViews(...)`.
7. The worker finalizes the campaign through `finalizeResults(...)`.
8. Creators can then claim their rewards.

Worker endpoints:

- `GET /health`
- `POST /scrape`
- `POST /scrape-batch`
- `POST /sync-campaign`

Worker env variables:

- `SCRAPING_DOG_API_KEY`
- `RPC_URL`
- `PRIVATE_KEY`
- `CONTRACT_ADDRESS`

Main worker files:

- [`worker/index.ts`](/home/r76v/DecCam/worker/index.ts)
- [`worker/scraper.ts`](/home/r76v/DecCam/worker/scraper.ts)
- [`worker/abi.json`](/home/r76v/DecCam/worker/abi.json)

## Project structure

```text
DecCam/
├── client/    Frontend app for brands and creators
├── worker/    Bun service for X/Twitter data fetching and on-chain sync
└── contract/  Smart contract project built with Foundry
```

## Key files

### Frontend

- [`client/src/App.tsx`](/home/r76v/DecCam/client/src/App.tsx)
  Application routes for home, dashboard, and campaign detail pages.

- [`client/src/pages/Home.tsx`](/home/r76v/DecCam/client/src/pages/Home.tsx)
  Landing page entry for the project experience.

- [`client/src/pages/Dashboard.tsx`](/home/r76v/DecCam/client/src/pages/Dashboard.tsx)
  Main campaign management page where users browse campaigns and create new ones.

- [`client/src/pages/CampaignDetail.tsx`](/home/r76v/DecCam/client/src/pages/CampaignDetail.tsx)
  Campaign detail page for viewing submissions, submitting links, syncing results, and claiming rewards.

- [`client/src/lib/campaigns.ts`](/home/r76v/DecCam/client/src/lib/campaigns.ts)
  Core contract integration layer for reading campaigns, loading submissions, formatting data, and exposing shared config such as RPC URLs and contract address.

- [`client/src/web3/wagmiConfig.ts`](/home/r76v/DecCam/client/src/web3/wagmiConfig.ts)
  Wallet and chain configuration used by the frontend.

### Worker

- [`worker/index.ts`](/home/r76v/DecCam/worker/index.ts)
  HTTP server that exposes scraping and campaign sync endpoints.

- [`worker/scraper.ts`](/home/r76v/DecCam/worker/scraper.ts)
  ScrapingDog integration and tweet ID parsing logic.

### Smart contract

- [`contract/src/CampaignFactory.sol`](/home/r76v/DecCam/contract/src/CampaignFactory.sol)
  Main contract that handles campaign creation, creator submissions, view recording, reward finalization, and claims.

- [`contract/foundry.toml`](/home/r76v/DecCam/contract/foundry.toml)
  Foundry configuration, including the Monad testnet chain setup used in this repo.

## Smart contract responsibilities

The contract is responsible for:

- creating campaigns with an on-chain reward budget
- accepting creator submissions before the deadline
- recording view counts after the campaign ends
- calculating rewards proportionally
- allowing creators to claim their payout

## Contract address

This repository does not hardcode one deployed contract address in source control.

The deployed `CampaignFactory` address is expected through environment variables:

- frontend: `VITE_CONTRACT_ADDRESS`
- worker: `CONTRACT_ADDRESS`

Both should point to the same deployed contract instance.

## Frontend configuration

Important frontend env variables:

- `VITE_CHAIN_ID`
- `VITE_RPC_URL`
- `VITE_CONTRACT_ADDRESS`
- `VITE_WORKER_URL`
- `VITE_WALLETCONNECT_PROJECT_ID`

## Basic user flow

1. A brand creates and funds a campaign.
2. Creators submit their X/Twitter post links before the deadline.
3. The worker fetches post metrics after the deadline.
4. View counts are written to the contract.
5. Rewards are finalized using the proportional formula.
6. Creators claim their MON rewards.

## Local development

### Frontend

```bash
cd client
npm install
npm run dev
```

### Worker

```bash
cd worker
bun install
bun run dev
```

### Contract

```bash
cd contract
forge build
forge test
```

## Tech stack

- Frontend: React, TypeScript, Vite, Wagmi, Viem, RainbowKit
- Worker: Bun, TypeScript, Ethers
- Contract: Solidity, Foundry
- Social data source: ScrapingDog X/Twitter API
- Chain configuration in repo: Monad testnet
