# Simulation: March 2026 Global Payroll Campaign

## Scenario

Acme Protocol runs a globally distributed engineering team across 12 countries. Each month, they need to pay 40+ contractors in USDC — spanning Arc Testnet, Base Sepolia, and Avalanche Fuji. Before PointyPay, this required: manual wallet lookups, separate transactions per chain, hours of reconciliation.

## Campaign Setup

**Name:** March 2026 Payroll
**Type:** Payroll
**Recipients:** 8 (representative sample)
**Total Payout:** 12,450.00 USDC
**Policy:** Requires approval; min treasury 15,000 USDC
**Status flow:** `draft → approved → executing → completed`

## Recipient Breakdown

| Name           | Chain           | Amount (USDC) | Address          |
|----------------|-----------------|---------------|------------------|
| Alice Chen     | Arc Testnet     | 2,500.00      | 0xAlice…         |
| Bob Martins    | Base Sepolia    | 1,800.00      | 0xBob…           |
| Chloe Park     | Avalanche Fuji  | 1,200.00      | 0xChloe…         |
| Diego Reyes    | Arc Testnet     | 2,000.00      | 0xDiego…         |
| Eva Müller     | Base Sepolia    | 950.00        | 0xEva…           |
| Felix Osei     | Arc Testnet     | 1,500.00      | 0xFelix…         |
| Grace Liu      | Avalanche Fuji  | 1,200.00      | 0xGrace…         |
| Hiro Tanaka    | Arc Testnet     | 1,300.00      | 0xHiro…          |

## Execution Flow

### Step 1: Draft → Approval Queue
Campaign is created with `policy_requires_approval: true`. Finance lead reviews the recipient list, verifies amounts match contractor invoices, and clicks **Approve Campaign**.

Status transitions: `draft → approved`

### Step 2: Treasury Policy Check
Before execution, PointyPay checks the Circle Gateway balance:
- Gateway balance: 22,000 USDC ✓ (above 15,000 minimum)
- Campaign total: 12,450 USDC ✓ (within available balance)

### Step 3: Cross-Chain Execution
For each recipient, `executeBridgeKitTransfer()` is called:

```
Arc recipients (4):     Direct Gateway transfer on Arc Testnet
Base recipients (2):    Gateway burn on Arc → mint on Base Sepolia
Fuji recipients (2):    Gateway burn on Arc → mint on Avalanche Fuji
```

Circle Gateway domain routing:
- Arc Testnet: domain 26
- Base Sepolia: domain 6
- Avalanche Fuji: domain 1

### Step 4: Settlement
All 8 payouts complete within 30 seconds. Each payout entry records:
- `tx_hash`: on-chain transaction hash
- `status`: "success"
- Explorer link visible in UI

Campaign status: `executing → completed`

## Key Metrics (Simulated)

| Metric                    | Value       |
|---------------------------|-------------|
| Total recipients          | 8           |
| Chains covered            | 3           |
| Execution time            | ~28 seconds |
| Gas paid by treasury      | 0 USDC*     |
| Manual steps required     | 0           |
| Reconciliation time       | 0 minutes   |

*Arc Testnet uses USDC as gas. Circle Gateway handles gas abstraction for cross-chain mints.

## Before vs After

| Task                     | Before PointyPay | After PointyPay |
|--------------------------|------------------|-----------------|
| Lookup 8 wallet addresses| 20 min           | 0 min (saved)   |
| Submit 8 transactions    | 40 min           | 1 click         |
| Cross-chain routing      | Manual per chain | Automatic       |
| Payment verification     | 1 hour           | Real-time UI    |
| Total time               | ~2 hours         | ~2 minutes      |

## Narrative

> "It's March 1st, 8 AM. Finance lead Maria logs into PointyPay. The March payroll campaign was pre-built by the ops team — 8 contractors, three chains, $12,450 total. Maria reviews the list, hits Approve. PointyPay checks the Gateway balance: 22,000 USDC available. She clicks Execute. Thirty seconds later, all eight contractors have received their USDC — wherever in the world they are, whatever chain they prefer. Maria closes her laptop. By the time she gets her morning coffee, the job is done."
