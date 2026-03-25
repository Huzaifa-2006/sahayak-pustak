import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function generateFilePath(
  userId: string,
  fileName: string,
  prefix: string = ""
): string {
  const timestamp = Date.now();
  const ext = fileName.split(".").pop();
  const cleanName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()
    .slice(0, 40);
  return `${prefix}${userId}/${timestamp}-${cleanName}.${ext}`;
}

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Semester = (typeof SEMESTERS)[number];

export const SUBJECTS = [
  "Applied Mathematics",
  "Applied Physics",
  "Applied Chemistry",
  "Engineering Mechanics",
  "Basic Electrical Engineering",
  "Basic Electronics",
  "Computer Programming",
  "Data Structures",
  "Discrete Mathematics",
  "Digital Electronics",
  "Signals & Systems",
  "Control Systems",
  "Microprocessors",
  "Computer Networks",
  "Operating Systems",
  "Database Management",
  "Software Engineering",
  "Machine Learning",
  "Artificial Intelligence",
  "Web Technologies",
  "Thermodynamics",
  "Fluid Mechanics",
  "Strength of Materials",
  "Theory of Machines",
  "Manufacturing Processes",
  "Engineering Drawing",
  "Other",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const KARMA_REWARDS = {
  BOOK_DONATION: 300,
  NOTE_UPLOAD: 50,
} as const;
