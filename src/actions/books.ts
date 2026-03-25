"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { books, users } from "../../db/schema";
import { eq, sql, and, ilike, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { KARMA_REWARDS, generateFilePath } from "@/lib/utils";
import { uploadFile, BUCKETS } from "@/lib/supabase";

const bookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  author: z.string().min(2, "Author is required").max(100),
  subject: z.string().min(1, "Subject is required"),
  semester: z.coerce.number().int().min(1).max(8),
  condition: z.enum(["new", "good", "fair"]),
  price: z.coerce.number().int().min(0).max(5000),
  isDonation: z.boolean().default(false),
  pickupLocation: z.string().min(3, "Pickup location is required").max(300),
});

export type BookFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  bookId?: string;
};

export async function createBook(formData: FormData): Promise<BookFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to list a book." };
  }

  const isDonation = formData.get("isDonation") === "true";
  const raw = {
    title: formData.get("title"),
    author: formData.get("author"),
    subject: formData.get("subject"),
    semester: formData.get("semester"),
    condition: formData.get("condition"),
    price: isDonation ? "0" : formData.get("price"),
    isDonation,
    pickupLocation: formData.get("pickupLocation"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the form errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  if (data.isDonation && data.price !== 0) {
    return { success: false, error: "Donated books must be free." };
  }

  let imageUrl: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed." };
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image must be under 5MB." };
    }
    const filePath = generateFilePath(session.user.id, imageFile.name, "");
    imageUrl = await uploadFile(BUCKETS.BOOK_IMAGES, filePath, imageFile);
  }

  const [newBook] = await db
    .insert(books)
    .values({
      title: data.title,
      author: data.author,
      subject: data.subject,
      semester: data.semester,
      condition: data.condition,
      price: data.price,
      isDonation: data.isDonation,
      pickupLocation: data.pickupLocation,
      imageUrl,
      sellerId: session.user.id,
    })
    .returning({ id: books.id });

  if (data.isDonation) {
    await db
      .update(users)
      .set({
        karmaPoints: sql`${users.karmaPoints} + ${KARMA_REWARDS.BOOK_DONATION}`,
        totalBooksDonated: sql`${users.totalBooksDonated} + 1`,
      })
      .where(eq(users.id, session.user.id));
  }

  revalidatePath("/books");
  revalidatePath("/books/donations");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return { success: true, bookId: newBook.id };
}

export async function getBooks(params: {
  semester?: number;
  subject?: string;
  search?: string;
  isDonation?: boolean;
  page?: number;
  limit?: number;
}) {
  const { semester, subject, search, isDonation = false, page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(books.isDonation, isDonation)];
  if (semester) conditions.push(eq(books.semester, semester));
  if (subject) conditions.push(eq(books.subject, subject));
  if (search) conditions.push(ilike(books.title, `%${search}%`));

  return db.query.books.findMany({
    where: and(...conditions),
    with: { seller: { columns: { id: true, name: true, image: true } } },
    orderBy: [desc(books.createdAt)],
    limit,
    offset,
  });
}

export async function getBookById(id: string) {
  return db.query.books.findFirst({
    where: eq(books.id, id),
    with: {
      seller: { columns: { id: true, name: true, image: true, email: true } },
    },
  });
}
