import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const DELIVERY_CHARGE_INR = 49; // ₹49 flat delivery fee
export const STRIPE_CURRENCY     = "inr";

/** Rupees → paise (Stripe uses smallest currency unit) */
export const toPaise  = (rupees: number) => Math.round(rupees * 100);
/** Paise → rupees */
export const toRupees = (paise: number)  => paise / 100;

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:          { label: "Payment Pending",   color: "text-slate-600 bg-slate-50 border-slate-200"   },
  paid:             { label: "Payment Confirmed", color: "text-blue-700 bg-blue-50 border-blue-200"     },
  confirmed:        { label: "Order Confirmed",   color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  shipped:          { label: "Shipped",           color: "text-violet-700 bg-violet-50 border-violet-200" },
  out_for_delivery: { label: "Out for Delivery",  color: "text-amber-700 bg-amber-50 border-amber-200"  },
  delivered:        { label: "Delivered",         color: "text-green-700 bg-green-50 border-green-200"  },
  cancelled:        { label: "Cancelled",         color: "text-red-700 bg-red-50 border-red-200"        },
  refunded:         { label: "Refunded",          color: "text-pink-700 bg-pink-50 border-pink-200"     },
};
