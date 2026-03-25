import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// ========================
// Enums
// ========================
export const bookConditionEnum = pgEnum("book_condition", ["new", "good", "fair"]);

// ========================
// NextAuth Tables
// ========================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  karmaPoints: integer("karma_points").notNull().default(0),
  totalBooksDonated: integer("total_books_donated").notNull().default(0),
  totalNotesUploaded: integer("total_notes_uploaded").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ========================
// Books Table
// ========================
export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    subject: text("subject").notNull(),
    semester: integer("semester").notNull(),
    condition: bookConditionEnum("condition").notNull(),
    price: integer("price").notNull().default(0),
    imageUrl: text("image_url"),
    pickupLocation: text("pickup_location"),
    isDonation: boolean("is_donation").notNull().default(false),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    sellerIdx: index("books_seller_idx").on(table.sellerId),
    semesterIdx: index("books_semester_idx").on(table.semester),
    donationIdx: index("books_donation_idx").on(table.isDonation),
  })
);

// ========================
// Notes Table
// ========================
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    semester: integer("semester").notNull(),
    description: text("description"),
    fileUrl: text("file_url").notNull(),
    uploaderId: uuid("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    downloadCount: integer("download_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uploaderIdx: index("notes_uploader_idx").on(table.uploaderId),
    semesterIdx: index("notes_semester_idx").on(table.semester),
  })
);

// ========================
// Types
// ========================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type BookWithSeller = Book & {
  seller: Pick<User, "id" | "name" | "image">;
};

export type NoteWithUploader = Note & {
  uploader: Pick<User, "id" | "name" | "image">;
};

// ========================
// Relations
// ========================
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  books: many(books),
  notes: many(notes),
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
