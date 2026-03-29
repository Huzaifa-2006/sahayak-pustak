"use client";

import { useState } from "react";
import { createStripeCheckout } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";
import { X, Truck, MapPin, CreditCard, Shield, Package } from "lucide-react";
import toast from "react-hot-toast";

const DELIVERY_CHARGE = 49;

type Props = {
  book: {
    id: string;
    title: string;
    price: number;
    pickupLocation?: string | null;
  };
};

export default function CheckoutModal({ book }: Props) {
  const [open, setOpen]             = useState(false);
  const [deliveryType, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [loading, setLoading]       = useState(false);

  const charge = deliveryType === "delivery" ? DELIVERY_CHARGE : 0;
  const total  = book.price + charge;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await createStripeCheckout(fd);
      if (result.error) { toast.error(result.error); setLoading(false); return; }
      window.location.href = result.url!;   // redirect to Stripe hosted checkout
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full py-3">
        <CreditCard className="h-4 w-4" /> Buy Now
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-display text-lg font-bold text-slate-900">Complete Purchase</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <input type="hidden" name="bookId"       value={book.id} />
              <input type="hidden" name="deliveryType" value={deliveryType} />

              {/* Book summary */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900 truncate">{book.title}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(book.price)}</p>
              </div>

              {/* Delivery toggle */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Delivery Option</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "pickup",   icon: Package, label: "Self Pickup",    sub: "FREE" },
                    { value: "delivery", icon: Truck,   label: "Home Delivery",  sub: `+₹${DELIVERY_CHARGE}` },
                  ] as const).map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setDelivery(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                        deliveryType === opt.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>
                      <opt.icon className="h-5 w-5" />
                      <span>{opt.label}</span>
                      <span className={`text-xs font-semibold ${opt.value === "pickup" ? "text-green-600" : "text-slate-500"}`}>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup location hint */}
              {deliveryType === "pickup" && book.pickupLocation && (
                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3">
                  <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-0.5">Pickup Location</p>
                    <p className="text-sm text-slate-700">{book.pickupLocation}</p>
                  </div>
                </div>
              )}

              {/* Delivery address */}
              {deliveryType === "delivery" && (
                <div className="space-y-3">
                  <input name="deliveryAddress" required placeholder="Full address *" className="input w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="deliveryCity"    required placeholder="City *"    className="input" />
                    <input name="deliveryPincode" required placeholder="Pincode *" className="input" />
                  </div>
                  <input name="deliveryPhone" required placeholder="Phone number *" className="input w-full" />
                </div>
              )}

              {/* Price summary */}
              <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Book price</span><span>{formatCurrency(book.price)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span><span>{charge > 0 ? `₹${charge}` : "FREE"}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? "Redirecting to Stripe…"
                  : <><CreditCard className="h-4 w-4" /> Pay {formatCurrency(total)} with Stripe</>
                }
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Shield className="h-3.5 w-3.5" /> Secured by Stripe · SSL encrypted
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
