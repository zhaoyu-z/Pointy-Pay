# Simulation: Emergency Treasury Settlement — Bridge Exploit Response

## Scenario

Cross-chain exchange "BridgeEx" suffered a partial exploit at 02:14 UTC on March 15, 2026. $180,000 in user funds were at risk on Avalanche Fuji. The security team needed to immediately settle 35 affected user accounts by sending them USDC from the protocol's Arc Testnet treasury — within 15 minutes to prevent further damage.

This simulation demonstrates Fund Settlement: the highest-urgency campaign type in PointyPay.

## Campaign Setup

**Name:** Emergency Settlement — Bridge Exploit 2026-03-15
**Type:** Fund Settlement
**Recipients:** 12 (sample of 35 total)
**Total Payout:** 28,400.00 USDC (sample)
**Policy:** No approval; no min treasury check; execute immediately
**Status flow:** `draft → executing → completed` (approval skipped for emergency)

## Urgency Configuration

Fund settlement campaigns skip the approval gate:
- `policy_requires_approval: false`
- `policy_min_treasury: null` (emergency overrides balance check)
- No scheduled date — immediate execution

The team creates the campaign via the PointyPay UI in 90 seconds by bulk-importing the affected wallet list from the incident log.

## Affected Accounts (Sample)

| Account    | Loss (USDC)  | Destination Chain  | Priority |
|------------|--------------|---------------------|----------|
| 0xU001     | 4,200.00     | Avalanche Fuji      | Critical |
| 0xU002     | 3,800.00     | Avalanche Fuji      | Critical |
| 0xU003     | 3,100.00     | Base Sepolia        | High     |
| 0xU004     | 2,900.00     | Avalanche Fuji      | High     |
| 0xU005     | 2,600.00     | Arc Testnet         | High     |
| 0xU006     | 2,400.00     | Avalanche Fuji      | Medium   |
| 0xU007     | 2,100.00     | Base Sepolia        | Medium   |
| 0xU008     | 1,900.00     | Avalanche Fuji      | Medium   |
| 0xU009     | 1,700.00     | Arc Testnet         | Medium   |
| 0xU010     | 1,500.00     | Base Sepolia        | Low      |
| 0xU011     | 1,300.00     | Avalanche Fuji      | Low      |
| 0xU012     | 900.00       | Arc Testnet         | Low      |

**Total:** 28,400.00 USDC

## Execution Timeline

```
02:14 UTC   Exploit detected by monitoring
02:16 UTC   Security team triggered; wallet list compiled from logs
02:19 UTC   Campaign created in PointyPay (90 seconds UI entry)
02:21 UTC   Campaign executed — first 6 payouts complete
02:23 UTC   All 12 settlements confirmed on-chain
02:23 UTC   Full incident report available via PointyPay audit log
```

**Total response time: 9 minutes from detection to settlement completion.**

## Technical Execution Details

Circle Gateway enabled the speed:

1. **No bridge latency**: Funds settle on Avalanche Fuji within seconds of burn on Arc — no validator wait times
2. **No liquidity constraints**: Gateway is backed by Circle's unified USDC reserve — $28,400 settles without slippage
3. **Atomic per-entry**: Each settlement is independent — a failure on one entry doesn't block others
4. **Transparent proof**: Every settlement has an on-chain tx hash, linked directly in the PointyPay UI

## Without PointyPay (Traditional Process)

| Step                              | Manual Time     |
|-----------------------------------|-----------------|
| Compile affected wallet list      | 20 min          |
| Source USDC liquidity on Fuji     | 30-60 min       |
| Submit 35 bridge transactions     | 45 min          |
| Wait for bridge confirmation      | 15-30 min       |
| Reconcile + verify receipts       | 60 min          |
| **Total**                         | **2.5–3 hours** |

## Post-Incident Audit

PointyPay's `transaction_history` table provides:
- Complete list of settlement payouts with timestamps
- Chain + address for each affected user
- Tx hash verifiable on block explorer
- Status: `confirmed` or `failed` (with error reason)

This audit trail satisfies regulatory requirements and enables the team to publish a complete transparency report within minutes.

## Narrative

> "The alert fires at 2:14. Marcos, the on-call incident commander, opens PointyPay. He pastes the affected wallet list — 35 addresses, 35 amounts — into the bulk import. Two minutes later, he hits Execute. No waiting for bridge confirmations. No worrying about Fuji liquidity. The Circle Gateway burns USDC on Arc and mints it natively on Avalanche Fuji. By 2:23, every affected user has received their full compensation. Marcos posts the settlement proof — a PointyPay report with 35 tx hashes — in the community Discord. The protocol's trust score actually increases."
