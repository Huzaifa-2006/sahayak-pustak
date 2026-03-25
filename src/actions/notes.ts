"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, users } from "../../db/schema";
import { eq, sql, ilike, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { KARMA_REWARDS, generateFilePath } from "@/lib/utils";
import { uploadFile, BUCKETS } from "@/lib/supabase";

const noteSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  subject: z.string().min(1, "Subject is required"),
  semester: z.coerce.number().int().min(1).max(8),
  description: z.string().max(1000).optional(),
});

export type NoteFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  noteId?: string;
};

export async function createNote(formData: FormData): Promise<NoteFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to upload notes." };
  }

  const raw = {
    title: formData.get("title"),
    subject: formData.get("subject"),
    semester: formData.get("semester"),
    description: formData.get("description") || undefined,
  };

  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the form errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Validate PDF file
  const pdfFile = formData.get("pdf") as File | null;
  if (!pdfFile || pdfFile.size === 0) {
    return { success: false, error: "Please upload a PDF file." };
  }
  if (pdfFile.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are allowed for notes." };
  }
  if (pdfFile.size > 25 * 1024 * 1024) {
    return { success: false, error: "PDF must be under 25MB." };
  }

  // Upload PDF to Supabase
  const filePath = generateFilePath(session.user.id, pdfFile.name, "");
  const fileUrl = await uploadFile(BUCKETS.NOTE_PDFS, filePath, pdfFile, {
    contentType: "application/pdf",
  });

  // Insert note
  const [newNote] = await db
    .insert(notes)
    .values({
      title: parsed.data.title,
      subject: parsed.data.subject,
      semester: parsed.data.semester,
      description: parsed.data.description,
      fileUrl,
      uploaderId: session.user.id,
    })
    .returning({ id: notes.id });

  // Award karma (server-side only)
  await db
    .update(users)
    .set({
      karmaPoints: sql`${users.karmaPoints} + ${KARMA_REWARDS.NOTE_UPLOAD}`,
      totalNotesUploaded: sql`${users.totalNotesUploaded} + 1`,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return { success: true, noteId: newNote.id };
}

export async function getNotes(params: {
  semester?: number;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { semester, subject, search, page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (semester) conditions.push(eq(notes.semester, semester));
  if (subject) conditions.push(eq(notes.subject, subject));
  if (search) conditions.push(ilike(notes.title, `%${search}%`));

  const result = await db.query.notes.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      uploader: {
        columns: { id: true, name: true, image: true },
      },
    },
    orderBy: [desc(notes.createdAt)],
    limit,
    offset,
  });

  return result;
}

export async function incrementDownloadCount(noteId: string) {
  await db
    .update(notes)
    .set({ downloadCount: sql`${notes.downloadCount} + 1` })
    .where(eq(notes.id, noteId));
}
