"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-soft"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for dresses, bags, shoes..."
        className="w-full pl-11 pr-16 py-3.5 text-base rounded bg-white border-none outline-none text-charcoal"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-soft uppercase tracking-wider cursor-pointer hover:text-charcoal"
        >
          Clear
        </button>
      )}
    </form>
  );
}
