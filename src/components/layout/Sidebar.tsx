"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Wand2,
  MessageCircle,
  Puzzle,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Projects", icon: FolderOpen },
  { href: "/playground", label: "Playground", icon: Wand2 },
  { href: "/ask-muse", label: "Ask Muse", icon: MessageCircle },
  { href: "/mcp-extensions", label: "MCP Tools", icon: Puzzle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col items-center border-r border-border bg-card py-4 lg:w-56">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 px-3"
      >
        <Sparkles className="h-7 w-7 text-purple-400" />
        <span className="hidden text-lg font-bold text-foreground lg:block">
          Muse Studio
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-2 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/projects")
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <div className="hidden text-xs text-muted-foreground lg:block">
          v0.1.0
        </div>
      </div>
    </aside>
  );
}
