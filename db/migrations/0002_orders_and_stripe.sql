-- Add isSold column to books
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "is_sold" boolean NOT NULL DEFAULT false;

-- Create enums
DO $$ BEGIN
  CREATE TYPE "order_status" AS ENUM ('pending','paid','confirmed','shipped','out_for_delivery','delivered','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "delivery_type" AS ENUM ('pickup','delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "book_id"                 uuid NOT NULL REFERENCES "books"("id"),
  "buyer_id"                uuid NOT NULL REFERENCES "users"("id"),
  "seller_id"               uuid NOT NULL REFERENCES "users"("id"),
  "stripe_session_id"       text UNIQUE,
  "stripe_payment_intent_id" text,
  "stripe_refund_id"        text,
  "amount"                  integer NOT NULL,
  "delivery_charge"         integer NOT NULL DEFAULT 0,
  "total_amount"            integer NOT NULL,
  "status"                  "order_status" NOT NULL DEFAULT 'pending',
  "delivery_type"           "delivery_type" NOT NULL DEFAULT 'pickup',
  "delivery_address"        text,
  "delivery_city"           text,
  "delivery_pincode"        text,
  "delivery_phone"          text,
  "tracking_id"             text,
  "estimated_delivery"      text,
  "delivered_at"            timestamp,
  "seller_note"             text,
  "created_at"              timestamp NOT NULL DEFAULT now(),
  "updated_at"              timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "orders_buyer_idx"  ON "orders"("buyer_id");
CREATE INDEX IF NOT EXISTS "orders_seller_idx" ON "orders"("seller_id");
CREATE INDEX IF NOT EXISTS "orders_book_idx"   ON "orders"("book_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
