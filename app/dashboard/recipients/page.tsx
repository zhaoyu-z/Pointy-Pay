"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipientsTable } from "@/components/recipients/recipients-table";
import { RecipientForm } from "@/components/recipients/recipient-form";
import { EditRecipientDialog } from "@/components/recipients/edit-recipient-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Recipient } from "@/types/recipient";
import { toast } from "sonner";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchRecipients = useCallback(async () => {
    try {
      const res = await fetch("/api/recipients");
      const data = await res.json();
      setRecipients(data.recipients ?? []);
    } catch {
      toast.error("Failed to load recipients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/recipients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRecipients((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recipient removed");
    } catch (err: any) {
      toast.error("Failed to remove recipient", { description: err.message });
    }
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setEditOpen(true);
  };

  const handleEditSuccess = (updated: Recipient) => {
    setRecipients((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Recipients</h1>
        <p className="text-sm text-text-muted mt-1">
          Saved payout recipients for reuse across campaigns
        </p>
      </div>

      <RecipientForm onSuccess={fetchRecipients} />

      <Card>
        <CardHeader>
          <CardTitle>
            Saved Recipients{" "}
            {!loading && (
              <span className="text-text-muted font-normal text-sm">({recipients.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <RecipientsTable
              recipients={recipients}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <EditRecipientDialog
        recipient={editingRecipient}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
