import { relations } from "drizzle-orm";
import {
  pgTable, text, timestamp, integer, boolean,
  pgEnum, uuid, primaryKey, index,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// ========================
// Enums
// ========================
export const bookConditionEnum = pgEnum("book_condition", ["new", "good", "fair"]);
export const orderStatusEnum   = pgEnum("order_status", [
  "pending", "paid", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded",
]);
export const deliveryTypeEnum  = pgEnum("delivery_type", ["pickup", "delivery"]);

// ========================
// NextAuth Tables
// ========================
export const users = pgTable("users", {
  id:                 uuid("id").defaultRandom().primaryKey(),
  name:               text("name"),
  email:              text("email").notNull().unique(),
  emailVerified:      timestamp("email_verified", { mode: "date" }),
  image:              text("image"),
  karmaPoints:        integer("karma_points").notNull().default(0),
  totalBooksDonated:  integer("total_books_donated").notNull().default(0),
  totalNotesUploaded: integer("total_notes_uploaded").notNull().default(0),
  createdAt:          timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").$type<AdapterAccount["type"]>().notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// ========================
// Books Table
// ========================
export const books = pgTable("books", {
  id:             uuid("id").defaultRandom().primaryKey(),
  title:          text("title").notNull(),
  author:         text("author").notNull(),
  subject:        text("subject").notNull(),
  semester:       integer("semester").notNull(),
  condition:      bookConditionEnum("condition").notNull(),
  price:          integer("price").notNull().default(0),
  imageUrl:       text("image_url"),
  pickupLocation: text("pickup_location"),
  isDonation:     boolean("is_donation").notNull().default(false),
  isSold:         boolean("is_sold").notNull().default(false),   // NEW
  sellerId:       uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  sellerIdx:   index("books_seller_idx").on(table.sellerId),
  semesterIdx: index("books_semester_idx").on(table.semester),
  donationIdx: index("books_donation_idx").on(table.isDonation),
}));

// ========================
// Notes Table
// ========================
export const notes = pgTable("notes", {
  id:            uuid("id").defaultRandom().primaryKey(),
  title:         text("title").notNull(),
  subject:       text("subject").notNull(),
  semester:      integer("semester").notNull(),
  description:   text("description"),
  fileUrl:       text("file_url").notNull(),
  uploaderId:    uuid("uploader_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uploaderIdx: index("notes_uploader_idx").on(table.uploaderId),
  semesterIdx: index("notes_semester_idx").on(table.semester),
}));

// ========================
// Orders Table (Stripe)
// ========================
export const orders = pgTable("orders", {
  id:       uuid("id").defaultRandom().primaryKey(),
  bookId:   uuid("book_id").notNull().references(() => books.id),
  buyerId:  uuid("buyer_id").notNull().references(() => users.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),

  // Stripe fields
  stripeSessionId:       text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeRefundId:        text("stripe_refund_id"),

  // Amounts stored in paise (₹1 = 100 paise)
  amount:         integer("amount").notNull(),
  deliveryCharge: integer("delivery_charge").notNull().default(0),
  totalAmount:    integer("total_amount").notNull(),

  status:       orderStatusEnum("status").notNull().default("pending"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("pickup"),

  // Delivery address
  deliveryAddress: text("delivery_address"),
  deliveryCity:    text("delivery_city"),
  deliveryPincode: text("delivery_pincode"),
  deliveryPhone:   text("delivery_phone"),

  // Tracking
  trackingId:        text("tracking_id"),
  estimatedDelivery: text("estimated_delivery"),
  deliveredAt:       timestamp("delivered_at"),
  sellerNote:        text("seller_note"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  buyerIdx:  index("orders_buyer_idx").on(table.buyerId),
  sellerIdx: index("orders_seller_idx").on(table.sellerId),
  bookIdx:   index("orders_book_idx").on(table.bookId),
  statusIdx: index("orders_status_idx").on(table.status),
}));

// ========================
// Types
// ========================
export type User  = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Book  = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Note  = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Order = typeof orders.$inferSelect;

export type BookWithSeller   = Book & { seller: Pick<User, "id" | "name" | "image"> };
export type NoteWithUploader = Note & { uploader: Pick<User, "id" | "name" | "image"> };

// ========================
// Relations
// ========================
export const usersRelations = relations(users, ({ many }) => ({
  accounts:     many(accounts),
  sessions:     many(sessions),
  books:        many(books),
  notes:        many(notes),
  buyerOrders:  many(orders, { relationName: "buyerOrders" }),
  sellerOrders: many(orders, { relationName: "sellerOrders" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const booksRelations = relations(books, ({ one }) => ({
  seller: one(users, { fields: [books.sellerId], references: [users.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  uploader: one(users, { fields: [notes.uploaderId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  book:   one(books, { fields: [orders.bookId],   references: [books.id] }),
  buyer:  one(users, { fields: [orders.buyerId],  references: [users.id], relationName: "buyerOrders" }),
  seller: one(users, { fields: [orders.sellerId], references: [users.id], relationName: "sellerOrders" }),
}));
