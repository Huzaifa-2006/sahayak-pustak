"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { SEMESTERS, SUBJECTS } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface NotesFiltersProps {
  currentSemester?: string;
  currentSubject?: string;
  currentSearch?: string;
}

export function NotesFilters({ currentSemester, currentSubject, currentSearch }: NotesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch ?? "");
  const debouncedSearch = useDebounce(search, 400);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (currentSemester) params.set("semester", currentSemester);
    if (currentSubject) params.set("subject", currentSubject);
    if (currentSearch) params.set("search", currentSearch);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    updateParams({ search: debouncedSearch || undefined });
  }, [debouncedSearch]); // eslint-disable-line

  const hasFilters = currentSemester || currentSubject || currentSearch;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input pl-10"
        />
      </div>

      <select
        value={currentSemester ?? ""}
        onChange={(e) => updateParams({ semester: e.target.value || undefined })}
        className="input w-full sm:w-36"
      >
        <option value="">All Semesters</option>
        {SEMESTERS.map((sem) => (
          <option key={sem} value={sem}>Semester {sem}</option>
        ))}
      </select>

      <select
        value={currentSubject ?? ""}
        onChange={(e) => updateParams({ subject: e.target.value || undefined })}
        className="input w-full sm:w-52"
      >
        <option value="">All Subjects</option>
        {SUBJECTS.map((sub) => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); router.push(pathname); }}
          className="btn-secondary px-3 py-2 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
