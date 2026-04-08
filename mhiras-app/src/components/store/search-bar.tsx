"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("vintage dress");

  return (
    <div className="max-w-xl mx-auto relative">
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
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-charcoal-soft uppercase tracking-wider cursor-pointer hover:text-charcoal"
        >
          Clear
        </button>
      )}
    </div>
  );
}
