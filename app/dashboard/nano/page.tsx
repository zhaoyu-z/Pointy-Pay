import { NanoSendForm } from "@/components/nano/nano-send-form";

export const metadata = { title: "Nano Send — PointyPay" };

export default function NanoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nano Send</h1>
        <p className="text-sm text-text-muted mt-1">
          Instant cross-chain USDC nanopayments via Circle Gateway
        </p>
      </div>

      <NanoSendForm />

      <div className="max-w-lg mx-auto rounded-xl p-5 space-y-3 glass-card">
        <h2 className="text-sm font-semibold text-text-primary">How Nano Send works</h2>
        <ol className="space-y-2 text-xs text-text-muted list-decimal list-inside">
          <li>You specify a recipient address, amount, and destination chain</li>
          <li>PointyPay initiates a Circle Gateway burn on Arc Testnet</li>
          <li>The Gateway mints equivalent USDC on the destination chain</li>
          <li>Settlement completes in seconds — no bridging delays</li>
        </ol>
        <p className="text-xs text-text-muted">
          Powered by Circle&apos;s unified USDC Gateway infrastructure — the same technology
          behind Circle Nanopayments.
        </p>
      </div>
    </div>
  );
}
