"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_CHAINS, CHAIN_NAMES } from "@/lib/chain-config";
import type { Recipient } from "@/types/recipient";
import type { CampaignType, CreateCampaignPayload } from "@/types/campaign";
import { CAMPAIGN_TYPE_LABELS } from "@/types/campaign";
import { formatUsdc } from "@/lib/utils";
import { toast } from "sonner";

interface EntryRow {
  recipient_id?: string;
  recipient_name: string;
  amount: string;
  destination_chain: string;
  destination_address: string;
}

const STEPS = ["Type & Details", "Recipients", "Policy", "Review"];

export function CampaignForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Step 1
  const [name, setName] = useState("");
  const [type, setType] = useState<CampaignType>("payroll");
  const [description, setDescription] = useState("");

  // Step 2
  const [entries, setEntries] = useState<EntryRow[]>([
    { recipient_name: "", amount: "", destination_chain: "arcTestnet", destination_address: "" },
  ]);

  // Step 3
  const [policyMinTreasury, setPolicyMinTreasury] = useState("");
  const [policyRequiresApproval, setPolicyRequiresApproval] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    fetch("/api/recipients")
      .then((r) => r.json())
      .then((d) => setRecipients(d.recipients ?? []))
      .catch(() => {});
  }, []);

  const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const addEntry = () =>
    setEntries([...entries, { recipient_name: "", amount: "", destination_chain: "arcTestnet", destination_address: "" }]);

  const removeEntry = (i: number) => setEntries(entries.filter((_, idx) => idx !== i));

  const updateEntry = (i: number, field: keyof EntryRow, value: string) => {
    const updated = [...entries];
    if (field === "recipient_id") {
      const r = recipients.find((r) => r.id === value);
      if (r) {
        updated[i] = {
          ...updated[i],
          recipient_id: r.id,
          recipient_name: r.name,
          destination_address: r.wallet_address,
          destination_chain: r.preferred_chain,
          amount: r.default_amount ? String(r.default_amount) : updated[i].amount,
        };
      }
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }
    setEntries(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: CreateCampaignPayload = {
        name,
        type,
        description: description || undefined,
        entries: entries.map((e) => ({
          recipient_id: e.recipient_id,
          recipient_name: e.recipient_name,
          amount: parseFloat(e.amount),
          destination_chain: e.destination_chain,
          destination_address: e.destination_address,
        })),
        policy_min_treasury: policyMinTreasury ? parseFloat(policyMinTreasury) : undefined,
        policy_requires_approval: policyRequiresApproval,
        scheduled_at: scheduledAt || undefined,
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create campaign");

      toast.success("Campaign created", { description: `${name} is ready to be approved.` });
      router.push(`/dashboard/campaigns/${data.campaign.id}`);
    } catch (err: any) {
      toast.error("Failed to create campaign", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold ${i === step ? "bg-primary text-white" : i < step ? "bg-primary/20 text-primary" : "bg-surface-hover text-text-muted"}`}>
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? "text-text-primary font-medium" : "text-text-muted"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Type & Details */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CampaignType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(CAMPAIGN_TYPE_LABELS) as [CampaignType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="March 2026 Payroll" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Monthly contractor payments" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Recipients */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Payout Recipients</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {entries.map((entry, i) => (
              <div key={i} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-muted">Recipient {i + 1}</span>
                  {entries.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeEntry(i)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>

                {recipients.length > 0 && (
                  <div className="space-y-2">
                    <Label>From Saved Recipients</Label>
                    <Select onValueChange={(v) => updateEntry(i, "recipient_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Select saved recipient..." /></SelectTrigger>
                      <SelectContent>
                        {recipients.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name} ({CHAIN_NAMES[r.preferred_chain]})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={entry.recipient_name} onChange={(e) => updateEntry(i, "recipient_name", e.target.value)} placeholder="Alice" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (USDC)</Label>
                    <Input type="number" step="0.01" value={entry.amount} onChange={(e) => updateEntry(i, "amount", e.target.value)} placeholder="100.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input value={entry.destination_address} onChange={(e) => updateEntry(i, "destination_address", e.target.value)} placeholder="0x..." className="font-mono" />
                </div>

                <div className="space-y-2">
                  <Label>Destination Chain</Label>
                  <Select value={entry.destination_chain} onValueChange={(v) => updateEntry(i, "destination_chain", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CHAINS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addEntry} className="w-full">
              <Plus className="h-4 w-4" /> Add Recipient
            </Button>

            <div className="flex justify-between text-sm font-mono border-t border-border pt-3">
              <span className="text-text-muted">Total</span>
              <span className="text-primary font-bold">{formatUsdc(totalAmount, 2)} USDC</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Policy */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Payout Policy</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Require Approval</p>
                <p className="text-xs text-text-muted">Campaign must be manually approved before execution</p>
              </div>
              <Switch checked={policyRequiresApproval} onCheckedChange={setPolicyRequiresApproval} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Treasury Balance (USDC)</Label>
              <Input type="number" step="0.01" value={policyMinTreasury} onChange={(e) => setPolicyMinTreasury(e.target.value)} placeholder="Leave blank for no minimum" />
              <p className="text-xs text-text-muted">Execution will be blocked if gateway balance is below this amount</p>
            </div>
            <div className="space-y-2">
              <Label>Schedule Date (optional)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              <p className="text-xs text-text-muted">Moves campaign to "Scheduled" status immediately</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Review & Create</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-muted">Name</span><p className="font-medium text-text-primary mt-0.5">{name}</p></div>
              <div><span className="text-text-muted">Type</span><p className="font-medium text-text-primary mt-0.5">{CAMPAIGN_TYPE_LABELS[type]}</p></div>
              <div><span className="text-text-muted">Recipients</span><p className="font-medium text-text-primary mt-0.5">{entries.length}</p></div>
              <div><span className="text-text-muted">Total</span><p className="font-mono font-bold text-primary mt-0.5">{formatUsdc(totalAmount, 2)} USDC</p></div>
              <div><span className="text-text-muted">Requires Approval</span><p className="font-medium text-text-primary mt-0.5">{policyRequiresApproval ? "Yes" : "No"}</p></div>
              {policyMinTreasury && <div><span className="text-text-muted">Min Treasury</span><p className="font-mono text-primary mt-0.5">{formatUsdc(parseFloat(policyMinTreasury), 2)} USDC</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !name.trim()}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}
