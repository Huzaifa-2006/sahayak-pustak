"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, books } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { stripe, toPaise, DELIVERY_CHARGE_INR, STRIPE_CURRENCY } from "@/lib/stripe";

// ── Create Stripe Checkout Session ────────────────────────────────────────────
const checkoutSchema = z.object({
  bookId:          z.string().uuid(),
  deliveryType:    z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  deliveryCity:    z.string().optional(),
  deliveryPincode: z.string().optional(),
  deliveryPhone:   z.string().optional(),
});

export type CheckoutState = { error?: string; url?: string };

export async function createStripeCheckout(formData: FormData): Promise<CheckoutState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "You must be logged in." };

  const parsed = checkoutSchema.safeParse({
    bookId:          formData.get("bookId"),
    deliveryType:    formData.get("deliveryType"),
    deliveryAddress: formData.get("deliveryAddress") || undefined,
    deliveryCity:    formData.get("deliveryCity")    || undefined,
    deliveryPincode: formData.get("deliveryPincode") || undefined,
    deliveryPhone:   formData.get("deliveryPhone")   || undefined,
  });
  if (!parsed.success) return { error: "Invalid form data." };

  const data = parsed.data;

  if (data.deliveryType === "delivery") {
    if (!data.deliveryAddress || !data.deliveryCity || !data.deliveryPincode || !data.deliveryPhone)
      return { error: "Please fill in all delivery address fields." };
  }

  const book = await db.query.books.findFirst({
    where: eq(books.id, data.bookId),
    with: { seller: { columns: { id: true, name: true, email: true } } },
  });

  if (!book)                             return { error: "Book not found." };
  if (book.isSold)                       return { error: "This book has already been sold." };
  if (book.isDonation)                   return { error: "Donated books are free — contact the donor directly." };
  if (book.sellerId === session.user.id) return { error: "You cannot buy your own book." };

  const deliveryCharge = data.deliveryType === "delivery" ? DELIVERY_CHARGE_INR : 0;
  const totalAmount    = book.price + deliveryCharge;

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode:     "payment",
    currency: STRIPE_CURRENCY,
    line_items: [
      {
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: {
            name: book.title,
            description: `by ${book.author} · Semester ${book.semester} · Condition: ${book.condition}`,
          },
          unit_amount: toPaise(book.price),
        },
        quantity: 1,
      },
      ...(deliveryCharge > 0 ? [{
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: { name: "Home Delivery Charge" },
          unit_amount: toPaise(deliveryCharge),
        },
        quantity: 1,
      }] : []),
    ],
    success_url: `${process.env.NEXTAUTH_URL}/orders/{CHECKOUT_SESSION_ID}?success=true`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/books/${book.id}?cancelled=true`,
    customer_email: session.user.email ?? undefined,
    metadata: { bookId: book.id, buyerId: session.user.id, sellerId: book.sellerId },
  });

  // Save pending order in DB
  await db.insert(orders).values({
    bookId:   book.id,
    buyerId:  session.user.id,
    sellerId: book.sellerId,
    stripeSessionId: stripeSession.id,
    amount:         toPaise(book.price),
    deliveryCharge: toPaise(deliveryCharge),
    totalAmount:    toPaise(totalAmount),
    status:       "pending",
    deliveryType: data.deliveryType,
    deliveryAddress: data.deliveryAddress,
    deliveryCity:    data.deliveryCity,
    deliveryPincode: data.deliveryPincode,
    deliveryPhone:   data.deliveryPhone,
  });

  return { url: stripeSession.url! };
}

// ── Update Order Status (seller only) ────────────────────────────────────────
export async function updateOrderStatus(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const orderId           = formData.get("orderId") as string;
  const status            = formData.get("status")  as string;
  const trackingId        = (formData.get("trackingId")        as string) || null;
  const estimatedDelivery = (formData.get("estimatedDelivery") as string) || null;
  const sellerNote        = (formData.get("sellerNote")        as string) || null;

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.sellerId, session.user.id)),
  });
  if (!order) throw new Error("Order not found or access denied");

  await db.update(orders).set({
    status:            status as any,
    trackingId:        trackingId        ?? order.trackingId,
    estimatedDelivery: estimatedDelivery ?? order.estimatedDelivery,
    sellerNote:        sellerNote        ?? order.sellerNote,
    deliveredAt:       status === "delivered" ? new Date() : order.deliveredAt,
    updatedAt:         new Date(),
  }).where(eq(orders.id, orderId));

  revalidatePath(`/orders/${orderId}`);
}

// ── Queries ───────────────────────────────────────────────────────────────────
export async function getMyOrders(userId: string) {
  const [bought, sold] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.buyerId, userId),
      with: {
        book:   { columns: { id: true, title: true, imageUrl: true } },
        seller: { columns: { id: true, name: true } },
      },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    }),
    db.query.orders.findMany({
      where: eq(orders.sellerId, userId),
      with: {
        book:  { columns: { id: true, title: true, imageUrl: true } },
        buyer: { columns: { id: true, name: true } },
      },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    }),
  ]);
  return { bought, sold };
}

export async function getOrderById(orderId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      book:   true,
      buyer:  { columns: { id: true, name: true, email: true, image: true } },
      seller: { columns: { id: true, name: true, email: true, image: true } },
    },
  });
}
