"use client";

import { FileText, Download, GraduationCap, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { incrementDownloadCount } from "@/actions/notes";
import type { NoteWithUploader } from "../../../db/schema";

export function NoteCard({ note }: { note: NoteWithUploader }) {
  const handleDownload = async () => {
    await incrementDownloadCount(note.id);
    window.open(note.fileUrl, "_blank");
  };

  return (
    <div className="card flex flex-col p-5 hover:-translate-y-0.5 transition-all duration-200">
      {/* Icon */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 mb-4">
        <FileText className="h-5 w-5 text-purple-600" />
      </div>

      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-700">
        {note.title}
      </h3>

      {note.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{note.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          Sem {note.semester}
        </span>
        <span className="text-slate-300">·</span>
        <span className="truncate">{note.subject}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 mt-auto">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {note.uploader.name ?? "Anonymous"}
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {note.downloadCount}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-400">{formatRelativeTime(note.createdAt)}</span>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Free Download
        </button>
      </div>
    </div>
  );
}
