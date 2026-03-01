# Simulation: Q1 2026 Revenue Share Distribution

## Scenario

DeFi protocol "LiquidArc" distributes 10% of monthly protocol revenue to liquidity providers. In Q1 2026, the protocol generated $420,000 in fees, meaning $42,000 in USDC must be distributed proportionally across 120 LP token holders on 3 chains.

This simulation covers a representative 10-participant sample demonstrating the Revenue Distribution campaign type.

## Campaign Setup

**Name:** LiquidArc Q1 2026 Revenue Share
**Type:** Revenue Distribution
**Recipients:** 10 (sample)
**Total Payout:** 4,200.00 USDC (10% sample)
**Policy:** No approval required; min treasury 5,000 USDC
**Scheduled:** 2026-04-01 00:00 UTC (auto-scheduled)
**Status flow:** `draft → scheduled → executing → completed`

## Revenue Share Calculation

Allocations computed off-chain as percentage of total LP tokens:

| Recipient   | LP Share | Payout (USDC) | Chain           |
|-------------|----------|---------------|-----------------|
| LP-0x1a2b   | 12.3%    | 516.60        | Arc Testnet     |
| LP-0x3c4d   | 10.1%    | 424.20        | Base Sepolia    |
| LP-0x5e6f   | 9.8%     | 411.60        | Arc Testnet     |
| LP-0x7g8h   | 8.5%     | 357.00        | Avalanche Fuji  |
| LP-0x9i0j   | 7.2%     | 302.40        | Arc Testnet     |
| LP-0xak1l   | 6.9%     | 289.80        | Base Sepolia    |
| LP-0xm2n3   | 6.1%     | 256.20        | Arc Testnet     |
| LP-0xo4p5   | 5.8%     | 243.60        | Avalanche Fuji  |
| LP-0xq6r7   | 5.2%     | 218.40        | Base Sepolia    |
| LP-0xs8t9   | 4.3%     | 180.60        | Arc Testnet     |

**Total:** 4,200.40 USDC across 10 LPs / 3 chains

## Execution Flow

### Step 1: Scheduled Distribution
The campaign was created with `scheduled_at: "2026-04-01T00:00:00Z"`. Status is immediately set to `scheduled`. On April 1st, a cron job (or manual trigger) changes status to `approved` and triggers execution.

### Step 2: No-Approval Fast Path
`policy_requires_approval: false` — distributions execute automatically without manual intervention. This is appropriate for revenue share where amounts are computed deterministically from on-chain data.

### Step 3: Proportional Execution
PointyPay executes all 10 payouts in sequence via Circle Gateway:

```
executeBridgeKitTransfer(walletId, "arcTestnet", entry.destination_chain, entry.amount, entry.address)
```

Each call burns USDC on Arc and mints on the destination chain. No user holds tokens in transit — the Gateway balance is the source of truth.

### Step 4: Audit Trail
Each payout entry is recorded with:
- tx_hash (block explorer verifiable)
- Timestamp
- Chain + recipient address
- Amount down to 6 decimal places

The `transaction_history` table provides full audit log exportable as CSV.

## Efficiency Metrics

| Traditional Bridge | Circle Gateway (PointyPay) |
|--------------------|----------------------------|
| 30-60 min per chain| < 5 min for all chains     |
| Separate approvals | Single campaign execute     |
| Bridging slippage  | 1:1 USDC, no slippage      |
| Manual reconcile   | Automatic audit trail       |

## Narrative

> "LiquidArc's smart contract tallied Q1 revenue. The finance bot computed each LP's share, formatted the CSV, and imported it into PointyPay with a single API call. The campaign was pre-scheduled for April 1st. When the clock ticked midnight UTC, the distribution fired automatically — no human involvement. 120 liquidity providers across three chains received their exact share, down to the cent, within 4 minutes. The protocol's reputation for reliable, transparent distributions was maintained. Gas cost: near zero."
