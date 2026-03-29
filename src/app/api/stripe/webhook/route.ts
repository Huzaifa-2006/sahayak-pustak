import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, books } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Payment completed successfully
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripeSessionId, session.id));

      if (order && order.status === "pending") {
        await db.update(orders).set({
          status:                "paid",
          stripePaymentIntentId: session.payment_intent as string,
          updatedAt:             new Date(),
        }).where(eq(orders.id, order.id));

        await db.update(books)
          .set({ isSold: true })
          .where(eq(books.id, order.bookId));
      }
    }
  }

  // Refund issued
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    await db.update(orders).set({
      status:        "refunded",
      stripeRefundId: charge.refunds?.data?.[0]?.id,
      updatedAt:     new Date(),
    }).where(eq(orders.stripePaymentIntentId, charge.payment_intent as string));
  }

  return NextResponse.json({ received: true });
}
