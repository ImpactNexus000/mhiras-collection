"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersSearchProps {
  initialSearch: string;
  status?: string;
}

export function OrdersSearch({ initialSearch, status }: OrdersSearchProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (searchValue) params.set("search", searchValue);
      router.push(`/admin/orders?${params.toString()}`);
    },
    [searchValue, status, router]
  );

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white border border-border rounded-lg p-3 flex items-center gap-3 mb-4"
    >
      <div className="flex-1 flex items-center gap-2 border border-border rounded px-3 py-2">
        <Search size={14} className="text-charcoal-soft" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by order ID, customer name, or email..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Search
      </Button>
    </form>
  );
}
