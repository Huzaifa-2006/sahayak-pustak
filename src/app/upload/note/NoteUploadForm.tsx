"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createNote } from "@/actions/notes";
import { SEMESTERS, SUBJECTS } from "@/lib/utils";
import { FileText, Upload, Star, X } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  semester: z.coerce.number().int().min(1).max(8),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NoteUploadForm() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { semester: 1 },
  });

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("PDF must be under 25MB");
      return;
    }
    setPdfFile(file);
  };

  const onSubmit = async (values: FormValues) => {
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("subject", values.subject);
    fd.append("semester", String(values.semester));
    if (values.description) fd.append("description", values.description);
    fd.append("pdf", pdfFile);

    const result = await createNote(fd);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Notes uploaded! +50 karma earned 🎉");
      router.push("/notes");
    } else {
      toast.error(result.error ?? "Failed to upload notes");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 flex items-center gap-2 text-sm text-purple-700">
        <Star className="h-4 w-4 fill-current shrink-0" />
        Upload notes and earn <strong>+50 karma points</strong>. All notes are free for everyone!
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Notes Title *</label>
          <input
            {...register("title")}
            placeholder="e.g. Applied Mathematics Unit 1 - Differential Equations"
            className="input"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Subject *</label>
          <select {...register("subject")} className="input">
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="label">Semester *</label>
          <select {...register("semester")} className="input">
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Description (optional)</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="What topics are covered? Any important units?"
            className="input resize-none"
          />
        </div>
      </div>

      {/* PDF Upload */}
      <div>
        <label className="label">PDF File *</label>
        {pdfFile ? (
          <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
            <FileText className="h-8 w-8 text-purple-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{pdfFile.name}</p>
              <p className="text-xs text-slate-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={() => { setPdfFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition-colors text-center"
          >
            <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Click to upload PDF</p>
            <p className="text-xs text-slate-400 mt-1">PDF only, max 25MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
      </div>

      <button type="submit" disabled={isSubmitting || !pdfFile} className="btn-primary w-full py-3 text-base">
        {isSubmitting ? "Uploading..." : "Upload Notes (+50 karma)"}
      </button>
    </form>
  );
}
