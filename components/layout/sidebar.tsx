"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Vault,
  Zap,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/recipients", label: "Recipients", icon: Users },
  { href: "/dashboard/treasury", label: "Treasury", icon: Vault },
  { href: "/dashboard/nano", label: "Nano Send", icon: Zap },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside
      className="h-screen w-[15%] min-w-[200px] max-w-[260px] shrink-0 flex flex-col sticky top-0"
      style={{
        background: "rgba(7, 11, 20, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.1) 100%)",
            border: "1px solid rgba(16,185,129,0.3)",
            boxShadow: "0 0 16px rgba(16,185,129,0.2)",
          }}
        >
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-mono font-bold text-sm text-text-primary tracking-tight">
            PointyPay
          </span>
          <span className="text-[10px] text-text-muted font-medium mt-0.5 tracking-wider uppercase">
            Arc + Circle
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-primary"
                      : "text-text-muted hover:text-text-primary"
                  )}
                  style={isActive ? {
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                    boxShadow: "0 0 12px rgba(16, 185, 129, 0.08)",
                  } : {
                    background: "transparent",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                    }
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }}
                    />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "drop-shadow-sm")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-all duration-150"
          style={{ border: "1px solid transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(244, 63, 94, 0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(244, 63, 94, 0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
