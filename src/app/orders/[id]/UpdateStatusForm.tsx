"use client";

import { updateOrderStatus } from "@/actions/orders";
import { useState } from "react";
import toast from "react-hot-toast";

const NEXT_STATUS: Record<string, { value: string; label: string; danger?: boolean }[]> = {
  paid:             [{ value: "confirmed",        label: "Confirm Order" },       { value: "cancelled", label: "Cancel Order", danger: true }],
  confirmed:        [{ value: "shipped",          label: "Mark as Shipped" },     { value: "cancelled", label: "Cancel Order", danger: true }],
  shipped:          [{ value: "out_for_delivery", label: "Out for Delivery" }],
  out_for_delivery: [{ value: "delivered",        label: "Mark as Delivered" }],
};

export default function UpdateStatusForm({
  orderId, currentStatus, deliveryType,
}: {
  orderId: string; currentStatus: string; deliveryType: string;
}) {
  const [selected, setSelected] = useState<string>(NEXT_STATUS[currentStatus]?.[0]?.value ?? "");
  const [loading, setLoading]   = useState(false);

  const nextOptions = NEXT_STATUS[currentStatus] ?? [];
  if (nextOptions.length === 0) return null;

  const showTracking = deliveryType === "delivery" && selected === "shipped";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOrderStatus(new FormData(e.currentTarget));
      toast.success("Order status updated!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Update Order Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="orderId" value={orderId} />

        {/* Status buttons */}
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => setSelected(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                selected === opt.value
                  ? opt.danger ? "bg-red-600 text-white border-red-600" : "bg-brand-600 text-white border-brand-600"
                  : opt.danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="status" value={selected} />

        {/* Tracking (only when marking shipped) */}
        {showTracking && (
          <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <input name="trackingId" placeholder="Tracking ID (optional)" className="input w-full bg-white" />
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Estimated Delivery Date</label>
              <input name="estimatedDelivery" type="date" className="input w-full bg-white" />
            </div>
          </div>
        )}

        {/* Seller note */}
        <textarea name="sellerNote" rows={2} maxLength={500}
          placeholder="Add a note for the buyer (optional)"
          className="input w-full resize-none" />

        <button type="submit" disabled={loading}
          className="btn-primary w-full disabled:opacity-60">
          {loading ? "Updating…" : "Update Status"}
        </button>
      </form>
    </div>
  );
}
