import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const [user1, user2, user3] = await db
    .insert(schema.users)
    .values([
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
        karmaPoints: 950,
        totalBooksDonated: 3,
        totalNotesUploaded: 1,
      },
      {
        name: "Rahul Mehta",
        email: "rahul@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
        karmaPoints: 650,
        totalBooksDonated: 2,
        totalNotesUploaded: 1,
      },
      {
        name: "Anjali Patil",
        email: "anjali@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=anjali",
        karmaPoints: 350,
        totalBooksDonated: 1,
        totalNotesUploaded: 1,
      },
    ])
    .returning();

  console.log("✅ Created 3 users");

  // Create demo books
  await db.insert(schema.books).values([
    {
      title: "Engineering Mathematics - I",
      author: "H.K. Dass",
      subject: "Applied Mathematics",
      semester: 1,
      condition: "good",
      price: 0,
      isDonation: true,
      sellerId: user1.id,
    },
    {
      title: "Basic Electrical Engineering",
      author: "B.L. Theraja",
      subject: "Basic Electrical Engineering",
      semester: 2,
      condition: "new",
      price: 0,
      isDonation: true,
      sellerId: user1.id,
    },
    {
      title: "Data Structures and Algorithms",
      author: "Seymour Lipschutz",
      subject: "Data Structures",
      semester: 3,
      condition: "good",
      price: 0,
      isDonation: true,
      sellerId: user1.id,
    },
    {
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      subject: "Computer Networks",
      semester: 5,
      condition: "good",
      price: 200,
      isDonation: false,
      sellerId: user2.id,
    },
    {
      title: "Operating Systems Concepts",
      author: "Silberschatz & Galvin",
      subject: "Operating Systems",
      semester: 5,
      condition: "fair",
      price: 150,
      isDonation: false,
      sellerId: user2.id,
    },
    {
      title: "Database Management Systems",
      author: "Raghu Ramakrishnan",
      subject: "Database Management",
      semester: 5,
      condition: "new",
      price: 0,
      isDonation: true,
      sellerId: user2.id,
    },
    {
      title: "Machine Learning",
      author: "Tom M. Mitchell",
      subject: "Machine Learning",
      semester: 7,
      condition: "good",
      price: 300,
      isDonation: false,
      sellerId: user3.id,
    },
    {
      title: "Engineering Drawing",
      author: "N.D. Bhatt",
      subject: "Engineering Drawing",
      semester: 1,
      condition: "good",
      price: 0,
      isDonation: true,
      sellerId: user3.id,
    },
  ]);

  console.log("✅ Created 8 books");

  // Create demo notes (using placeholder URLs)
  await db.insert(schema.notes).values([
    {
      title: "Applied Mathematics Unit 1 - Differential Equations",
      subject: "Applied Mathematics",
      semester: 1,
      description: "Complete notes for Unit 1 covering ODEs, PDEs and Laplace transforms.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploaderId: user1.id,
      downloadCount: 42,
    },
    {
      title: "Data Structures - Trees and Graphs",
      subject: "Data Structures",
      semester: 3,
      description: "Binary trees, AVL trees, B-trees, graph traversals.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploaderId: user2.id,
      downloadCount: 78,
    },
    {
      title: "Computer Networks - Full Syllabus Notes",
      subject: "Computer Networks",
      semester: 5,
      description: "All 5 units covered with diagrams and examples.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploaderId: user3.id,
      downloadCount: 31,
    },
  ]);

  console.log("✅ Created 3 notes");
  console.log("🎉 Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
