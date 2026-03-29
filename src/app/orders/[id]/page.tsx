import { notFound, redirect } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toRupees, ORDER_STATUS_LABELS } from "@/lib/stripe";
import UpdateStatusForm from "./UpdateStatusForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Order Details" };

const STEPS = [
  { key: "paid",             label: "Payment Confirmed", icon: CreditCard   },
  { key: "confirmed",        label: "Order Confirmed",   icon: CheckCircle  },
  { key: "shipped",          label: "Shipped",           icon: Package      },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: Truck        },
  { key: "delivered",        label: "Delivered",         icon: CheckCircle  },
];
const STATUS_ORDER = ["pending","paid","confirmed","shipped","out_for_delivery","delivered"];

export default async function OrderPage({
  params, searchParams,
}: { params: { id: string }; searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const order = await getOrderById(params.id);
  if (!order) notFound();

  const isBuyer  = session.user.id === order.buyerId;
  const isSeller = session.user.id === order.sellerId;
  if (!isBuyer && !isSeller) notFound();

  const statusMeta   = ORDER_STATUS_LABELS[order.status] ?? ORDER_STATUS_LABELS.pending;
  const isFinalState = ["delivered","cancelled","refunded"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {searchParams.success && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
          🎉 Payment successful! Your order has been confirmed.
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Order Details</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`badge border px-3 py-1.5 text-xs font-semibold ${statusMeta.color}`}>
          {statusMeta.label}
        </span>
      </div>

      {/* Progress tracker — only for delivery orders that are paid */}
      {order.deliveryType === "delivery" && !["cancelled","refunded","pending"].includes(order.status) && (
        <div className="card p-6 mb-5">
          <div className="relative flex items-start justify-between">
            {/* Background line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200" />
            {/* Progress line */}
            <div className="absolute top-4 left-4 h-0.5 bg-brand-500 transition-all"
              style={{ width: `${Math.max(0, (STATUS_ORDER.indexOf(order.status) - 1) / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((step) => {
              const done = STATUS_ORDER.indexOf(order.status) >= STATUS_ORDER.indexOf(step.key);
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${done ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${done ? "text-brand-700 font-semibold" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Book */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Book</h2>
          <Link href={`/books/${order.book.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{order.book.title}</p>
              <p className="text-xs text-brand-600 mt-0.5">View listing →</p>
            </div>
          </Link>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Book price</span><span>₹{toRupees(order.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span>{order.deliveryCharge > 0 ? `₹${toRupees(order.deliveryCharge)}` : "FREE (Self Pickup)"}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total paid</span><span>₹{toRupees(order.totalAmount)}</span>
            </div>
            {order.stripePaymentIntentId && (
              <p className="text-xs text-slate-400 pt-1 font-mono">
                Payment ID: {order.stripePaymentIntentId}
              </p>
            )}
          </div>
        </div>

        {/* Delivery / Pickup */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {order.deliveryType === "pickup" ? "Pickup" : "Delivery"} Details
          </h2>
          {order.deliveryType === "pickup" ? (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-700">Self Pickup</p>
                <p className="text-slate-500 mt-0.5">{order.book.pickupLocation ?? "Contact seller for pickup location"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm text-slate-700">
              <p>{order.deliveryAddress}</p>
              <p>{order.deliveryCity} — {order.deliveryPincode}</p>
              <p>📞 {order.deliveryPhone}</p>
              {order.trackingId && (
                <p className="pt-1">Tracking ID: <span className="font-mono font-semibold text-brand-700">{order.trackingId}</span></p>
              )}
              {order.estimatedDelivery && (
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> Expected by {order.estimatedDelivery}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {isBuyer ? "Seller" : "Buyer"} Contact
          </h2>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-slate-900">{isBuyer ? order.seller.name : order.buyer.name}</p>
            <a href={`mailto:${isBuyer ? order.seller.email : order.buyer.email}`}
              className="text-brand-600 hover:underline">
              {isBuyer ? order.seller.email : order.buyer.email}
            </a>
          </div>
        </div>

        {/* Seller note */}
        {order.sellerNote && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
            <p className="font-semibold text-amber-800 mb-1">Note from seller</p>
            <p className="text-amber-700">{order.sellerNote}</p>
          </div>
        )}

        {/* Seller update controls */}
        {isSeller && !isFinalState && order.status !== "pending" && (
          <UpdateStatusForm
            orderId={order.id}
            currentStatus={order.status}
            deliveryType={order.deliveryType}
          />
        )}
      </div>
    </div>
  );
}
