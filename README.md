# PointyPay

**Enterprise-grade USDC payout infrastructure powered by Circle Gateway and Arc Network.**

PointyPay enables organizations to manage multi-recipient, cross-chain USDC payouts through an
approvals-driven campaign system. Built on Arc Testnet as the home chain, it leverages Circle's
unified USDC Gateway to settle payments across Base Sepolia and Avalanche Fuji without bridging
delays or liquidity constraints.

---

## Features

- **Campaign-based payout management** — payroll, revenue distribution, and fund settlement
- **Full approval pipeline** — `draft → scheduled → approved → executing → completed`
- **Cross-chain in one click** — Arc Testnet, Base Sepolia, Avalanche Fuji via Circle Gateway
- **Nanopayments** — instant one-off USDC sends with visual streaming animation
- **Treasury Health Score** — real-time gateway balance monitoring with USYC yield integration
- **Saved recipients** — reusable payout address book with chain preferences
- **Complete audit trail** — every transaction recorded with on-chain tx hashes

---

## Tech Stack

| Layer         | Technology                                        |
|---------------|---------------------------------------------------|
| Frontend      | Next.js 15 (App Router), React 19, Tailwind v4   |
| Auth + DB     | Supabase (local Docker)                           |
| Blockchain    | Arc Testnet (Circle L1, domain 26)               |
| Payments      | Circle Developer Controlled Wallets SDK           |
| Cross-chain   | Circle Gateway + Bridge Kit                       |
| Nanopayments  | Circle Gateway (same underlying infrastructure)   |
| UI            | lucide-react, sonner, shadcn-style components     |

---

## Setup

### Prerequisites

- Node.js 20+
- Docker (for Supabase local)
- Circle API key (Developer Controlled Wallets)

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase

```bash
npx supabase start
```

Supabase runs locally on:
- **API / Auth**: `http://127.0.0.1:54321`
- **Studio UI**: `http://127.0.0.1:54323`

After it starts, run `npx supabase status` to see the exact URLs and keys for your machine.

### 3. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in the values from `npx supabase status`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key from supabase status>
SUPABASE_SECRET_KEY=<Secret key from supabase status>
CIRCLE_API_KEY=<your Circle API key>
CIRCLE_ENTITY_SECRET=    # filled in next step
ARC_TESTNET_RPC_KEY=<your Arc RPC key>
```

### 4. Apply database migrations

```bash
npx supabase migration up
```

This creates the `wallets`, `recipients`, `payout_campaigns`, `payout_entries`, and `transaction_history` tables.

### 5. Generate Entity Secret (one-time)

Circle Developer Controlled Wallets require a one-time entity secret registration:

```bash
npx tsx scripts/setup-entity-secret.ts
```

Copy the printed `CIRCLE_ENTITY_SECRET` value into `.env.local`.
A recovery file is saved to `entity-secret-recovery.dat` — store it securely.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to `/auth/sign-up` and create your account.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App (Arc_Hackathon/Pointy-Pay)                         │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Auth Pages  │    │  Dashboard   │    │   API Routes     │  │
│  │  /auth/login │    │  /dashboard  │    │  /api/campaigns  │  │
│  │  /auth/signup│    │  /campaigns  │    │  /api/recipients │  │
│  └──────────────┘    │  /recipients │    │  /api/gateway    │  │
│                       │  /treasury   │    │  /api/nano       │  │
│                       │  /nano       │    └────────┬─────────┘  │
│                       │  /history    │             │             │
│                       └──────────────┘             │             │
└───────────────────────────────────────────────────┼─────────────┘
                                                    │
          ┌─────────────────────────────────────────┤
          │                                         │
          ▼                                         ▼
┌─────────────────────┐               ┌─────────────────────────┐
│  Supabase (local)   │               │  Circle Developer SDK   │
│  - wallets          │               │  - DeveloperControlled  │
│  - recipients       │               │    Wallets              │
│  - payout_campaigns │               │  - Gateway EOA wallets  │
│  - payout_entries   │               │  - Bridge Kit           │
│  - tx_history       │               └──────────┬──────────────┘
└─────────────────────┘                          │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │  Circle Gateway         │
                                    │  Arc Testnet (domain 26)│
                                    │  ↕ burn/mint            │
                                    │  Base Sepolia (domain 6)│
                                    │  ↕ burn/mint            │
                                    │  Avax Fuji (domain 1)   │
                                    └─────────────────────────┘
```

---

## Campaign Types

| Type                  | Use Case                                    | Policy Default         |
|-----------------------|---------------------------------------------|------------------------|
| `payroll`             | Monthly contractor / employee payments      | Requires approval      |
| `revenue_distribution`| LP / token holder revenue share            | Auto-execute on schedule|
| `fund_settlement`     | Emergency reimbursements / settlements      | No approval, immediate |

---

## Simulation Scenarios

See `docs/` for detailed walkthroughs of each campaign type:

- [`docs/payroll-simulation.md`](docs/payroll-simulation.md) — 8-person global payroll
- [`docs/revenue-distribution-simulation.md`](docs/revenue-distribution-simulation.md) — DeFi LP revenue share
- [`docs/fund-settlement-simulation.md`](docs/fund-settlement-simulation.md) — Emergency exploit response

---

## Circle Tools Used

| Tool                                  | Usage                                              |
|---------------------------------------|-----------------------------------------------------|
| Developer Controlled Wallets SDK      | SCA wallet creation and management                 |
| Circle Gateway                        | Unified USDC balance + cross-chain burn/mint       |
| Circle Gateway EOA Wallets            | EIP-712 signing for burn intents                   |
| Bridge Kit                            | High-level cross-chain transfer orchestration      |
| Arc Testnet                           | Home chain; USDC as native gas                     |
| USYC (Hashnote, via Arc)              | Yield on idle treasury USDC                        |

---

## License

MIT
