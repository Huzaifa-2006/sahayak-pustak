"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SEMESTERS, SUBJECTS } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface BookFiltersProps {
  currentSemester?: string;
  currentSubject?: string;
  currentSearch?: string;
  isDonation?: boolean;
}

export function BookFilters({
  currentSemester,
  currentSubject,
  currentSearch,
  isDonation,
}: BookFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch ?? "");
  const debouncedSearch = useDebounce(search, 400);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      if (isDonation) params.set("tab", "donations");
      if (currentSemester) params.set("semester", currentSemester);
      if (currentSubject) params.set("subject", currentSubject);
      if (currentSearch) params.set("search", currentSearch);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, isDonation, currentSemester, currentSubject, currentSearch]
  );

  useEffect(() => {
    updateParams({ search: debouncedSearch || undefined });
  }, [debouncedSearch]); // eslint-disable-line

  const hasFilters = currentSemester || currentSubject || currentSearch;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="input pl-10"
        />
      </div>

      {/* Semester Filter */}
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

      {/* Subject Filter */}
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

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={() => {
            setSearch("");
            router.push(`${pathname}${isDonation ? "?tab=donations" : ""}`);
          }}
          className="btn-secondary px-3 py-2 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
