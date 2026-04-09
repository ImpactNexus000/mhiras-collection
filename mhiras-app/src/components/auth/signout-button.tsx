"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm text-charcoal-soft hover:text-danger transition-colors mx-auto cursor-pointer"
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
