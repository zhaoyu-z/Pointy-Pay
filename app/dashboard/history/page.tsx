"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryTable } from "@/components/transactions/history-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/transactions?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d.transactions ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => toast.error("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transaction History</h1>
        <p className="text-sm text-text-muted mt-1">
          All USDC movements across your PointyPay account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Transactions{" "}
            {!loading && (
              <span className="text-text-muted font-normal text-sm">({total})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <HistoryTable transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
