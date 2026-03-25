"use server";

import { db } from "@/lib/db";
import { users } from "../../db/schema";
import { desc } from "drizzle-orm";

export async function getLeaderboard(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      image: true,
      karmaPoints: true,
      totalBooksDonated: true,
      totalNotesUploaded: true,
      createdAt: true,
    },
    orderBy: [desc(users.karmaPoints)],
    limit,
    offset,
  });

  return result;
}

export async function getUserDashboard(userId: string) {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      karmaPoints: true,
      totalBooksDonated: true,
      totalNotesUploaded: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const userBooks = await db.query.books.findMany({
    where: (b, { eq }) => eq(b.sellerId, userId),
    orderBy: (b, { desc }) => [desc(b.createdAt)],
    limit: 5,
  });

  const userNotes = await db.query.notes.findMany({
    where: (n, { eq }) => eq(n.uploaderId, userId),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 5,
  });

  // Get rank
  const allUsers = await db.query.users.findMany({
    columns: { id: true, karmaPoints: true },
    orderBy: [desc(users.karmaPoints)],
  });
  const rank = allUsers.findIndex((u) => u.id === userId) + 1;

  return { user, userBooks, userNotes, rank };
}
